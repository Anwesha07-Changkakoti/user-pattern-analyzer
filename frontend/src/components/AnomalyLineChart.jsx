import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function AnomalyLineChart({ data }) {
  
  return (
    <div className="bg-black border border-cybergreen rounded p-4">
      <h2 className="text-xl font-bold text-cybergreen mb-4">Anomaly Timeline</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#333" />
          <XAxis dataKey="index" stroke="#00FF00" />
          <YAxis stroke="#00FF00" />
          <Tooltip />
          <Line type="linear" dataKey="anomaly" stroke="red" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
