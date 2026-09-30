import { useQuery } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getUsers } from '@/api/users'
import { getErrorMessage } from '@/lib/get-error-message'

export function UsersPage() {
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold">Người dùng</h1>

      <div className="mt-6 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            )}
            {usersQuery.isError && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-destructive">
                  {getErrorMessage(usersQuery.error)}
                </TableCell>
              </TableRow>
            )}
            {usersQuery.isSuccess && usersQuery.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Chưa có người dùng nào.
                </TableCell>
              </TableRow>
            )}
            {usersQuery.data?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
