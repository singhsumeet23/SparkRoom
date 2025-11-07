import React from "react";
import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

const ACCENT_COLOR_DARK = "#6c5ce7";
const ACCENT_COLOR_LIGHT = "#a29bfe";
const FONT_STACK = "Inter, Helvetica Neue, Arial, sans-serif";

const styles = {
  keyframes: `
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes fadeInSlide {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
    }
  `,
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: `linear-gradient(-45deg, #a29bfe, #81ecec, #6c5ce7, #00cec9)`,
    backgroundSize: "400% 400%",
    animation: "gradientShift 15s ease infinite",
    padding: "100px 15px",
    fontFamily: FONT_STACK,
    position: "relative",
    overflow: "hidden",
    transition: "all 0.5s ease",
  },
  header: {
    color: "white",
    fontSize: "4.0rem",
    marginBottom: "15px",
    fontWeight: 800,
    textAlign: "center",
    letterSpacing: "-2.0px",
    textShadow: "0 4px 10px rgba(0,0,0,0.3)",
    animation: "fadeInSlide 1s ease-out 0.3s forwards",
    opacity: 0,
  },
  subtext: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "1.6rem",
    maxWidth: "750px",
    marginBottom: "80px",
    textAlign: "center",
    fontWeight: 300,
    lineHeight: "1.4",
    animation: "fadeInSlide 1s ease-out 0.5s forwards",
    opacity: 0,
  },
  ctaContainer: {
    display: "flex",
    gap: "30px",
    marginTop: "15px",
    animation: "fadeInSlide 1s ease-out 0.7s forwards",
    opacity: 0,
    alignItems: "center",
    flexDirection: "column",
  },
  buttonGroup: {
    display: "flex",
    gap: "30px",
    marginBottom: "25px",
  },
  primaryButton: {
    padding: "18px 45px",
    fontSize: "1.3rem",
    backgroundColor: "white",
    color: ACCENT_COLOR_DARK,
    textDecoration: "none",
    borderRadius: "16px",
    fontWeight: 700,
    boxShadow: `0 10px 25px rgba(0, 0, 0, 0.25)`,
    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "18px 45px",
    fontSize: "1.3rem",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "white",
    border: `2px solid rgba(255, 255, 255, 0.8)`,
    textDecoration: "none",
    borderRadius: "16px",
    fontWeight: 700,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
  },
  contactLink: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "1.0rem",
    textDecoration: "underline",
    fontWeight: 500,
    transition: "color 0.2s ease",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
  },
};

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartFreeBoard = () => {
    // Directly go to dashboard — no auth, no guest login
    navigate("/dashboard");
  };

  return (
    <>
      <style>{styles.keyframes}</style>
      <div style={styles.container}>
        <h1 style={styles.header}>
          Ideas Without Limits. Real-Time Whiteboarding.
        </h1>
        <p style={styles.subtext}>
          Unite your team on an infinite canvas designed for speed, clarity, and
          beautiful execution. Get started in seconds.
        </p>

        <div style={styles.ctaContainer}>
          <div style={styles.buttonGroup}>
            <button onClick={handleStartFreeBoard} style={styles.primaryButton}>
              Start Your Free Board
            </button>
            <Link to="/login" style={styles.secondaryButton}>
              I'm a Member
            </Link>
          </div>

          <Link to="/contact" style={styles.contactLink}>
            Have Questions? Contact Us
          </Link>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
