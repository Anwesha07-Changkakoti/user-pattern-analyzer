import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, role, login, logout } = useAuth();
  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-cybergreen">
      <span className="text-cybergreen font-bold">User Pattern Analyzer</span>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        
        {user && (
          <Link to="/history" className="hover:underline">Past Results</Link>

        )}
        {user ? (
          <button onClick={logout} className="ml-4 underline">
            Logout
          </button>
        ) : (
          <button onClick={login} className="ml-4 underline">
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
