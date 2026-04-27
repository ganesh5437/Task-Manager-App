import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div style={{padding:'4rem',textAlign:'center'}}>Loading...</div>;
  return token ? children : <Navigate to="/" />;
}

function PublicRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div style={{padding:'4rem',textAlign:'center'}}>Loading...</div>;
  return !token ? children : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/companies" element={<PrivateRoute><Companies /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;