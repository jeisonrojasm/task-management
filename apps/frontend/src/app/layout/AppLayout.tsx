import { Outlet } from 'react-router-dom'

import { Sidebar } from '@/app/layout/Sidebar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="md:pl-64">
        <div className="min-h-screen px-4 py-6 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
