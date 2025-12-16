import React from 'react'
import { Route } from 'react-router-dom'
import AdminLayout from '../pages/AdminLayout'
import Doctors from '../pages/Doctors';
import Dashboard from '../pages/Dashboard';
import LabTests from '../pages/LabTests';
import Patients from '../pages/Patients';
import LabStaffs from '../pages/LabStaffs';
import Medicines from '../pages/Medicines';
import Orders from '../pages/Orders';
import Consultations from '../pages/Consultations';

const AdminRoutes = (

    <Route path='/admin'
    element={
        <AdminLayout />
    } >
        <Route index element={<Dashboard />} />
        <Route path='doctors' element={<Doctors />} />
        <Route path='lab-tests' element={<LabTests />} />
        <Route path='patients' element={<Patients />} />
        <Route path='lab-staff' element={ <LabStaffs />} />
        <Route path='medicines' element={<Medicines />} />
        <Route path='orders' element={<Orders />} />
        <Route path='consultations' element={<Consultations />} />
    </Route>
);


export default AdminRoutes;