import React from 'react';
import { useUI } from '../context/UIContext'; // To get the dark mode status

const SuccessPopup = ({ name, onClose }) => {
  const { backgroundStyle } = useUI();
  const isDark = backgroundStyle.isDark;
  const textColor = isDark ? "#FFFFFF" : "#111827";

  // --- Styles ---
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)', // Darker overlay
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 7000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const popupStyle = {
    padding: '40px',
    borderRadius: 'var(--border-radius)',
    background: isDark ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.37)",
    border: isDark ? "1px solid rgba(255, 255, 255, 0.18)" : "1px solid rgba(255, 255, 255, 0.5)",
    color: textColor,
    textAlign: 'center',
    maxWidth: '500px',
  };

  const buttonStyle = {
    padding: '12px 30px',
    fontSize: '16px',
    fontWeight: '700',
    color: 'white',
    backgroundImage: 'linear-gradient(90deg, #007bff, #00c6ff)',
    border: 'none',
    borderRadius: 'var(--border-radius)',
    cursor: 'pointer',
    marginTop: '30px',
    transition: 'all 0.3s ease',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={popupStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: '3.5rem' }}>🎉</div>
        <h1 style={{ color: textColor, fontWeight: '700', margin: '15px 0' }}>
          Thank you, {name}!
        </h1>
        <p style={{ color: isDark ? "#a0aec0" : "#333", fontSize: '1.1rem', lineHeight: 1.6 }}>
          Your message has been sent successfully. Our team will connect with you shortly.
        </p>
        <button 
          style={buttonStyle}
          onClick={onClose}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SuccessPopup;