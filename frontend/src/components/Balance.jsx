import React, { useEffect, useState } from "react";
import axios from "axios";

function Balance() {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          alert("User ID not found. Please log in.");
          return;
        }
        const response = await axios.get(`http://localhost:8000/user/${userId}`);
        setBalance(response.data.balance);
      } catch (error) {
        console.error("Error fetching balance:", error);
        alert(error.response?.data?.detail || "Error fetching balance");
      }
    };

    fetchBalance();
  }, []);

  return (
    <div>
      <h1>Your Balance</h1>
      <p>Your remaining balance is: <strong>${balance.toFixed(2)}</strong></p>
    </div>
  );
}

export default Balance;
