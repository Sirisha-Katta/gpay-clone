import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate, useNavigate, Link } from "react-router-dom";
import Transaction from "./components/Transaction.jsx";
import History from "./components/History.jsx";
import PieChartView from "./components/PieChartView.jsx";
import Balance from "./components/Balance.jsx"; // Import the Balance component
import Report from "./components/Report.jsx"; // Import the Report component
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS
import "./App.css";
import axios from "axios"; // Ensure axios is imported

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [userBalance, setUserBalance] = useState(0); // Track user's balance
  const navigate = useNavigate();

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem("user_id");
    toast.info("Logged out successfully."); // Show info toast
    navigate("/auth");
  };

  useEffect(() => {
    const fetchUserBalance = async () => {
      const userId = localStorage.getItem("user_id");
      if (userId) {
        try {
          const response = await axios.get(`https://gpay-backend.onrender.com/user/${userId}`);
          setUserBalance(response.data.balance);
          setLoggedInUser({ name: response.data.name }); // Set logged-in user details
        } catch (error) {
          toast.error("Error fetching user balance."); // Show error toast
        }
      }
    };

    fetchUserBalance();
  }, []);

  return (
    <div>
      <ToastContainer /> {/* Add ToastContainer here */}
      {!loggedInUser ? (
        <Auth setLoggedInUser={setLoggedInUser} />
      ) : (
        <div>
          <div className="header">
            <span>
              Welcome, {loggedInUser.name.charAt(0).toUpperCase() + loggedInUser.name.slice(1)}
            </span>
            <button onClick={handleLogout}>Log Out</button>
          </div>
          <nav className="nav-bar">
            <Link to="/transaction">Transaction</Link>
            <Link to="/history">History</Link>
            <Link to="/pie-chart">Pie Chart</Link>
            {/* <Link to="/report">Report</Link>  */}
          </nav>
        </div>
      )}
      <Routes>
        <Route
          path="/auth"
          element={
            loggedInUser ? <Navigate to="/transaction" /> : <Auth setLoggedInUser={setLoggedInUser} />
          }
        />
        <Route
          path="/transaction"
          element={
            loggedInUser ? (
              <Transaction userBalance={userBalance} />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/history"
          element={loggedInUser ? <History /> : <Navigate to="/auth" />}
        />
        <Route
          path="/pie-chart"
          element={loggedInUser ? <PieChartView /> : <Navigate to="/auth" />}
        />
        <Route
          path="/balance"
          element={loggedInUser ? <Balance /> : <Navigate to="/auth" />}
        />
        <Route
          path="/report"
          element={loggedInUser ? <Report /> : <Navigate to="/auth" />}
        />
        {/* Default route redirects to the transaction page if logged in */}
        <Route
          path="/"
          element={
            loggedInUser ? <Navigate to="/transaction" /> : <Navigate to="/auth" />
          }
        />
      </Routes>
    </div>
  );
}

function Auth({ setLoggedInUser }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    phonenumber: "",
    pin: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignUp = async () => {
    if (!formData.name || !formData.balance || !formData.phonenumber || !formData.pin) {
      toast.warn("Please fill in all the fields to sign up."); // Show warning toast
      return;
    }

    try {
      const response = await axios.post("https://gpay-backend.onrender.com/create-user/", {
        ...formData,
        name: formData.name.toLowerCase(), // Convert name to lowercase
      });
      toast.success(response.data.message); // Show success toast

      // Clear the form and switch to login view
      setFormData({
        name: "",
        balance: "",
        phonenumber: "",
        pin: "",
      });
      setIsSignUp(true); // Switch to login view
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error signing up."); // Show error toast
    }
  };

  const handleLogin = async () => {
    if (!formData.name || !formData.pin) {
      toast.warn("Please fill in all the fields to log in."); // Show warning toast
      return;
    }

    try {
      const response = await axios.post("https://gpay-backend.onrender.com/login/", {
        name: formData.name.toLowerCase(), // Convert name to lowercase
        pin: formData.pin, // Include pin in login
      });
      toast.success(response.data.message); // Show success toast
      localStorage.setItem("user_id", response.data.user_id);
      setLoggedInUser({ name: formData.name });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error logging in"); // Show error toast
    }
  };

  return (
    <div
      className="auth-wrapper"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
      }}
    >
      <div className="auth-container">
        <h2>{isSignUp ? "Sign Up" : "Log In"}</h2>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleInputChange}
        />
        {isSignUp && (
          <>
            <input
              type="number"
              name="balance"
              placeholder="Balance"
              value={formData.balance}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="phonenumber"
              placeholder="Phone Number"
              value={formData.phonenumber}
              onChange={handleInputChange}
            />
          </>
        )}
        <input
          type="password"
          name="pin"
          placeholder="PIN"
          value={formData.pin}
          onChange={handleInputChange}
        />
        <button onClick={isSignUp ? handleSignUp : handleLogin}>
          {isSignUp ? "Sign Up" : "Log In"}
        </button>
        <button className="switch-button" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? "Switch to Log In" : "Switch to Sign Up"}
        </button>
      </div>
    </div>
  );
}

