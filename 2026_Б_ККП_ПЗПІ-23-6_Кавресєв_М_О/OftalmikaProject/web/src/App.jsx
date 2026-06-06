import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import DoctorRegisterPage from "./pages/DoctorRegisterPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import DoctorDashboardPage from "./pages/DoctorDashboardPage.jsx";
import DoctorProfilePage from "./pages/DoctorProfilePage.jsx";
import DoctorConductVisitPage from "./pages/DoctorConductVisitPage.jsx";
import DoctorCompletedVisitPage from "./pages/DoctorCompletedVisitPage.jsx";
import DoctorMedicalRecordsPage from "./pages/DoctorMedicalRecordsPage.jsx";
import DoctorPrescriptionsPage from "./pages/DoctorPrescriptionsPage.jsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/doctor-register" element={<DoctorRegisterPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/doctor" element={<DoctorDashboardPage />} />
            <Route path="/doctor/profile" element={<DoctorProfilePage />} />
            <Route path="/doctor/visit/:visitId" element={<DoctorConductVisitPage />} />
            <Route path="/doctor/completed-visit/:visitId" element={<DoctorCompletedVisitPage />} />
            <Route path="/doctor/medical-records" element={<DoctorMedicalRecordsPage />} />
            <Route path="/doctor/prescriptions" element={<DoctorPrescriptionsPage />} />
        </Routes>
    );
}

export default App;
