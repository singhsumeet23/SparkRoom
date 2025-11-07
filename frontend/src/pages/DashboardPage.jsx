import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import BackgroundSettings from "../components/BackgroundSettings";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { backgroundStyle } = useUI();
  const navigate = useNavigate();

  const [newRoomName, setNewRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [documents, setDocuments] = useState([
    { _id: "101", name: "Project Plan" },
    { _id: "102", name: "UI Design Mockup" },
    { _id: "103", name: "Marketing Notes" },
  ]);

  // --- UI COLORS ---
  const FLUENT_BLUE = "#5E38CC";
  const FLUENT_PRIMARY_TEXT = "#FFFFFF";
  const FLUENT_SECONDARY_TEXT = "#D8D8D8";
  const FLUENT_DANGER = "#EE4E4E";
  const FLUENT_WARNING = "#FFA800";

  const textColor = FLUENT_PRIMARY_TEXT;

  const glassCardStyle = {
    padding: "20px",
    borderRadius: "12px",
    background: "rgba(32, 32, 45, 0.65)",
    backdropFilter: "blur(25px)",
    WebkitBackdropFilter: "blur(25px)",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: textColor,
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  };

  const mainContentGridStyle = {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: "30px",
    marginTop: "50px",
  };

  // --- HANDLERS (local only, no backend) ---
  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    const newDoc = { _id: Date.now().toString(), name: newRoomName };
    setDocuments((prev) => [...prev, newDoc]);
    navigate(`/document/${newDoc._id}`);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (joinRoomId.trim()) navigate(`/document/${joinRoomId}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        color: textColor,
        ...backgroundStyle.style,
        transition: "background 0.3s ease",
      }}
    >
      <div
        style={{ maxWidth: "1000px", margin: "0 auto", padding: "50px 20px" }}
      >
        {/* --- HEADER --- */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: 600,
              color: FLUENT_PRIMARY_TEXT,
            }}
          >
            Welcome, {user?.name || "Guest"} 🚀
          </h2>

          <div style={{ display: "flex", gap: "15px" }}>
            <button
              onClick={() => navigate("/templates")}
              style={{
                padding: "10px 18px",
                backgroundColor: FLUENT_WARNING,
                color: "black",
                borderRadius: "8px",
                fontWeight: 600,
                border: "none",
              }}
            >
              📋 Templates
            </button>

            <button
              onClick={() => setShowSettings(true)}
              style={{
                padding: "10px 18px",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: FLUENT_PRIMARY_TEXT,
                borderRadius: "8px",
                border: "none",
              }}
            >
              🎨 Settings
            </button>

            <button
              onClick={logout}
              style={{
                padding: "10px 18px",
                backgroundColor: FLUENT_DANGER,
                color: "white",
                borderRadius: "8px",
                border: "none",
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div style={mainContentGridStyle}>
          {/* LEFT COLUMN: RECENT BOARDS */}
          <div>
            <h3
              style={{
                marginBottom: 20,
                color: FLUENT_PRIMARY_TEXT,
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                paddingBottom: "10px",
              }}
            >
              Your Recent Boards
            </h3>

            {/* --- NEW BOARD CARD --- */}
            <div
              onClick={() => navigate("/templates")}
              style={{
                ...glassCardStyle,
                padding: "25px",
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: "1.1rem",
                cursor: "pointer",
                backgroundColor: "rgba(94, 56, 204, 0.9)",
                color: "#fff",
                textAlign: "center",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.03)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <span style={{ fontSize: "2rem", marginBottom: "10px" }}>➕</span>
              Start New Board
              <p
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 400,
                  marginTop: "5px",
                }}
              >
                Pick a template or start blank
              </p>
            </div>

            {/* --- MOCK DOCUMENTS LIST --- */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  style={{
                    ...glassCardStyle,
                    padding: "18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "600",
                      color: FLUENT_PRIMARY_TEXT,
                      fontSize: "1.1rem",
                    }}
                  >
                    {doc.name}
                  </span>
                  <Link
                    to={`/document/${doc._id}`}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      color: FLUENT_PRIMARY_TEXT,
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    Re-open
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: CREATE / JOIN */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* CREATE NEW ROOM */}
            <form
              onSubmit={handleCreateRoom}
              style={{
                ...glassCardStyle,
                padding: "30px 20px",
              }}
            >
              <h3 style={{ color: FLUENT_PRIMARY_TEXT, marginBottom: "15px" }}>
                Start a New Board
              </h3>
              <input
                type="text"
                placeholder="Enter Board Name"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                required
                style={{
                  width: "100%",
                  marginBottom: "15px",
                  color: FLUENT_PRIMARY_TEXT,
                  backgroundColor: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  padding: "12px",
                  borderRadius: "8px",
                }}
              />
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  backgroundColor: FLUENT_BLUE,
                  color: "white",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  border: "none",
                }}
              >
                Create Board
              </button>
            </form>

            {/* JOIN ROOM */}
            <form
              onSubmit={handleJoinRoom}
              style={{
                ...glassCardStyle,
                padding: "30px 20px",
              }}
            >
              <h3 style={{ color: FLUENT_PRIMARY_TEXT, marginBottom: "15px" }}>
                Join by Code
              </h3>
              <input
                type="text"
                placeholder="Paste Room Code"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                required
                style={{
                  width: "100%",
                  marginBottom: "15px",
                  color: FLUENT_PRIMARY_TEXT,
                  backgroundColor: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  padding: "12px",
                  borderRadius: "8px",
                }}
              />
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  backgroundColor: FLUENT_BLUE,
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  border: "none",
                }}
              >
                Join Room
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* BACKGROUND SETTINGS MODAL */}
      {showSettings && (
        <>
          <div
            onClick={() => setShowSettings(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              zIndex: 999,
            }}
          />
          <BackgroundSettings />
        </>
      )}
    </div>
  );
};

export default DashboardPage;
