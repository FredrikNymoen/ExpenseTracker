import { BrowserRouter, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import Transactions from "./pages/Transactions"
import ProtectedLayout from "./components/layout/ProtectedLayout"
import { ProtectedRoute } from "./pages/ProtectedRoute"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/transactions" element={<Transactions />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  )
}