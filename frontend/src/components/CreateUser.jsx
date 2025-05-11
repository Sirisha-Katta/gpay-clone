import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // Import toast

function CreateUser() {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://gpay-backend.onrender.com/create-user/", {
        name,
        balance: parseFloat(balance),
      });
      toast.success(response.data.message);
      localStorage.setItem("user_id", response.data.user_id); // Store user_id
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Error creating user");
    }
  };

  return (
    <div>
      <h1>Create User</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Balance"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          required
        />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default CreateUser;
