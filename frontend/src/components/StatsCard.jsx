export default function StatsCard({ title, value }) {
  return (
    <div className="border border-cybergreen rounded p-4 text-center">
      <h3 className="font-bold">{title}</h3>
      <p className="text-2xl">{value}</p>
    </div>
  );
}
