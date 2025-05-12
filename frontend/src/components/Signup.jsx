import React, { useState } from "react";
import axios from "axios";
import "./Signup.css";
import { toast } from "react-toastify"; // Import toast


function Signup() {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [pin, setPin] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSignup = async () => {
    try {
      const response = await axios.post("https://gpay-clone.onrender.com/signup/", {
        name,
        balance: parseFloat(balance),
        pin,
        phone_number: phoneNumber,
      });
      toast.success(response.data.message);
      setName("");
      setBalance("");
      setPin("");
      setPhoneNumber("");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error during signup");
    }
  };

  return (
    <div className="signup-container">
      <h1>Signup</h1>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input-field"
      />
      <input
        type="number"
        placeholder="Initial Balance"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        className="input-field"
      />
      <input
        type="password"
        placeholder="PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        className="input-field"
      />
      <input
        type="text"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        className="input-field"
      />
      <button onClick={handleSignup} className="signup-btn">
        Signup
      </button>
    </div>
  );
}

export default Signup;
