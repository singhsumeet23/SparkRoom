import React, { useState } from "react";

const CommentsModal = ({ elementId, onClose }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]); // should load from element data

  const handleAddComment = () => {
    if (!comment.trim()) return;
    setComments([...comments, { text: comment, user: "You", color: "#3b82f6" }]);
    setComment("");
  };

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
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 12, padding: 24, width: 360 }}
      >
        <h3>Comments</h3>
        <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 12 }}>
          {comments.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: c.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  marginRight: 8,
                  fontSize: 12,
                }}
              >
                {c.user[0]}
              </div>
              <div>{c.text}</div>
            </div>
          ))}
        </div>
        <input
          type="text"
          placeholder="Add comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ width: "100%", padding: 6, marginBottom: 8 }}
        />
        <button onClick={handleAddComment} style={{ marginRight: 8 }}>
          Add
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default CommentsModal;
