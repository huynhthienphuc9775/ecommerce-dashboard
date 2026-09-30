import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/admin/AppSidebar'
import { Header } from '@/components/admin/Header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export function AdminLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
