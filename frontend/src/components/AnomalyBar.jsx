import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AnomalyBar({ summary }) {
  if (!summary) return null;
  const data = [
    { type: "Anomalies", count: summary.anomalies },
    { type: "Normal", count: summary.normal },
  ];
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
