import React, { useState } from "react";

const VersionManager = ({ onClose, loadVersion }) => {
  const [versions, setVersions] = useState(["v1", "v2"]); // Load from backend

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 6000,
      }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 12, padding: 24, width: 360 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Versions</h3>
        {versions.map((v, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span>{v}</span>
            <button onClick={() => loadVersion(v)}>Load</button>
          </div>
        ))}
        <button onClick={onClose} style={{ marginTop: 12 }}>
          Close
        </button>
      </div>
    </div>
  );
};

export default VersionManager;
