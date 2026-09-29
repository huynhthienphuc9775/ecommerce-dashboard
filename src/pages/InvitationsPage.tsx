import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type SubmitEvent, useRef, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getCategories } from '@/api/categories'
import { getEventOptions } from '@/api/events'
import {
  createInvitation,
  deleteInvitation,
  getInvitations,
  updateInvitation,
} from '@/api/invitations'
import { getErrorMessage } from '@/lib/get-error-message'
import type { Invitation } from '@/types/invitation'

const PAGE_SIZE = 10
const ALL_EVENTS = 'all'
const ALL_CATEGORIES = 'all'

type ActiveFilter = 'all' | 'active' | 'inactive'

export function InvitationsPage() {
  const queryClient = useQueryClient()

  const eventsQuery = useQuery({
    queryKey: ['event-options'],
    queryFn: getEventOptions,
  })

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const events = eventsQuery.data ?? []
  const categories = categoriesQuery.data ?? []

  function getEventName(id: number) {
    return events.find((event) => event.id === id)?.name ?? `#${id}`
  }

  function getCategoryName(id: number) {
    return categories.find((category) => category.id === id)?.name ?? `#${id}`
  }

  const [page, setPage] = useState(1)
  const [filterEvent, setFilterEvent] = useState<string>(ALL_EVENTS)
  const [filterCategory, setFilterCategory] = useState<string>(ALL_CATEGORIES)
  const [filterActive, setFilterActive] = useState<ActiveFilter>('all')

  const invitationsQuery = useQuery({
    queryKey: [
      'invitations',
      { page, filterEvent, filterCategory, filterActive },
    ],
    queryFn: () =>
      getInvitations({
        page,
        limit: PAGE_SIZE,
        eventId: filterEvent === ALL_EVENTS ? undefined : Number(filterEvent),
        categoryId:
          filterCategory === ALL_CATEGORIES ? undefined : Number(filterCategory),
        active: filterActive === 'all' ? undefined : filterActive === 'active',
      }),
  })

  function handleFilterEventChange(value: string) {
    setFilterEvent(value)
    setPage(1)
  }

  function handleFilterCategoryChange(value: string) {
    setFilterCategory(value)
    setPage(1)
  }

  function handleFilterActiveChange(value: ActiveFilter) {
    setFilterActive(value)
    setPage(1)
  }

  const [formOpen, setFormOpen] = useState(false)
  const [editingInvitation, setEditingInvitation] = useState<Invitation | null>(
    null,
  )
  const [deletingInvitation, setDeletingInvitation] =
    useState<Invitation | null>(null)

  const [eventId, setEventId] = useState<string>('')
  const [image, setImage] = useState<File | null>(null)
  const [active, setActive] = useState(true)

  function openCreateForm() {
    setEditingInvitation(null)
    setEventId(events[0] ? String(events[0].id) : '')
    setImage(null)
    setActive(true)
    createMutation.reset()
    setFormOpen(true)
  }

  function openEditForm(invitation: Invitation) {
    setEditingInvitation(invitation)
    setEventId(String(invitation.eventId))
    setImage(null)
    setActive(invitation.active)
    updateMutation.reset()
    setFormOpen(true)
  }

  const createMutation = useMutation({
    mutationFn: createInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      setFormOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      setFormOpen(false)
    },
  })

  const isDeletingRef = useRef(false)

  const deleteMutation = useMutation({
    mutationFn: deleteInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      setDeletingInvitation(null)
    },
    onSettled: () => {
      isDeletingRef.current = false
    },
  })

  function handleDelete() {
    if (isDeletingRef.current || !deletingInvitation) return
    isDeletingRef.current = true
    deleteMutation.mutate(deletingInvitation.id)
  }

  const toggleActiveMutation = useMutation({
    mutationFn: updateInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
    },
  })

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()

    if (!eventId) return

    if (editingInvitation) {
      updateMutation.mutate({
        id: editingInvitation.id,
        eventId: Number(eventId),
        image: image ?? undefined,
        active,
      })
      return
    }

    if (!image) return
    createMutation.mutate({ eventId: Number(eventId), image, active })
  }

  const formMutation = editingInvitation ? updateMutation : createMutation
  const hasEvents = events.length > 0

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Thiệp mời</h1>
        <Button onClick={openCreateForm} disabled={!hasEvents}>
          Thêm thiệp mời
        </Button>
      </div>

      {eventsQuery.isSuccess && !hasEvents && (
        <p className="mt-4 text-sm text-muted-foreground">
          Cần tạo ít nhất một sự kiện trước khi thêm thiệp mời.
        </p>
      )}

      <div className="mt-4 flex gap-3">
        <Select
          value={filterEvent}
          onValueChange={(value) => handleFilterEventChange(value as string)}
        >
          <SelectTrigger className="w-48">
            <SelectValue>
              {(value: string) =>
                value === ALL_EVENTS
                  ? 'Tất cả sự kiện'
                  : getEventName(Number(value))
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_EVENTS}>Tất cả sự kiện</SelectItem>
            {events.map((event) => (
              <SelectItem key={event.id} value={String(event.id)}>
                {event.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterCategory}
          onValueChange={(value) => handleFilterCategoryChange(value as string)}
        >
          <SelectTrigger className="w-48">
            <SelectValue>
              {(value: string) =>
                value === ALL_CATEGORIES
                  ? 'Tất cả danh mục'
                  : getCategoryName(Number(value))
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>Tất cả danh mục</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterActive}
          onValueChange={(value) =>
            handleFilterActiveChange(value as ActiveFilter)
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue>
              {(value: ActiveFilter) =>
                value === 'all'
                  ? 'Tất cả trạng thái'
                  : value === 'active'
                    ? 'Hoạt động'
                    : 'Tạm ẩn'
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="inactive">Tạm ẩn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Ảnh</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Sự kiện</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-32 text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitationsQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            )}
            {invitationsQuery.isError && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-destructive">
                  {getErrorMessage(invitationsQuery.error)}
                </TableCell>
              </TableRow>
            )}
            {invitationsQuery.isSuccess &&
              invitationsQuery.data.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Chưa có thiệp mời nào.
                  </TableCell>
                </TableRow>
              )}
            {invitationsQuery.data?.data.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell>
                  <img
                    src={invitation.imageUrl}
                    alt={invitation.name}
                    className="size-10 rounded object-cover"
                  />
                </TableCell>
                <TableCell>{invitation.name}</TableCell>
                <TableCell>
                  {invitation.event?.name ?? getEventName(invitation.eventId)}
                </TableCell>
                <TableCell>
                  {invitation.event?.category ? (
                    <Badge variant="outline">
                      {invitation.event.category.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={invitation.active}
                      disabled={
                        toggleActiveMutation.isPending &&
                        toggleActiveMutation.variables?.id === invitation.id
                      }
                      onCheckedChange={(checked) =>
                        toggleActiveMutation.mutate({
                          id: invitation.id,
                          active: checked,
                        })
                      }
                    />
                    <Badge variant={invitation.active ? 'default' : 'secondary'}>
                      {invitation.active ? 'Hoạt động' : 'Tạm ẩn'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditForm(invitation)}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setDeletingInvitation(invitation)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {invitationsQuery.isSuccess && invitationsQuery.data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {invitationsQuery.data.page}/
            {invitationsQuery.data.totalPages} — Tổng{' '}
            {invitationsQuery.data.total} thiệp mời
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= invitationsQuery.data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingInvitation ? 'Sửa thiệp mời' : 'Thêm thiệp mời'}
            </DialogTitle>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="eventId">Sự kiện</Label>
              <Select
                value={eventId}
                onValueChange={(value) => setEventId(value as string)}
              >
                <SelectTrigger id="eventId" className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      value ? getEventName(Number(value)) : 'Chọn sự kiện'
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={String(event.id)}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="image">
                Ảnh {editingInvitation && '(để trống nếu không đổi ảnh)'}
              </Label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="active" checked={active} onCheckedChange={setActive} />
              <Label htmlFor="active">Kích hoạt</Label>
            </div>
            {formMutation.isError && (
              <p className="text-sm text-destructive">
                {getErrorMessage(formMutation.error)}
              </p>
            )}
            <DialogFooter>
              <Button
                type="submit"
                disabled={
                  formMutation.isPending ||
                  !eventId ||
                  (!editingInvitation && !image)
                }
              >
                {formMutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deletingInvitation)}
        onOpenChange={(open) => !open && setDeletingInvitation(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa thiệp mời?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. "{deletingInvitation?.name}" sẽ
              bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
