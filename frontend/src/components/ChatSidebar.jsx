import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // We need this to get the user's name

// 1. ADDED A DEFAULT VALUE (messages = []) TO PREVENT THE CRASH
const ChatSidebar = ({ messages = [], onSendMessage, isChatOpen, setIsChatOpen }) => {
  const [newMessage, setNewMessage] = useState("");
  const { myUser } = useAuth(); // Use 'myUser' to match useRoom.js
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  // This style controls the sliding
  const dynamicSidebarStyle = {
    ...sidebarStyle,
    right: isChatOpen ? "0px" : "-280px", // Controls the slide
  };

  return (
    <div style={dynamicSidebarStyle}>
      <div style={headerStyle}>
        <h3 style={{ margin: 0, flex: 1, textAlign: 'center' }}>Room Chat</h3>
        <button onClick={() => setIsChatOpen(false)} style={closeButtonStyle}>
          &times;
        </button>
      </div>

      <div style={messagesContainerStyle}>
        {/* 2. THIS .map() CALL IS NOW SAFE */}
        {messages.map((msg, index) => {
          // Check if the message is from the current user
          const isMe = msg.userName === myUser?.name;
          return (
            <div
              key={msg.id || index}
              style={{
                ...messageStyle,
                alignSelf: isMe ? "flex-end" : "flex-start",
                backgroundColor: isMe ? "#dcf8c6" : "#ffffff", // WhatsApp style
              }}
            >
              {!isMe && (
                <div style={userNameStyle}>{msg.userName}</div>
              )}
              <div>{msg.content}</div>
              <div style={timestampStyle}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          Send
        </button>
      </form>
    </div>
  );
};

// --- Styles ---
const sidebarStyle = {
  width: "280px",
  height: "100vh",
  position: "fixed",
  top: 0,
  zIndex: 10001, // Above toolbar
  backgroundColor: "#f4f4f4",
  borderLeft: "1px solid #ddd",
  boxShadow: "-4px 0 10px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  transition: "right 0.3s ease", // Slide transition
};

const headerStyle = {
  padding: "12px 16px",
  margin: 0,
  borderBottom: "1px solid #ddd",
  backgroundColor: "#fff",
  color: "#333",
  fontSize: "1.1rem",
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const closeButtonStyle = {
  background: 'transparent',
  border: 'none',
  fontSize: '24px',
  color: '#888',
  cursor: 'pointer',
  lineHeight: 1,
  padding: '0 4px',
};

const messagesContainerStyle = {
  flex: 1,
  padding: "10px",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const messageStyle = {
  padding: "8px 12px",
  borderRadius: "12px",
  maxWidth: "85%",
  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  wordWrap: "break-word",
};

const userNameStyle = {
  fontSize: "12px",
  fontWeight: "bold",
  color: "#5E38CC", // Example color
  marginBottom: "2px",
};

const timestampStyle = {
  fontSize: "10px",
  color: "#888",
  textAlign: "right",
  marginTop: "4px",
};

const formStyle = {
  display: "flex",
  padding: "10px",
  borderTop: "1px solid #ddd",
  background: "#fff",
};

const inputStyle = {
  flex: 1,
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "14px",
};

const buttonStyle = {
  marginLeft: "8px",
  padding: "8px 12px",
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
};

export default ChatSidebar;