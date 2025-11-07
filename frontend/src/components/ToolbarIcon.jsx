import React from "react";

const ToolbarIcon = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: active ? "#007bff" : "#fff",
        color: active ? "#fff" : "#333",
        border: "1px solid #ccc",
        borderRadius: "8px",
        width: "48px",
        height: "48px",
        margin: "4px",
        cursor: "pointer",
        boxShadow: active ? "0 2px 5px rgba(0,0,0,0.2)" : "none",
        transition: "all 0.2s ease-in-out",
      }}
    >
      <span style={{ fontSize: "20px" }}>{icon}</span>
    </button>
  );
};

export default ToolbarIcon;
