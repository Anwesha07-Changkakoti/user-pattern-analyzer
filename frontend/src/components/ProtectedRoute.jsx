import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ roles = [], children }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="p-6 text-cybergreen">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;


  return children;
}