export default App;

// import React, { useState, useEffect } from "react";
// import { Route, Routes, Navigate, useNavigate, Link } from "react-router-dom";
// import Transaction from "./components/Transaction.jsx";
// import History from "./components/History.jsx";
// import PieChartView from "./components/PieChartView.jsx";
// import Balance from "./components/Balance.jsx"; // Import the Balance component
// import Report from "./components/Report.jsx"; // Import the Report component
// import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
// import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS
// import "./App.css";
// import axios from "axios"; // Ensure axios is imported
// import Landing from "./components/Landing";

// function App() {
//   const [showLanding, setShowLanding] = useState(true);
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [loggedInUser, setLoggedInUser] = useState(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     balance: "",
//     phonenumber: "",
//     pin: "",
//   });

//   const handleLoginClick = () => {
//     setShowLanding(false);
//   };

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async () => {
//     // ... existing submit logic ...
//   };

//   if (loggedInUser) {
//     return <Dashboard user={loggedInUser} />;
//   }

//   return (
//     <>
//       <ToastContainer />
//       {showLanding ? (
//         <Landing handleLoginClick={handleLoginClick} />
//       ) : (
//         <div 
//   className="auth-wrapper"
//   style={{
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     minHeight: "100vh",
//     padding: "20px",
//     background: "#f5f5f5"
//   }}
// >
//   <div 
//     className="auth-container"
//     style={{
//       background: "white",
//       padding: "40px",
//       borderRadius: "10px",
//       boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
//       width: "100%",
//       maxWidth: "400px"
//     }}
//   >
//     <button 
//       onClick={() => setShowLanding(true)}
//       style={{
//         background: "none",
//         border: "none",
//         color: "#666",
//         cursor: "pointer",
//         marginBottom: "20px",
//         padding: "5px 10px",
//         borderRadius: "5px",
//         transition: "background 0.3s"
//       }}
//       onMouseOver={e => e.target.style.background = "#f0f0f0"}
//       onMouseOut={e => e.target.style.background = "none"}
//     >
//       ← Back to Home
//     </button>
//     <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
//       {isSignUp ? "Sign Up" : "Log In"}
//     </h2>
//     <input
//       type="text"
//       name="name"
//       placeholder="Name"
//       value={formData.name}
//       onChange={handleInputChange}
//       style={{
//         width: "100%",
//         padding: "10px",
//         marginBottom: "10px",
//         borderRadius: "5px",
//         border: "1px solid #ddd"
//       }}
//     />
//     {isSignUp && (
//       <>
//         <input
//           type="number"
//           name="balance"
//           placeholder="Initial Balance"
//           value={formData.balance}
//           onChange={handleInputChange}
//           style={{
//             width: "100%",
//             padding: "10px",
//             marginBottom: "10px",
//             borderRadius: "5px",
//             border: "1px solid #ddd"
//           }}
//         />
//         <input
//           type="number"
//           name="phonenumber"
//           placeholder="Phone Number"
//           value={formData.phonenumber}
//           onChange={handleInputChange}
//           style={{
//             width: "100%",
//             padding: "10px",
//             marginBottom: "10px",
//             borderRadius: "5px",
//             border: "1px solid #ddd"
//           }}
//         />
//       </>
//     )}
//     <input
//       type="password"
//       name="pin"
//       placeholder="PIN"
//       value={formData.pin}
//       onChange={handleInputChange}
//       style={{
//         width: "100%",
//         padding: "10px",
//         marginBottom: "20px",
//         borderRadius: "5px",
//         border: "1px solid #ddd"
//       }}
//     />
//     <button 
//       onClick={handleSubmit}
//       style={{
//         width: "100%",
//         padding: "10px",
//         background: "#007bff",
//         color: "white",
//         border: "none",
//         borderRadius: "5px",
//         cursor: "pointer",
//         marginBottom: "10px"
//       }}
//     >
//       {isSignUp ? "Sign Up" : "Log In"}
//     </button>
//     <p 
//       onClick={() => setIsSignUp(!isSignUp)}
//       style={{
//         textAlign: "center",
//         color: "#007bff",
//         cursor: "pointer",
//         marginTop: "10px"
//       }}
//     >
//       {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
//     </p>
//   </div>
// </div>
//       )}
//     </>
//   );
// }

// export default App;
