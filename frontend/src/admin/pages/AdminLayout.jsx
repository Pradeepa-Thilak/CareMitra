import React from 'react'
import AdminNavbar from '../components/AdminNavbar'
import { Outlet } from 'react-router-dom'

function AdminLayout() {
  return (
    <div className='min-h-screen bg-gray-100'>
        <AdminNavbar />
        <main className="p-6">
            <Outlet />
        </main>
    </div>
  )
}

export default AdminLayout