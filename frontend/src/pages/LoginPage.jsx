import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BRAND_BLUE = '#007aff'; 
const BRAND_ACCENT = '#74b9ff'; 
const ERROR_COLOR = '#ff6b81'; 
const IMAGE_URL = 'https://images.unsplash.com/photo-1549419163-4700d65b16e7?q=80&w=1500&auto=format&fit=crop'; 
const FONT_STACK = 'Inter, sans-serif'; 

const FACEBOOK_BLUE = '#1877f2';
const GOOGLE_RED = '#db4437';
const APPLE_BLACK = '#000000';

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
        position: 'relative', 
    },
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
        transition: 'all 0.5s ease',
    },
    formPanel: {
        flex: '0 0 60%', 
        padding: '70px 60px 50px 60px', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', 
        backgroundColor: 'transparent',
    },
    header: {
        textAlign: 'left',
        color: 'white', 
        marginBottom: '40px', 
        fontSize: '2.4rem', 
        fontWeight: 700,
        textShadow: '0 2px 5px rgba(0,0,0,0.5)',
    },
    inputGroup: {
        marginBottom: '20px', 
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.9)', 
        fontSize: '1rem',
        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
    },
    input: {
        width: '100%',
        padding: '18px', 
        backgroundColor: 'rgba(255, 255, 255, 0.15)', 
        border: '1px solid rgba(255, 255, 255, 0.5)', 
        borderRadius: '12px', 
        fontSize: '1.05rem',
        boxSizing: 'border-box',
        color: 'white', 
        outline: 'none',
        boxShadow: 'inset 0 0 8px rgba(255, 255, 255, 0.1)', 
        transition: 'all 0.3s ease-in-out',
    },
    button: {
        width: '100%',
        padding: '18px', 
        backgroundColor: BRAND_BLUE, 
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: '1.15rem',
        boxShadow: `0 8px 25px rgba(0, 122, 255, 0.4)`, 
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        marginTop: '20px',
    },
    socialLogin: {
        display: 'flex',
        gap: '15px',
        marginTop: '25px',
        justifyContent: 'center',
    },
    socialButtonBase: {
        padding: '12px 0', 
        borderRadius: '10px',
        fontWeight: 700, 
        cursor: 'pointer',
        textDecoration: 'none',
        flex: 1, 
        textAlign: 'center',
        fontSize: '0.95rem',
        transition: 'all 0.2s ease-in-out', 
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
    },
    // --- FINAL LOGO ICON STYLES ---
    logoIcon: {
        fontSize: '1.4em', 
        marginRight: '8px',
        fontWeight: '900',
        lineHeight: 1,
        // The key to aligning and displaying the symbol cleanly
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        transform: 'translateY(-1px)', 
    },
    // --- END FINAL LOGO ICON STYLES ---
    socialFacebook: { 
        backgroundColor: FACEBOOK_BLUE,
        color: 'white',
        border: 'none',
        boxShadow: `0 4px 10px rgba(24, 119, 242, 0.4)`,
        transition: 'all 0.2s ease-in-out',
    },
    socialGoogle: {
        backgroundColor: GOOGLE_RED,
        color: 'white',
        border: 'none',
        boxShadow: `0 4px 10px rgba(219, 68, 55, 0.4)`,
        transition: 'all 0.2s ease-in-out',
    },
    socialApple: {
        backgroundColor: APPLE_BLACK,
        color: 'white',
        border: 'none',
        boxShadow: `0 4px 10px rgba(0, 0, 0, 0.4)`,
        transition: 'all 0.2s ease-in-out',
    },
    linkText: {
        marginTop: '30px',
        textAlign: 'center',
        fontSize: '0.95rem',
        color: 'rgba(255, 255, 255, 0.8)', 
        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
    },
    textLink: { 
        color: BRAND_ACCENT, 
        textDecoration: 'none',
        fontWeight: '700',
        transition: 'color 0.2s ease', 
    }
};

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const API_URL = 'http://localhost:3001/api/auth/login'; 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Login failed.');
            }

            login(data, data.token);
            navigate('/dashboard');
        } catch (err) {
            if (err.message.includes('Unexpected token')) {
                setError('Connection Error: The server did not respond with valid data. Check backend console.');
            } else {
                setError(err.message.replace('Error: ', '')); 
            }
        }
    };

    return (
        <>
        <style>{styles.keyframes}</style>
        
        {/* --- Top Right Contact Link --- */}
        <Link to="/contact" style={styles.topRightLink}>
            Contact Us
        </Link>
        
        <div style={styles.pageContainer}>
            <div style={styles.formContainer}>
                
                {/* --- LEFT VISUAL PANEL (Image with Glassmorphism) --- */}
                <div style={styles.visualPanel}>
                    <h3 style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        textShadow: '0 3px 6px rgba(0,0,0,0.6)',
                        letterSpacing: '1px',
                        transition: 'opacity 0.5s ease',
                    }}>
                        Deep Focus
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
                        Enter your secure workspace.
                    </p>
                </div>
                {/* --- END LEFT VISUAL PANEL --- */}

                {/* --- RIGHT FORM PANEL (Glassmorphic Form) --- */}
                <div style={styles.formPanel}>
                    <h2 style={styles.header}>Sign In</h2>
                    
                    {error && <div style={{
                        backgroundColor: ERROR_COLOR,
                        color: 'white',
                        padding: '12px',
                        borderRadius: '10px',
                        marginBottom: '25px',
                        textAlign: 'center',
                        fontWeight: '500',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        transition: 'opacity 0.3s ease', 
                    }}>{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        
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
                                placeholder="Enter your email"
                                autoComplete="username" 
                            />
                        </div>
                        
                        {/* Password Input Group */}
                        <div style={styles.inputGroup}>
                            <label htmlFor="password" style={styles.label}>Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={styles.input}
                                placeholder="••••••••"
                                autoComplete="current-password" 
                            />
                        </div>
                        
                        {/* Remember Me / Forgot Password */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input type="checkbox" id="remember" style={{ marginRight: '10px', transform: 'scale(1.2)', transition: 'all 0.2s ease' }} />
                                <label htmlFor="remember" style={{ ...styles.label, marginBottom: 0, fontWeight: 400, color: 'rgba(255, 255, 255, 0.8)' }}>Remember me</label>
                            </div>
                            <Link to="/forgot-password" style={{...styles.textLink, fontSize: '0.9rem'}}>Forgot Password?</Link>
                        </div>

                        <button type="submit" style={styles.button}>
                            LOGIN SECURELY
                        </button>

                    </form>

                    {/* Divider and Social Login */}
                    <p style={{ 
                        textAlign: 'center', 
                        margin: '30px 0 20px 0', 
                        fontSize: '1rem', 
                        color: 'rgba(255, 255, 255, 0.7)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}>
                        — or continue with —
                    </p>

                    <div style={styles.socialLogin}>
                        <a href="#" style={{...styles.socialButtonBase, ...styles.socialFacebook}}>
                            <span style={styles.logoIcon}>f</span> Facebook
                        </a>
                        <a href="#" style={{...styles.socialButtonBase, ...styles.socialGoogle}}>
                            <span style={styles.logoIcon}>G</span> Google
                        </a>
                        <a href="#" style={{...styles.socialButtonBase, ...styles.socialApple}}>
                            <span style={styles.logoIcon}>&#xF8FF;</span> Apple 
                        </a>
                    </div>
                    
                    <p style={styles.linkText}>
                        New to Whiteboard? <Link to="/register" style={styles.textLink}>Create an account</Link>
                    </p>
                </div>
                {/* --- END RIGHT FORM PANEL --- */}
            </div>
        </div>
        </>
    );
};

export default LoginPage;