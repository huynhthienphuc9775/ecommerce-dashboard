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
import {
  createInvitation,
  deleteInvitation,
  getInvitations,
  updateInvitation,
} from '@/api/invitations'
import { getErrorMessage } from '@/lib/get-error-message'
import { type Invitation, InvitationType } from '@/types/invitation'

const TYPE_LABELS: Record<InvitationType, string> = {
  [InvitationType.WEDDING]: 'Đám cưới',
  [InvitationType.BIRTHDAY]: 'Sinh nhật',
}

const TYPE_BADGE_CLASSNAME: Record<InvitationType, string> = {
  [InvitationType.WEDDING]:
    'bg-rose-100! text-rose-700! dark:bg-rose-500/20! dark:text-rose-300!',
  [InvitationType.BIRTHDAY]:
    'bg-amber-100! text-amber-700! dark:bg-amber-500/20! dark:text-amber-300!',
}

const PAGE_SIZE = 10

type ActiveFilter = 'all' | 'active' | 'inactive'

export function InvitationsPage() {
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [filterType, setFilterType] = useState<InvitationType | 'all'>('all')
  const [filterActive, setFilterActive] = useState<ActiveFilter>('all')

  const invitationsQuery = useQuery({
    queryKey: ['invitations', { page, filterType, filterActive }],
    queryFn: () =>
      getInvitations({
        page,
        limit: PAGE_SIZE,
        type: filterType === 'all' ? undefined : filterType,
        active: filterActive === 'all' ? undefined : filterActive === 'active',
      }),
  })

  function handleFilterTypeChange(value: InvitationType | 'all') {
    setFilterType(value)
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

  const [type, setType] = useState<InvitationType>(InvitationType.WEDDING)
  const [image, setImage] = useState<File | null>(null)
  const [active, setActive] = useState(true)

  function openCreateForm() {
    setEditingInvitation(null)
    setType(InvitationType.WEDDING)
    setImage(null)
    setActive(true)
    createMutation.reset()
    setFormOpen(true)
  }

  function openEditForm(invitation: Invitation) {
    setEditingInvitation(invitation)
    setType(invitation.type)
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

    if (editingInvitation) {
      updateMutation.mutate({
        id: editingInvitation.id,
        type,
        image: image ?? undefined,
        active,
      })
      return
    }

    if (!image) return
    createMutation.mutate({ type, image, active })
  }

  const formMutation = editingInvitation ? updateMutation : createMutation

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Thiệp mời</h1>
        <Button onClick={openCreateForm}>Thêm thiệp mời</Button>
      </div>

      <div className="mt-4 flex gap-3">
        <Select
          value={filterType}
          onValueChange={(value) =>
            handleFilterTypeChange(value as InvitationType | 'all')
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue>
              {(value: InvitationType | 'all') =>
                value === 'all' ? 'Tất cả loại' : TYPE_LABELS[value]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value={InvitationType.WEDDING}>Đám cưới</SelectItem>
            <SelectItem value={InvitationType.BIRTHDAY}>Sinh nhật</SelectItem>
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
              <TableHead>Loại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-32 text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitationsQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            )}
            {invitationsQuery.isError && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-destructive">
                  {getErrorMessage(invitationsQuery.error)}
                </TableCell>
              </TableRow>
            )}
            {invitationsQuery.isSuccess &&
              invitationsQuery.data.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
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
                  <Badge
                    variant="outline"
                    className={TYPE_BADGE_CLASSNAME[invitation.type]}
                  >
                    {TYPE_LABELS[invitation.type]}
                  </Badge>
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
              <Label htmlFor="type">Loại</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as InvitationType)}
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue>
                    {(value: InvitationType) => TYPE_LABELS[value]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={InvitationType.WEDDING}>
                    Đám cưới
                  </SelectItem>
                  <SelectItem value={InvitationType.BIRTHDAY}>
                    Sinh nhật
                  </SelectItem>
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
                  formMutation.isPending || (!editingInvitation && !image)
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
