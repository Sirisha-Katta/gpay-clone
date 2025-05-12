import React, { useEffect, useState } from "react";
import axios from "axios";
import "./History.css";

function History() {
  const [transactions, setTransactions] = useState([]); // Initialize as an empty array
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`https://gpay-clone.onrender.com/transactions/${userId}`);
        console.log("API Response:", response.data); // Debugging log

        if (response.data.transactions) {
          // Ensure subcategories are properly formatted (capitalize if needed)
          const formattedTransactions = response.data.transactions.map(tx => ({
            ...tx,
            subcategory: tx.subcategory ? tx.subcategory.toLowerCase() : "no subcategory"
          }));
          console.log("Formatted Transactions:", formattedTransactions); // Debugging log

          // Remove duplicates based on the unique '_id' field
          const uniqueTransactions = Array.from(
            new Map(formattedTransactions.map(tx => [tx._id, tx])).values()
          );
          console.log("Unique Transactions:", uniqueTransactions); // Debugging log

          setTransactions(uniqueTransactions);
        } else {
          console.warn("No transactions found.");
          setTransactions([]); // Ensure transactions is an empty array if no data
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setTransactions([]); // Handle errors by setting transactions to an empty array
      }
    };
    fetchTransactions();
  }, [userId]);

  return (
    <div className="history-container">
      <h2>Transaction History</h2>
      {transactions.length > 0 ? (
        <ul>
        {transactions.map((transaction) => (
  <li
    key={transaction._id}
    className={transaction.type === "sent" ? "sent" : "received"}
    style={{ color: transaction.type === "sent" ? "orange" : "green" }}
  >
    {transaction.message} - ₹{transaction.amount}
  </li>
))}
        </ul>
      ) : (
        <p>No transactions to display.</p>
      )}
    </div>
  );
}

export default History;
