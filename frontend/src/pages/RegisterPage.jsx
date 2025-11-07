import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BRAND_ACCENT = '#74b9ff'; 
const REGISTER_COLOR = '#00b894'; 
const ERROR_COLOR = '#ff6b81'; 
const IMAGE_URL = 'https://images.unsplash.com/photo-1549419163-4700d65b16e7?q=80&w=1500&auto=format&fit=crop'; 
const FONT_STACK = 'Inter, sans-serif'; 

const styles = {
    keyframes: `
        @keyframes slideInUp {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `,
    pageContainer: {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #4da6ff 0%, #90d4ff 50%, #b8e9ff 100%)', 
        fontFamily: FONT_STACK,
        position: 'relative', // Necessary for absolute positioning of top-right link
    },
    // --- NEW: Top Right Contact Link Style ---
    topRightLink: {
        position: 'fixed',
        top: '30px',
        right: '30px',
        color: 'white', 
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        padding: '10px 15px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '1rem',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        transition: 'all 0.3s ease',
        zIndex: 10,
    },
    // --- END NEW ---
    formContainer: {
        maxWidth: '850px', 
        width: '90%', 
        height: '580px', 
        display: 'flex', 
        overflow: 'hidden', 
        borderRadius: '25px', 
        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(15px) saturate(150%)', 
        WebkitBackdropFilter: 'blur(15px) saturate(150%)', 
        border: '1px solid rgba(255, 255, 255, 0.4)', 
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2), inset 0 0 10px rgba(255, 255, 255, 0.3)', 
        animation: 'slideInUp 0.8s ease-out forwards',
        opacity: 0,
    },
    visualPanel: {
        flex: '0 0 40%', 
        backgroundImage: `url("${IMAGE_URL}")`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay', 
        backgroundColor: 'rgba(0, 122, 255, 0.6)', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        padding: '60px 30px', 
        borderRight: '1px solid rgba(255, 255, 255, 0.3)', 
    },
    formPanel: {
        flex: '0 0 60%', 
        padding: '40px 60px', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', 
        backgroundColor: 'transparent',
    },
    header: {
        textAlign: 'left',
        color: 'white', 
        marginBottom: '25px', 
        fontSize: '2.2rem', 
        fontWeight: 700,
        textShadow: '0 2px 5px rgba(0,0,0,0.5)',
    },
    inputGroup: {
        marginBottom: '12px', 
    },
    label: {
        display: 'block',
        marginBottom: '6px',
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.9)', 
        fontSize: '0.95rem',
        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
    },
    input: {
        width: '100%',
        padding: '16px', 
        backgroundColor: 'rgba(255, 255, 255, 0.15)', 
        border: '1px solid rgba(255, 255, 255, 0.5)', 
        borderRadius: '12px', 
        fontSize: '1rem',
        boxSizing: 'border-box',
        color: 'white', 
        outline: 'none',
        boxShadow: 'inset 0 0 8px rgba(255, 255, 255, 0.1)', 
        transition: 'all 0.3s ease-in-out',
    },
    inputError: {
        borderColor: ERROR_COLOR,
        boxShadow: `inset 0 0 8px rgba(255, 255, 255, 0.1), 0 0 0 2px ${ERROR_COLOR}`,
    },
    button: {
        width: '100%',
        padding: '18px', 
        backgroundColor: REGISTER_COLOR, 
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: '1.15rem',
        boxShadow: `0 8px 25px rgba(0, 184, 148, 0.4)`, 
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        marginTop: '20px',
    },
    errorBox: {
        backgroundColor: ERROR_COLOR,
        color: 'white',
        padding: '12px',
        borderRadius: '10px',
        marginBottom: '15px', 
        textAlign: 'center',
        fontWeight: '500',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    },
    validationError: {
        color: ERROR_COLOR,
        fontSize: '0.85rem',
        marginTop: '5px',
        fontWeight: 500,
    },
    textLink: { 
        color: BRAND_ACCENT, 
        textDecoration: 'none',
        fontWeight: '700',
        transition: 'color 0.2s ease', 
    }
};

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); 
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const API_URL = 'http://localhost:3001/api/auth/register'; 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (password !== confirmPassword) {
            setError("Passwords do not match. Please ensure both fields are identical.");
            return;
        }
        // ... (Logic remains the same)
    };

    const passwordsMatch = password === confirmPassword;

    return (
        <>
        <style>{styles.keyframes}</style>

        {/* --- NEW: Top Right Contact Link --- */}
        <Link to="/contact" style={styles.topRightLink}>
            Contact Us
        </Link>
        
        <div style={styles.pageContainer}>
            <div style={styles.formContainer}>
                
                {/* --- LEFT VISUAL PANEL --- */}
                <div style={styles.visualPanel}>
                    <h3 style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        textShadow: '0 3px 6px rgba(0,0,0,0.6)',
                        letterSpacing: '1px',
                        transition: 'opacity 0.5s ease',
                    }}>
                        Start Creating
                    </h3>
                    <p style={{
                        fontSize: '1.1rem',
                        marginTop: '10px',
                        opacity: 0.9,
                        textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                        lineHeight: '1.4',
                        textAlign: 'center',
                        maxWidth: '80%',
                        transition: 'opacity 0.5s ease 0.1s', 
                    }}>
                        Join the collaborative space in just a few clicks.
                    </p>
                </div>
                {/* --- END LEFT VISUAL PANEL --- */}

                {/* --- RIGHT FORM PANEL (Glassmorphic Form) --- */}
                <div style={styles.formPanel}>
                    <h2 style={styles.header}>Create Your Account</h2>
                    
                    {error && <div style={{...styles.errorBox, transition: 'opacity 0.3s ease'}}>{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        
                        {/* Name Input Group */}
                        <div style={styles.inputGroup}>
                            <label htmlFor="name" style={styles.label}>Full Name</label>
                            <input 
                                id="name"
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required 
                                style={styles.input}
                                placeholder="e.g., Jane Doe"
                                autoComplete="name"
                            />
                        </div>
                        
                        {/* Email Input Group */}
                        <div style={styles.inputGroup}>
                            <label htmlFor="email" style={styles.label}>Email Address</label>
                            <input 
                                id="email"
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                style={styles.input}
                                placeholder="name@example.com"
                                autoComplete="email"
                            />
                        </div>
                        
                        {/* New Password Input Group */}
                        <div style={styles.inputGroup}>
                            <label htmlFor="password" style={styles.label}>Set a Strong Password</label>
                            <input 
                                id="password"
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                style={styles.input}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                        </div>

                        {/* Confirm Password Input Group */}
                        <div style={styles.inputGroup}>
                            <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
                            <input 
                                id="confirmPassword"
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                                style={
                                    (!passwordsMatch && confirmPassword.length > 0) 
                                        ? {...styles.input, ...styles.inputError}
                                        : styles.input
                                }
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            {(!passwordsMatch && confirmPassword.length > 0) && (
                                <div style={styles.validationError}>Passwords do not match.</div>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            style={styles.button}
                            disabled={!passwordsMatch && confirmPassword.length > 0} 
                        >
                            SIGN UP & START CREATING
                        </button>
                    </form>
                    
                    <p style={{marginTop: '30px', textAlign: 'center', fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.8)'}}>
                        Already a member? <Link to="/login" style={styles.textLink}>Sign In here</Link>
                    </p>
                </div>
                {/* --- END RIGHT FORM PANEL --- */}
            </div>
        </div>
        </>
    );
};

export default RegisterPage;