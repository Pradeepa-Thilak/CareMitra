import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Heart } from 'lucide-react';

const linkClass = ({ isActive }) =>
  `px-4 py-2 rounded-md text-sm font-medium transition
   ${
     isActive
       ? "bg-gray-700 text-white"
       : "text-gray-300 hover:bg-gray-700 hover:text-white"
   }`;

function AdminNavbar() {
  return (
    <nav className="bg-gray-900 px-6 py-4 flex gap-3">
      <div className="container-custom flex items-center justify-between px-4 md:px-6 py-3">

        <Link to="/admin" className="flex items-center gap-2 text-white">
              <Heart className="w-6 h-6 text-white" />
              <span className="text-2xl font-semibold tracking-wide">CareMitra</span>
        </Link>
        <NavLink to="/admin/lab-tests" end className={linkClass}>
          Lab Tests
        </NavLink>
        <NavLink to="/admin/doctors" end className={linkClass}>
          Doctors
        </NavLink>
        <NavLink to='/admin/lab-staff' end className={linkClass}>
          Lab Staff 
        </NavLink>
        <NavLink to='/admin/patients' end className={linkClass}>
          Patients 
        </NavLink>
        <NavLink to='/admin/medicines' end className={linkClass}>
          Medicines
        </NavLink>
        <NavLink to='/admin/orders' end className={linkClass}>
          Orders
        </NavLink>
      </div>
    </nav>
  )
}

export default AdminNavbar