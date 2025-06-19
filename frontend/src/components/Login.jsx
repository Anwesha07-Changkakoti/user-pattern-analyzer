import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-cybergreen">Login</h2>
      <button
        onClick={login}
        className="mt-4 px-4 py-2 bg-cybergreen text-black rounded"
      >
        Sign in with Google
      </button>
    </div>
  );
}
