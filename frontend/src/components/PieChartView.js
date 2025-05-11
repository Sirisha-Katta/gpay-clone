import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import axios from "axios";

function PieChartView() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          console.error("No user ID found in localStorage.");
          return;
        }

        const response = await axios.get(`http://127.0.0.1:8000/pie-chart-data/${userId}`);
        console.log("Pie chart API Response:", response.data); // Debugging log

        if (response.data && Array.isArray(response.data.data)) {
          const formattedData = response.data.data.map((item) => ({
            name: item.subcategory ? `${item.label} (${item.subcategory})` : item.label,
            value: item.amount,
            color: item.color,
          }));

          console.log("Formatted Data for Pie Chart:", formattedData); // Debugging log
          setData(formattedData);
        } else {
          console.warn("Invalid pie chart data format.");
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching pie chart data:", error);
        setData([]);
      }
    };

    fetchData();
  }, []);

  const COLORS = data.map((item) => item.color); // Use colors from the backend

  if (data.length === 0) {
    console.log("No data available for the pie chart."); // Log when no data is available
    return <p>No data available for the pie chart.</p>;
  }

  console.log("Rendering pie chart with data:", data); // Log data before rendering

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={150}
        fill="#8884d8"
        label
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}

export default PieChartView;
