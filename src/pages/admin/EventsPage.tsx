import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type SubmitEvent, useEffect, useRef, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getCategories } from '@/api/categories'
import { createEvent, deleteEvent, getEvents, updateEvent } from '@/api/events'
import { getErrorMessage } from '@/lib/get-error-message'
import { toast } from '@/lib/toast'
import type { Event } from '@/types/event'

const PAGE_SIZE = 10
const ALL_CATEGORIES = 'all'

export function EventsPage() {
  const queryClient = useQueryClient()

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const categories = categoriesQuery.data ?? []

  function getCategoryName(id: number) {
    return categories.find((category) => category.id === id)?.name ?? `#${id}`
  }

  const [page, setPage] = useState(1)
  const [filterCategory, setFilterCategory] = useState<string>(ALL_CATEGORIES)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const eventsQuery = useQuery({
    queryKey: ['events', { page, filterCategory, search }],
    queryFn: () =>
      getEvents({
        page,
        limit: PAGE_SIZE,
        categoryId:
          filterCategory === ALL_CATEGORIES ? undefined : Number(filterCategory),
        search: search || undefined,
      }),
  })

  function handleFilterCategoryChange(value: string) {
    setFilterCategory(value)
    setPage(1)
  }

  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null)

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [image, setImage] = useState<File | null>(null)

  function openCreateForm() {
    setEditingEvent(null)
    setName('')
    setCategoryId(categories[0] ? String(categories[0].id) : '')
    setImage(null)
    createMutation.reset()
    setFormOpen(true)
  }

  function openEditForm(event: Event) {
    setEditingEvent(event)
    setName(event.name)
    setCategoryId(String(event.categoryId))
    setImage(null)
    updateMutation.reset()
    setFormOpen(true)
  }

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event-options'] })
      toast.success(`Đã thêm sự kiện "${event.name}"`)
      setFormOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event-options'] })
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      toast.success(`Đã cập nhật sự kiện "${event.name}"`)
      setFormOpen(false)
    },
  })

  const isDeletingRef = useRef(false)

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event-options'] })
      toast.success(`Đã xóa sự kiện "${deletingEvent?.name}"`)
      setDeletingEvent(null)
    },
    onSettled: () => {
      isDeletingRef.current = false
    },
  })

  function openDeleteDialog(event: Event) {
    deleteMutation.reset()
    setDeletingEvent(event)
  }

  function handleDelete() {
    if (isDeletingRef.current || !deletingEvent) return
    isDeletingRef.current = true
    deleteMutation.mutate(deletingEvent.id)
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName || !categoryId) return

    if (editingEvent) {
      updateMutation.mutate({
        id: editingEvent.id,
        name: trimmedName,
        categoryId: Number(categoryId),
        image: image ?? undefined,
      })
      return
    }

    if (!image) return
    createMutation.mutate({
      name: trimmedName,
      categoryId: Number(categoryId),
      image,
    })
  }

  const formMutation = editingEvent ? updateMutation : createMutation
  const hasCategories = categories.length > 0

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sự kiện</h1>
        <Button onClick={openCreateForm} disabled={!hasCategories}>
          Thêm sự kiện
        </Button>
      </div>

      {categoriesQuery.isSuccess && !hasCategories && (
        <p className="mt-4 text-sm text-muted-foreground">
          Cần tạo ít nhất một danh mục trước khi thêm sự kiện.
        </p>
      )}

      <div className="mt-4 flex gap-3">
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

        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Tìm theo tên sự kiện"
          className="w-64"
        />
      </div>

      <div className="mt-4 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Ảnh</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead className="w-32 text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventsQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            )}
            {eventsQuery.isError && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-destructive">
                  {getErrorMessage(eventsQuery.error)}
                </TableCell>
              </TableRow>
            )}
            {eventsQuery.isSuccess && eventsQuery.data.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Chưa có sự kiện nào.
                </TableCell>
              </TableRow>
            )}
            {eventsQuery.data?.data.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <img
                    src={event.imageUrl}
                    alt={event.name}
                    className="size-10 rounded object-cover"
                  />
                </TableCell>
                <TableCell>{event.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {event.category?.name ?? getCategoryName(event.categoryId)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditForm(event)}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => openDeleteDialog(event)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {eventsQuery.isSuccess && eventsQuery.data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {eventsQuery.data.page}/{eventsQuery.data.totalPages} — Tổng{' '}
            {eventsQuery.data.total} sự kiện
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
              disabled={page >= eventsQuery.data.totalPages}
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
              {editingEvent ? 'Sửa sự kiện' : 'Thêm sự kiện'}
            </DialogTitle>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Tên sự kiện</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên sự kiện"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="categoryId">Danh mục</Label>
              <Select
                value={categoryId}
                onValueChange={(value) => setCategoryId(value as string)}
              >
                <SelectTrigger id="categoryId" className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      value ? getCategoryName(Number(value)) : 'Chọn danh mục'
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="image">
                Ảnh {editingEvent && '(để trống nếu không đổi ảnh)'}
              </Label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
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
                  !name.trim() ||
                  !categoryId ||
                  (!editingEvent && !image)
                }
              >
                {formMutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deletingEvent)}
        onOpenChange={(open) => !open && setDeletingEvent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sự kiện?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. "{deletingEvent?.name}" sẽ bị xóa
              vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteMutation.isError && (
            <p className="text-sm text-destructive">
              {getErrorMessage(deleteMutation.error)}
            </p>
          )}
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
