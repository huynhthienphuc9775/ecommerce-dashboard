import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'

export function Header() {
  const logout = useAuthStore((state) => state.logout)

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
      <span className="text-base font-medium">Admin Dashboard</span>
      <Button variant="ghost" size="sm" onClick={logout}>
        <LogOut className="size-4" />
        Đăng xuất
      </Button>
    </header>
  )
}
