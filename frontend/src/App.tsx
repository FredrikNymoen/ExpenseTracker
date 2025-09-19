import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Transactions from "./pages/Transactions";
import ProtectedLayout from "./components/layout/ProtectedLayout";
import { ProtectedRoute } from "./pages/ProtectedRoute";
import Callback from "./pages/Callback";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Callback */}
        <Route path="/callback" element={<Callback />} />

        {/* Public pages */}
        <Route path="/login" element={<Login />} />

        {/* Protected pages */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
