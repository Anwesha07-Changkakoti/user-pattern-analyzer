import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

export default function ResultsHistory() {
  const [rows, setRows] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filenameFilter, setFilenameFilter] = useState("");
  const [error, setError] = useState("");

  // 🔄 fetch with token helper
  const fetchHistory = async (token) => {
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await axios.get("http://localhost:8000/results/history", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setRows(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load history.");
    }
  };

  // ⏳ wait for Firebase to initialise / token refresh
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        fetchHistory(token);
      } else {
        setError("You must be logged in to view past results.");
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]); // refetch if date filters change

  // 🔍 local filename filter (case‑insensitive)
  const filtered = rows.filter((r) =>
    (r.file_name || "")
      .toLowerCase()
      .includes(filenameFilter.toLowerCase())
  );

  if (error) {
    return <p className="text-red-500 p-4">{error}</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl text-green-400 font-bold mb-4">Past Results</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Start dd-mm-yyyy"
          className="border px-2 py-1"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="End dd-mm-yyyy"
          className="border px-2 py-1"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by filename"
          className="border px-2 py-1"
          value={filenameFilter}
          onChange={(e) => setFilenameFilter(e.target.value)}
        />
        <button
          className="bg-green-600 px-4 py-1 text-white rounded"
          onClick={async () => {
            const token = await getAuth().currentUser?.getIdToken();
            if (token) fetchHistory(token);
          }}
        >
          Search
        </button>
      </div>

      <table className="w-full text-left border border-green-500">
        <thead>
          <tr className="bg-black text-green-500 border-b border-green-500">
            <th className="p-2">File Name</th>
            <th className="p-2">Timestamp</th>
            <th className="p-2">Total Records</th>
            <th className="p-2">Anomalies</th>
            <th className="p-2">Download</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, i) => (
            <tr
              key={i}
              className="border-b border-green-600 text-green-200 hover:bg-green-900"
            >
              <td className="p-2">{r.file_name}</td>
              <td className="p-2">{r.timestamp}</td>
              <td className="p-2">{r.total_records}</td>
              <td className="p-2 text-red-500 font-semibold">
                {r.anomaly_count}
              </td>
              <td className="p-2">
                <a
                  className="text-blue-400 underline"
                  href={`http://localhost:8000/results/download/${r.file_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CSV
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
