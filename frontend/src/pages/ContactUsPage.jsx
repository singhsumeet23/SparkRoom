import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { Link } from 'react-router-dom';
import SuccessPopup from '../components/SuccessPopup'; 

const ContactUsPage = () => {
  const { user } = useAuth();
  const { backgroundStyle } = useUI(); 
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    // website: '', // <-- REMOVED from form
    message: '',
  });
  
  const [status, setStatus] = useState({ 
    loading: false, 
    error: '', 
    showSuccessPopup: false,
    submittedName: ''
  });
  
  const [focusedInput, setFocusedInput] = useState(null);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [isLinkHovered, setIsLinkHovered] = useState(false);

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(prev => ({ ...prev, loading: true, error: '', showSuccessPopup: false }));

    try {
      const { name, email, message } = formData; // <-- REMOVED website
      const payload = { name, email, message, userId: user?._id }; // <-- REMOVED website
      
      const res = await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send message.');
      
      setStatus({ 
        loading: false, 
        error: '', 
        showSuccessPopup: true, 
        submittedName: formData.name 
      });

      // Clear form fields
      if (user) {
        setFormData(prev => ({ ...prev, message: '' })); // Keep user info
      } else {
        setFormData({ name: '', email: '', website: '', message: '' }); // Clear all
      }

    } catch (err) {
      setStatus({ loading: false, error: err.message, showSuccessPopup: false, submittedName: '' });
    }
  };
  
  const closePopup = () => {
    setStatus(prev => ({ ...prev, showSuccessPopup: false, submittedName: '' }));
  };

  // --- STYLES ---
  
  const isDark = true; // Force dark mode for this page
  const textColor = "#FFFFFF";
  const subtleTextColor = "#a0aec0";
  const primaryColor = "var(--color-primary)";

  const pageStyle = {
    minHeight: "100vh",
    backgroundImage: 'linear-gradient(135deg, #371A5B, #110B1E)', 
    padding: '30px 20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'background 0.3s ease',
  };

  const mainContentGrid = {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '30px',
    maxWidth: '1200px',
    width: '100%',
    marginTop: '20px',
  };

  const glassCardStyle = {
    padding: '40px',
    borderRadius: 'var(--border-radius)',
    background: "rgba(0, 0, 0, 0.4)", 
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.37)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    color: textColor,
  };

  const getInputStyle = (inputName) => ({
    width: '100%',
    padding: '14px',
    marginBottom: '20px',
    borderRadius: 'var(--border-radius)',
    background: "rgba(0, 0, 0, 0.2)",
    border: `1px solid ${focusedInput === inputName ? primaryColor : 'rgba(255, 255, 255, 0.2)'}`,
    fontSize: '16px',
    color: textColor,
    boxSizing: 'border-box',
    outline: 'none',
    boxShadow: focusedInput === inputName ? `0 0 10px 2px rgba(0, 123, 255, 0.5)` : 'none',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  });
  
  const buttonStyle = {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '700',
    color: 'white',
    backgroundImage: 'linear-gradient(90deg, #007bff, #00c6ff)',
    border: 'none',
    borderRadius: 'var(--border-radius)',
    cursor: 'pointer',
    boxShadow: isBtnHovered ? '0 6px 25px rgba(0, 123, 255, 0.6)' : '0 4px 20px rgba(0, 123, 255, 0.4)',
    transform: isBtnHovered ? 'translateY(-2px)' : 'translateY(0)',
    transition: 'all 0.3s ease',
  };

  const buttonDisabledStyle = { ...buttonStyle, /* ... */ };
  
  const backLinkStyle = {
    color: textColor,
    textDecoration: 'none',
    marginBottom: '20px',
    display: 'inline-flex', 
    alignItems: 'center',
    background: "rgba(255, 255, 255, 0.1)",
    padding: '10px 15px',
    borderRadius: 'var(--border-radius)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    fontWeight: '600',
    border: "1px solid rgba(255, 255, 255, 0.18)",
    transition: 'all 0.2s ease',
  };

  const infoItemCardStyle = {
    ...glassCardStyle,
    padding: '20px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    fontSize: '1.1rem',
    borderRadius: 'var(--border-radius)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  };

  const iconCircleStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: primaryColor,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: '1.2rem',
    flexShrink: 0,
  };
  
  return (
    <>
      <div style={pageStyle}>
        <div style={{ width: '100%', maxWidth: '1200px', marginBottom: '20px' }}>
          <Link 
            to="/dashboard" 
            style={backLinkStyle}
            onMouseEnter={() => setIsLinkHovered(true)}
            onMouseLeave={() => setIsLinkHovered(false)}
          >
            <span style={{ marginRight: '8px' }}>←</span> Back to Dashboard
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px', maxWidth: '800px' }}>
          <h1 style={{ color: textColor, fontWeight: '800', fontSize: '3.5rem', margin: 0 }}>
            Contact Us
          </h1>
          <p style={{ color: subtleTextColor, fontSize: '1.2rem', lineHeight: '1.6', marginTop: '15px' }}>
            We're here to help! Whether you have questions, feedback, or need support, reach out to us.
          </p>
        </div>

        <div style={mainContentGrid}>
          {/* --- LEFT COLUMN: Contact Information --- */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* Address Card */}
            <a 
              href="https://www.google.co.in/maps/place/72+Empire/@19.1160334,72.8555646,20.99z/data=!4m6!3m5!1s0x3be7c9aa08301cd3:0x9b5d749d4588805f!8m2!3d19.1158723!4d72.8554719!16s%2Fg%2F11sgcxr7_s?entry=ttu&g_ep=EgoyMDI1MTAyOS4yIKXMDSoASAFQAw%3D%3D" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={infoItemCardStyle}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
              >
                <div style={iconCircleStyle}>📍</div>
                <div>
                  <h3 style={{ margin: 0, color: textColor }}>Address</h3>
                  <p style={{ margin: 0, color: subtleTextColor }}>Brained Ai office, 72 Empire, near Gundavali Metro Station</p>
                </div>
              </div>
            </a>

            {/* Phone Card */}
            <a href="tel:+15551234567" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={infoItemCardStyle}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
              >
                <div style={iconCircleStyle}>📞</div>
                <div>
                  <h3 style={{ margin: 0, color: textColor }}>Phone</h3>
                  <p style={{ margin: 0, color: subtleTextColor }}>+1 (555) 123-4567</p>
                </div>
              </div>
            </a>

            {/* Email Card */}
            <a href="mailto:support@collabora.com" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={infoItemCardStyle}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
              >
                <div style={iconCircleStyle}>✉️</div>
                <div>
                  <h3 style={{ margin: 0, color: textColor }}>Email</h3>
                  <p style={{ margin: 0, color: subtleTextColor }}>support@collabora.com</p>
                </div>
              </div>
            </a>

            {/* --- NEW WEBSITE CARD --- */}
            <a 
              href="https://brained.app/Home" // Placeholder link
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={infoItemCardStyle}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
              >
                <div style={iconCircleStyle}>🌐</div>
                <div>
                  <h3 style={{ margin: 0, color: textColor }}>Website</h3>
                  <p style={{ margin: 0, color: subtleTextColor }}>brained.app</p>
                </div>
              </div>
            </a>
          </div>

          {/* --- RIGHT COLUMN: Contact Form --- */}
          <div style={glassCardStyle}>
            <h2 style={{ color: textColor, textAlign: 'center', fontWeight: '700', marginTop: 0, marginBottom: '30px' }}>
              Send Us a Message
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: subtleTextColor, fontWeight: '600', marginBottom: '5px', display: 'block' }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Your Name"
                  required
                  style={getInputStyle('name')}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: subtleTextColor, fontWeight: '600', marginBottom: '5px', display: 'block' }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Your Email Address"
                  required
                  style={getInputStyle('email')}
                />
              </div>
              
              {/* --- WEBSITE FIELD (REMOVED) --- */}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: subtleTextColor, fontWeight: '600', marginBottom: '5px', display: 'block' }}>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('message')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Type your message here..."
                  required
                  rows="6"
                  style={{ ...getInputStyle('message'), resize: 'vertical' }}
                />
              </div>
              
              <button 
                type="submit" 
                style={status.loading ? buttonDisabledStyle : buttonStyle} 
                disabled={status.loading}
                onMouseEnter={() => setIsBtnHovered(true)}
                onMouseLeave={() => setIsBtnHovered(false)}
              >
                {status.loading ? 'Sending...' : 'Send Message'}
              </button>
              
              {status.error && <p style={{ color: 'var(--color-danger)', textAlign: 'center', marginTop: '15px' }}>{status.error}</p>}
            </form>
          </div>
        </div>
      </div>
      
      {/* RENDER THE POPUP */}
      {status.showSuccessPopup && (
        <SuccessPopup 
          name={status.submittedName} 
          onClose={closePopup} 
        />
      )}
    </>
  );
};

export default ContactUsPage;