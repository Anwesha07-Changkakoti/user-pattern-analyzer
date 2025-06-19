export default function Unauthorized() {
  return (
    <div className="p-6 text-red-500">
      <h2 className="text-xl font-bold">Access Denied</h2>
      <p>You do not have permission to view this page.</p>
    </div>
  );
}
