import React from "react";
import "./Landing.css";

const Landing = ({ handleLoginClick }) => (
  <div className="landing-wrapper">
    <div className="landing-container">
      <h1>💳 A Transaction App That Does More Than Just Track Money! 🚀</h1>
      <p>
        In today’s fast-paced world, we often chase after what we want without appreciating what we already have. I wanted to change that! So, I built an app that helps people:
        <br />✅ Stay grateful for what they have 🎯
        <br />✅ Set and track meaningful financial goals 🚀
        <br />✅ Visualize spending habits with clear insights 📊
        <br />
        <br />Unlike most transaction apps, this one doesn’t just show numbers—it tells a story. With AI-powered analytics, users can:
        <br />🤖 Get Smart Budgeting Tips – AI predicts spending patterns & suggests saving strategies.
        <br />📊 See Expenses Visually – Pie charts & intuitive dashboards for better clarity.
        <br />🚨 Detect Anomalies – Instant alerts for unusual transactions or hidden fees.
        <br />🎯 Achieve Financial Goals – AI-driven recommendations to stay on track.
        <br />
        <br />Now, I’m looking for your feedback! How do you think AI can further enhance financial tracking and personal finance management? Let’s innovate together—drop your thoughts below! 👇
      </p>
      <button className="btn btn-primary" onClick={handleLoginClick}>
        Get Started / Log In
      </button>
    </div>
  </div>
);

export default Landing;