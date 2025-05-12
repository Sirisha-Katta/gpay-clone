import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // Import toast

function LabelsDropdown() {
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const response = await axios.get("https://gpay-clone.onrender.com/get-labels/");
        console.log("Fetched Labels:", response.data.labels); // Debugging log
        setLabels(response.data.labels); // Set labels in state
      } catch (error) {
        console.error("Error fetching labels:", error);
        toast.error("Failed to fetch labels. Please try again later."); // Show error toast
      }
    };

    fetchLabels();
  }, []);

  return (
    <div>
      <h2>Labels</h2>
      <select>
        <option value="">Select Label</option>
        {labels.map((label) => (
          <option key={label.label} value={label.label}>
            {label.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LabelsDropdown;
