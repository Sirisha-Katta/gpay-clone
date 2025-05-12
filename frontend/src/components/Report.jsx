import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Report.css"; // Import the CSS file for styling

const Report = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]); // State to store categories
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [income, setIncome] = useState("");
  const [preferences, setPreferences] = useState(["", "", ""]); // Default empty preferences
  const [savedDetails, setSavedDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      const userId = sessionStorage.getItem("user_id");
      if (userId) {
        try {
          const response = await axios.get(`https://gpay-clone.onrender.com/user/${userId}/transactions`);
          setTransactions(response.data.transactions);

          const income = response.data.transactions
            .filter((txn) => txn.type === "income")
            .reduce((sum, txn) => sum + txn.amount, 0);
          const expense = response.data.transactions
            .filter((txn) => txn.type === "expense")
            .reduce((sum, txn) => sum + txn.amount, 0);

          setTotalIncome(income);
          setTotalExpense(expense);
        } catch (error) {
          console.error("Error fetching report data:", error);
        }
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get("https://gpay-clone.onrender.com/get-labels/");
        const categoryLabels = response.data.labels.map((label) => label.label);
        setCategories(categoryLabels); // Set categories from the backend
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchSavedDetails = async () => {
      const userId = sessionStorage.getItem("user_id");
      if (userId) {
        try {
          const response = await axios.get(`https://gpay-clone.onrender.com/user/${userId}/preferences`);
          if (response.data.preferences) {
            setSavedDetails(response.data.preferences);
            setIncome(response.data.preferences.income);
            setPreferences(response.data.preferences.preferences);
          }
        } catch (error) {
          console.error("Error fetching saved preferences:", error);
        }
      }
    };

    fetchReportData();
    fetchCategories();
    fetchSavedDetails(); // Fetch saved preferences on component mount
  }, []);

  const handleSaveDetails = async () => {
    if (!income || preferences.some((pref) => !pref)) {
      alert("Please fill in all fields before saving.");
      return;
    }

    const userId = sessionStorage.getItem("user_id");
    if (userId) {
      try {
        const response = await axios.post(`https://gpay-clone.onrender.com/user/${userId}/preferences`, {
          income,
          preferences,
        });
        setSavedDetails(response.data.preferences);
        setIsEditing(false);
      } catch (error) {
        console.error("Error saving preferences:", error);
      }
    }
  };

  const handleEditDetails = () => {
    setIsEditing(true);
  };

  const handleGeneratePlan = async () => {
    if (!savedDetails) {
      alert("Please fill in the form and save your details before generating a plan.");
      return;
    }
    setIsLoading(true);
    setGeneratedPlan(null);
    try {
      const response = await axios.post("https://gpay-clone.onrender.com/generate-plan", {
        income: savedDetails.income,
        preferences: savedDetails.preferences,
      });
      setGeneratedPlan(response.data.plan);
    } catch (error) {
      console.error("Error generating plan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="report-container">
      <h2>Report</h2>
      {!savedDetails || isEditing ? (
        <div className="form-container">
          <label>
            Income:
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="Enter your income"
            />
          </label>
          <label>
            Preferences:
            <select
              value={preferences[0]}
              onChange={(e) => setPreferences([e.target.value, preferences[1], preferences[2]])}
            >
              <option value="">Select</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={preferences[1]}
              onChange={(e) => setPreferences([preferences[0], e.target.value, preferences[2]])}
            >
              <option value="">Select</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={preferences[2]}
              onChange={(e) => setPreferences([preferences[0], preferences[1], e.target.value])}
            >
              <option value="">Select</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <button onClick={handleSaveDetails}>Save</button>
        </div>
      ) : (
        <div className="saved-details">
          <p>Income: ${savedDetails.income}</p>
          <p>Preferences: {savedDetails.preferences.join(", ")}</p>
          <button onClick={handleEditDetails}>Edit</button>
          <button onClick={handleGeneratePlan}>Generate Plan</button>
        </div>
      )}
      {isLoading && <div className="loading">Generating plan...</div>}
      {generatedPlan && savedDetails && (
        <div className="plan-container">
          <h3>Generated Plan</h3>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(generatedPlan).map(([category, amount]) => (
                <tr key={category}>
                  <td>{category}</td>
                  <td>${amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="summary">
        <div className="summary-item">
          <span>Total Income:</span>
          <span className="income">${totalIncome}</span>
        </div>
        <div className="summary-item">
          <span>Total Expense:</span>
          <span className="expense">${totalExpense}</span>
        </div>
        <div className="summary-item">
          <span>Net Balance:</span>
          <span className="balance">${totalIncome - totalExpense}</span>
        </div>
      </div>
      <h3>Transaction History</h3>
      <ul className="transaction-list">
        {transactions.map((txn) => (
          <li key={txn.id} className={`transaction-item ${txn.type}`}>
            <span>{txn.description}</span>
            <span>${txn.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Report;
