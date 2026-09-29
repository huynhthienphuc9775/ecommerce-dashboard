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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/api/categories'
import { getErrorMessage } from '@/lib/get-error-message'
import type { Category } from '@/types/category'

export function CategoriesPage() {
  const queryClient = useQueryClient()

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const [name, setName] = useState('')

  function openCreateForm() {
    setEditingCategory(null)
    setName('')
    createMutation.reset()
    setFormOpen(true)
  }

  function openEditForm(category: Category) {
    setEditingCategory(category)
    setName(category.name)
    updateMutation.reset()
    setFormOpen(true)
  }

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setFormOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setFormOpen(false)
    },
  })

  const isDeletingRef = useRef(false)

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setDeletingCategory(null)
    },
    onSettled: () => {
      isDeletingRef.current = false
    },
  })

  function openDeleteDialog(category: Category) {
    deleteMutation.reset()
    setDeletingCategory(category)
  }

  function handleDelete() {
    if (isDeletingRef.current || !deletingCategory) return
    isDeletingRef.current = true
    deleteMutation.mutate(deletingCategory.id)
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) return

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, name: trimmedName })
      return
    }

    createMutation.mutate({ name: trimmedName })
  }

  const formMutation = editingCategory ? updateMutation : createMutation

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Danh mục</h1>
        <Button onClick={openCreateForm}>Thêm danh mục</Button>
      </div>

      <div className="mt-6 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead className="w-32 text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoriesQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            )}
            {categoriesQuery.isError && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-destructive">
                  {getErrorMessage(categoriesQuery.error)}
                </TableCell>
              </TableRow>
            )}
            {categoriesQuery.isSuccess && categoriesQuery.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Chưa có danh mục nào.
                </TableCell>
              </TableRow>
            )}
            {categoriesQuery.data?.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditForm(category)}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => openDeleteDialog(category)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
            </DialogTitle>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Tên danh mục</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên danh mục"
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
                disabled={formMutation.isPending || !name.trim()}
              >
                {formMutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa danh mục?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. "{deletingCategory?.name}" sẽ bị
              xóa vĩnh viễn.
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
