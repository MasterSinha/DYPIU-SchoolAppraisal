import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import AdministrativeDashboard from "./pages/administrative/AdministrativeDashboard";
import DirectorDashboard from "./pages/director/DirectorDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/director/dashboard" element={<DirectorDashboard />} />
        <Route path="/administrative/dashboard" element={<AdministrativeDashboard />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
