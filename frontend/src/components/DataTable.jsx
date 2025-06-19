export default function DataTable({ rows, title, height = 300 }) {
  if (!rows || !rows.length) return null;

  const columns = Object.keys(rows[0]);

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <div
        className="overflow-y-auto border border-cybergreen"
        style={{ maxHeight: height }}
      >
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-black">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-2 py-1 border-b border-cybergreen text-left capitalize"
                >
                  {col.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={row.anomaly === 1 ? "bg-red-800 text-white" : ""}
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className={`px-2 py-1 border-b border-cybergreen ${
                      col === "anomaly_reason" ? "italic text-green-400" : ""
                    }`}
                    title={col === "anomaly_reason" ? row[col] : undefined}
                  >
                    {row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
