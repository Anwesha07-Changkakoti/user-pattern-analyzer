import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function LiveBarChart({ dataStream }) {
  const chartRef = useRef(null);
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    if (!dataStream?.length) return;
    const row = dataStream[0];
    const timestamp = new Date().toLocaleTimeString();
    const value = row.packet_count ?? Math.floor(Math.random() * 100);
    const anomaly = row.anomaly === 1;

    setLabels((prev) => [...prev.slice(-9), timestamp]);
    setValues((prev) => [...prev.slice(-9), value]);
    setColors((prev) => [...prev.slice(-9), anomaly ? "red" : "limegreen"]);
  }, [dataStream]);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Live Packet Count",
        data: values,
        backgroundColor: colors,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: {
      duration: 500,
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "lime" },
      },
      x: {
        ticks: { color: "lime" },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const isAnomaly = context.dataset.backgroundColor[context.dataIndex] === "red";
            const label = context.dataset.label || "";
            return `${label}: ${value} (${isAnomaly ? "Anomaly" : "Normal"})`;
          },
        },
      },
      legend: {
        labels: {
          color: "lime",
        },
      },
    },
  };

  const downloadChart = () => {
    const chart = chartRef.current;
    if (!chart) return;
    const base64 = chart.toBase64Image();
    const link = document.createElement("a");
    link.href = base64;
    link.download = "live-bar-chart.png";
    link.click();
  };

  return (
    <div className="mt-4 border border-green-500 p-4 rounded-xl relative"
    style={{ maxWidth: "800px", margin: "auto" }}
    >
      <h3 className="text-lg text-cybergreen font-semibold mb-2">Live Bar Chart</h3>

      <div className="text-lime-400 font-bold mb-2">
        Anomalies (last 10): {colors.filter((c) => c === "red").length}
      </div>

      <button
        onClick={downloadChart}
        className="absolute right-4 top-4 px-3 py-1 bg-green-800 text-white rounded hover:bg-green-600 text-sm"
      >
        Download PNG
      </button>

      <Bar ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
