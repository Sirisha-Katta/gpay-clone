import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // Import toast
import "./Transaction.css";

function Transaction() {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [labels, setLabels] = useState([]);
  const [newLabel, setNewLabel] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [history, setHistory] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [showNewLabelInput, setShowNewLabelInput] = useState(false);
  const [showNewSubcategoryInput, setShowNewSubcategoryInput] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState([]); // Store user suggestions
  const [allUsers, setAllUsers] = useState([]); // Store all usernames

  useEffect(() => {
    const fetchUserBalance = async () => {
      const userId = localStorage.getItem("user_id");
      if (userId) {
        try {
          const response = await axios.get(`https://gpay-clone.onrender.com/user/${userId}`);
          setUserBalance(response.data.balance);
        } catch (error) {
          toast.error("Error fetching user balance."); // Show error toast
        }
      }
    };
    fetchUserBalance();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("https://gpay-clone.onrender.com/get-users/");
        console.log("Fetched Users:", response.data.users); // Debugging log
        setAllUsers(response.data.users.map((user) => user.name)); // Extract usernames
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Fetch labels and subcategories
  const fetchLabels = async () => {
    try {
      const response = await axios.get("https://gpay-clone.onrender.com/get-labels/");
      if (response.data.labels && response.data.labels.length > 0) {
        console.log("Fetched Labels:", response.data.labels); // Debugging log
        setLabels(response.data.labels); // Set labels with subcategories and colors
      } else {
        toast.warn("No labels found in the database."); // Show warning toast
      }
    } catch (error) {
      console.error("Error fetching labels:", error);
      toast.error("Failed to fetch labels. Please try again later."); // Show error toast
    }
  };

  useEffect(() => {
    fetchLabels(); // Fetch labels on component mount
  }, []);

  const handleReceiverChange = (e) => {
    const input = e.target.value;
    setReceiver(input);

    // Filter usernames based on input
    if (input) {
      const suggestions = allUsers.filter((user) =>
        user.toLowerCase().startsWith(input.toLowerCase())
      );
      setUserSuggestions(suggestions);
    } else {
      setUserSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setReceiver(suggestion); // Set the selected suggestion as the receiver
    setUserSuggestions([]); // Clear suggestions
  };

  const handleSendMoney = async () => {
    if (!receiver || !amount || !label || !subcategory) {
      toast.warn("Please fill in all the fields before sending money."); // Show warning toast
      return;
    }

    try {
      const currentTimestamp = new Date().toISOString().replace("T", " ").split(".")[0];
      const response = await axios.post("https://gpay-clone.onrender.com/send-money/", {
        receiver_name: receiver.charAt(0).toUpperCase() + receiver.slice(1), // Capitalize first letter
        amount: parseFloat(amount),
        label: label.charAt(0).toUpperCase() + label.slice(1), // Capitalize first letter
        subcategory: subcategory.charAt(0).toUpperCase() + subcategory.slice(1), // Capitalize first letter
        timestamp: currentTimestamp,
      });
      toast.success(response.data.message); // Show success toast
      setHistory((prevHistory) => [
        ...prevHistory,
        { message: response.data.message, amount, label, subcategory, timestamp: currentTimestamp },
      ]);
      const userId = localStorage.getItem("user_id");
      const balanceResponse = await axios.get(`https://gpay-clone.onrender.com/user/${userId}`);
      setUserBalance(balanceResponse.data.balance);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error sending money."); // Show error toast
    }
  };

  const handleAddLabel = async () => {
    if (!newLabel) {
      toast.warn("Please enter a label name."); // Show warning toast
      return;
    }

    try {
      const response = await axios.post("https://gpay-clone.onrender.com/create-label/", {
        label: newLabel.charAt(0).toUpperCase() + newLabel.slice(1), // Capitalize first letter
        subcategories: [],
      });
      toast.success(response.data.message); // Show success toast
      await fetchLabels(); // Fetch the latest labels after saving
      setNewLabel("");
      setShowNewLabelInput(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error adding label"); // Show error toast
    }
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategory || !label) {
      toast.warn("Please select a label and enter a subcategory name."); // Show warning toast
      return;
    }

    try {
      const response = await axios.post("https://gpay-clone.onrender.com/create-label/", {
        label: label.charAt(0).toUpperCase() + label.slice(1), // Capitalize first letter
        subcategories: [newSubcategory.charAt(0).toUpperCase() + newSubcategory.slice(1)], // Capitalize first letter
      });
      toast.success(response.data.message); // Show success toast
      await fetchLabels(); // Fetch the latest labels after saving
      setNewSubcategory("");
      setShowNewSubcategoryInput(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error adding subcategory"); // Show error toast
    }
  };

  return (
    <div className="transaction-container">
      <h1>Send Money</h1>
      <div className="balance-display">Current Balance: ₹{userBalance}</div>
      <input
        type="text"
        placeholder="To Whom"
        value={receiver}
        onChange={handleReceiverChange}
        className="input-field"
      />
      {userSuggestions.length > 0 && (
        <ul className="suggestions-list">
          {userSuggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion-item"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="input-field"
      />
      <div className="label-container">
        {/* Label Row */}
        <div className="label-row">
          <select
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={`dropdown ${showNewLabelInput ? "shrink" : ""}`} // Add "shrink" class dynamically
          >
            <option value="">Select Label</option>
            {labels.map((lbl) => (
              <option key={lbl.label} value={lbl.label}>
                {lbl.label}
              </option>
            ))}
          </select>
          <button
            className="add-btn"
            onClick={() => setShowNewLabelInput(!showNewLabelInput)}
          >
            +
          </button>
          {showNewLabelInput && (
            <>
              <input
                type="text"
                placeholder="New Label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="new-input"
              />
              <button className="save-btn" onClick={handleAddLabel}>
                Save
              </button>
            </>
          )}
        </div>
        {/* Subcategory Row */}
        {label && (
          <div className="subcategory-row">
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className={`dropdown ${showNewSubcategoryInput ? "shrink" : ""}`} // Add "shrink" class dynamically
            >
              <option value="">Subcategory</option>
              {labels
                .find((lbl) => lbl.label === label)
                ?.subcategories.map((sub) => (
                  <option key={sub.name} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
            </select>
            <button
              className="add-btn"
              onClick={() => setShowNewSubcategoryInput(!showNewSubcategoryInput)}
            >
              +
            </button>
            {showNewSubcategoryInput && (
              <>
                <input
                  type="text"
                  placeholder="New Subcategory"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  className="new-input"
                />
                <button className="save-btn" onClick={handleAddSubcategory}>
                  Save
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <button className="send-btn" onClick={handleSendMoney}>
        Send
      </button>
    </div>
  );
}

export default Transaction;


