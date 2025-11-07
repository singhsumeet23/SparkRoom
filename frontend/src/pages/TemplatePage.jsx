import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ====================================================================
// --- MOCK DEPENDENCIES (Fluent Dark Theme) ---
// ====================================================================

const useUI = () => ({
  backgroundStyle: {
    style: { 
      backgroundColor: '#1a1a2e',
      backgroundImage: 'radial-gradient(at 0% 0%, #3a0e4e 0%, #1a1a2e 70%)',
      backgroundSize: 'cover',
    },
    isDark: true,
  },
});

// 🌟 EXPANDED TEMPLATE DATA with STATUS
const mockTemplates = [
    // --- DESIGN & VISUALS ---
    { id: 'moodboard', name: 'Mood Board / Vision', description: 'Gather images, color palettes, and design inspiration.', icon: '🖼️', category: 'Design', status: 'Recommended' },
    { id: 'wireframe', name: 'Website Wireframe', description: 'Low-fidelity layout for user interface design concepts.', icon: '📱', category: 'Design', status: 'New' },
    { id: 'uxtest', name: 'UX Test Flow', description: 'Map out user journey and testing feedback loops.', icon: '🧪', category: 'Design' },
    { id: 'designsystem', name: 'Design System Checklist', description: 'Outline components and design tokens to be documented.', icon: '⚙️', category: 'Design', status: 'Pro' },

    // --- PERSONAL & PLANNING ---
    { id: 'travel', name: 'Travel Planner', description: 'Itinerary, packing lists, and local research for your trip.', icon: '✈️', category: 'Personal', status: 'New' },
    { id: 'visionboard', name: 'Personal Vision Board', description: 'Visualizing and setting long-term personal goals.', icon: '✨', category: 'Personal' },
    { id: 'budget', name: 'Household Budget', description: 'Track monthly expenses and savings goals visually.', icon: '💵', category: 'Personal' },
    
    // --- MARKETING & SALES ---
    { id: 'contentcal', name: 'Content Calendar', description: 'Plan social media and blog posts across weekly schedule.', icon: '📅', category: 'Marketing', status: 'Recommended' },
    { id: 'customerjourney', name: 'Customer Journey Map', description: 'Identify touchpoints and pain points in the customer lifecycle.', icon: '🎯', category: 'Marketing', status: 'Pro' },
    
    // --- HR & EDUCATION ---
    { id: 'onboarding', name: 'Employee Onboarding Flow', description: 'Checklist and resources for new hire integration.', icon: '🤝', category: 'HR/EDU' },
    { id: 'lessonplan', name: 'Lesson Planning Board', description: 'Structure class activities, goals, and resources visually.', icon: '🍎', category: 'HR/EDU', status: 'New' },
];

// --- TEMPLATE PAGE COMPONENT ---
const TemplatePage = () => {
    const navigate = useNavigate();
    const { backgroundStyle } = useUI();
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    // 🌟 NEW STATE: Control the visibility of the modal preview
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    
    const carouselRefs = useRef({}); 
    
    const filteredTemplates = mockTemplates.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
    ).reduce((acc, template) => {
        const category = template.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(template);
        return acc;
    }, {});

    // --- STYLES & CONSTANTS (Fluent Design) ---
    const FLUENT_BLUE = "#5E38CC"; 
    const FLUENT_PRIMARY_TEXT = "#FFFFFF";
    const FLUENT_SECONDARY_TEXT = "#D8D8D8";
    const CARD_SCROLL_WIDTH = 320; 

    const glassCardStyle = {
        padding: "20px",
        borderRadius: "12px",
        background: "rgba(32, 32, 45, 0.65)",
        backdropFilter: "blur(25px)",
        WebkitBackdropFilter: "blur(25px)",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        color: FLUENT_PRIMARY_TEXT,
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        cursor: 'pointer',
    };
    
    const carouselButtonStyle = {
        padding: '5px 12px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: FLUENT_PRIMARY_TEXT,
        borderRadius: '50%',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        cursor: 'pointer',
        fontWeight: 'bold',
        lineHeight: '1',
        fontSize: '1.2rem',
        transition: 'background-color 0.2s',
    };

    const scrollCarousel = (category, direction) => {
        const ref = carouselRefs.current[category];
        if (ref) {
            const scrollAmount = direction === 'left' ? -CARD_SCROLL_WIDTH : CARD_SCROLL_WIDTH;
            ref.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // 🌟 UPDATED HANDLER: Set modal visible when selecting template
    const handleSelectTemplate = (template) => {
        setSelectedTemplate(template);
        setShowPreviewModal(true);
    };

    const handleCreateBoard = () => {
        if (selectedTemplate) navigate(`/document/new-${Date.now()}?template=${selectedTemplate.id}`);
    };

    const getStatusStyle = (status) => {
        let backgroundColor, color;
        switch (status) {
            case 'New':
                backgroundColor = '#18A0FB'; 
                color = '#fff';
                break;
            case 'Pro':
                backgroundColor = '#FFD166'; 
                color = '#000';
                break;
            case 'Recommended':
                backgroundColor = '#06D6A0'; 
                color = '#000';
                break;
            default:
                return {};
        }
        return {
            backgroundColor,
            color,
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            marginLeft: '10px',
            textTransform: 'uppercase',
            display: 'inline-block',
        };
    };

    // --- Reusable function to render a single carousel ---
    const renderCarousel = (id, title, list) => {
        if (list.length === 0 && !searchTerm) return null; 

        return (
            <div key={id} style={{ marginBottom: '30px' }}>
                
                {/* CAROUSEL HEADER WITH ARROWS */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ color: FLUENT_SECONDARY_TEXT, borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '5px' }}>
                        {title}
                    </h4>
                    <div>
                        <button 
                            onClick={() => scrollCarousel(id, 'left')}
                            style={carouselButtonStyle}>
                            &lt;
                        </button>
                        <button 
                            onClick={() => scrollCarousel(id, 'right')}
                            style={{...carouselButtonStyle, marginLeft: '10px'}}>
                            &gt;
                        </button>
                    </div>
                </div>
                
                {/* HORIZONTAL CAROUSEL CONTAINER */}
                <div 
                    ref={el => carouselRefs.current[id] = el}
                    style={{ 
                        display: 'flex', 
                        overflowX: 'scroll', 
                        gap: '20px', 
                        paddingBottom: '15px',
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none',
                    }}
                >
                    {list.map((template) => (
                        <div
                            key={template.id}
                            onClick={() => handleSelectTemplate(template)}
                            style={{
                                ...glassCardStyle,
                                flexShrink: 0, 
                                width: '300px', 
                                border: selectedTemplate?.id === template.id 
                                    ? `2px solid ${FLUENT_BLUE}`
                                    : '1px solid rgba(255, 255, 255, 0.08)',
                                position: 'relative',
                            }}
                        >
                            {template.status && (
                                <span style={{ position: 'absolute', top: 10, right: 10, ...getStatusStyle(template.status) }}>
                                    {template.status}
                                </span>
                            )}

                            <div style={{ fontSize: '2rem', marginBottom: '10px', marginTop: template.status ? '10px' : '0' }}>{template.icon}</div>
                            <h4 style={{ color: FLUENT_PRIMARY_TEXT, marginBottom: '5px' }}>{template.name}</h4>
                            <p style={{ color: FLUENT_SECONDARY_TEXT, fontSize: '0.9rem', whiteSpace: 'normal' }}>{template.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // --- Render Categorized Carousel Groups ---
    const renderTemplateGroups = (templates) => {
        const groups = Object.entries(templates);
        if (groups.length === 0 && searchTerm) {
             return <p style={{ color: FLUENT_SECONDARY_TEXT, padding: '20px 0' }}>No templates found matching "{searchTerm}".</p>;
        }
        
        return groups.map(([category, templateList]) => (
            renderCarousel(category, `${category} Templates`, templateList)
        ));
    };


    return (
        <div style={{ minHeight: "100vh", background: backgroundStyle.style.backgroundImage, transition: 'background 0.3s ease', backgroundColor: backgroundStyle.style.backgroundColor }}>
            
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "50px 20px", color: FLUENT_PRIMARY_TEXT }}>
                
                {/* --- HEADER, SEARCH, & BACK BUTTON --- */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px" }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 600 }}>Template Gallery</h2>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            padding: "10px 18px",
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            color: FLUENT_PRIMARY_TEXT,
                            borderRadius: "8px",
                            border: 'none',
                            fontWeight: 500,
                            alignSelf: 'flex-start'
                        }}
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                {/* Search Bar (Prominent) */}
                <input
                    type="text"
                    placeholder="Search thousands of templates for 'Design', 'Personal', 'Moodboard'..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setSelectedTemplate(null); 
                        setShowPreviewModal(false); // Hide modal on search
                    }}
                    style={{ 
                        width: '100%', 
                        marginBottom: '30px',
                        color: FLUENT_PRIMARY_TEXT, 
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        padding: '15px',
                        borderRadius: '8px',
                        fontSize: '1.1rem'
                    }}
                />


                {/* --- 1. FEATURED BROWSE CAROUSEL --- */}
                {renderCarousel('browse_all', '⭐ Featured & Recommended Boards', mockTemplates.filter(t => t.status === 'Recommended' || t.status === 'New'))}


                {/* --- MAIN CONTENT GRID (Gallery) --- */}
                <div style={{ marginTop: '30px' }}> 
                    
                    <h3 style={{ marginBottom: 20, color: FLUENT_PRIMARY_TEXT, borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '5px' }}>
                        Browse by Category
                    </h3>
                    {renderTemplateGroups(filteredTemplates)}

                    {/* Blank Board Option (static) */}
                    <div style={{ marginTop: '30px' }}>
                        <h4 style={{ color: FLUENT_SECONDARY_TEXT, marginBottom: '15px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '5px' }}>
                            Start Fresh
                        </h4>
                        <div 
                            onClick={() => handleSelectTemplate({ id: 'blank', name: 'Start Blank', description: 'A completely empty canvas, no structure, no limits.', icon: '⬜' })}
                            style={{
                                ...glassCardStyle,
                                width: '300px', // Set back to a fixed width
                                backgroundColor: 'rgba(32, 32, 45, 0.4)',
                                border: selectedTemplate?.id === 'blank'
                                    ? `2px solid ${FLUENT_BLUE}`
                                    : '1px solid rgba(255, 255, 255, 0.08)',
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⬜</div>
                            <h4 style={{ color: FLUENT_PRIMARY_TEXT, marginBottom: '5px' }}>Start Blank</h4>
                            <p style={{ color: FLUENT_SECONDARY_TEXT, fontSize: '0.9rem' }}>A completely empty canvas.</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* ======================================================= */}
            {/* 🌟 TEMPLATE PREVIEW MODAL OVERLAY */}
            {/* ======================================================= */}
            {showPreviewModal && selectedTemplate && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setShowPreviewModal(false)}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.75)',
                            zIndex: 1000,
                        }}
                    />

                    {/* Modal Content */}
                    <div
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90%',
                            maxWidth: '900px',
                            ...glassCardStyle,
                            padding: '40px',
                            zIndex: 1001,
                            display: 'flex',
                            gap: '30px',
                            alignItems: 'flex-start'
                        }}
                    >
                        {/* LEFT: Template Visual/Preview */}
                        <div style={{ flexGrow: 1 }}>
                            <h3 style={{ marginBottom: '15px' }}>Visual Preview</h3>
                            <div style={{ 
                                height: '500px', 
                                backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                                borderRadius: '8px', 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}>
                                <span style={{color: FLUENT_SECONDARY_TEXT, fontStyle: 'italic', fontSize: '1.2rem'}}>
                                    [Large Visual Mockup of {selectedTemplate.name}]
                                </span>
                            </div>
                        </div>

                        {/* RIGHT: Details & Action */}
                        <div style={{ width: '300px', flexShrink: 0 }}>
                            <h2 style={{ color: FLUENT_PRIMARY_TEXT, marginBottom: '5px' }}>
                                {selectedTemplate.icon} {selectedTemplate.name}
                            </h2>
                            <p style={{ color: FLUENT_SECONDARY_TEXT, fontSize: '0.9rem', marginBottom: '20px' }}>
                                Category: {selectedTemplate.category || 'General'}
                                {selectedTemplate.status && (
                                    <span style={{ marginLeft: '10px', ...getStatusStyle(selectedTemplate.status) }}>
                                        {selectedTemplate.status}
                                    </span>
                                )}
                            </p>
                            
                            <p style={{ color: FLUENT_PRIMARY_TEXT, marginBottom: '40px' }}>
                                {selectedTemplate.description}
                            </p>
                            
                            <button
                                onClick={handleCreateBoard}
                                style={{
                                    width: '100%',
                                    padding: "18px 20px",
                                    backgroundColor: FLUENT_BLUE, 
                                    color: "white",
                                    borderRadius: "8px",
                                    fontWeight: 'bold',
                                    border: 'none',
                                    marginBottom: '10px'
                                }}
                            >
                                Use This Template
                            </button>

                            <button
                                onClick={() => setShowPreviewModal(false)}
                                style={{
                                    width: '100%',
                                    padding: "10px 20px",
                                    backgroundColor: 'transparent',
                                    color: FLUENT_SECONDARY_TEXT,
                                    borderRadius: "8px",
                                    border: `1px solid ${FLUENT_SECONDARY_TEXT}`,
                                    fontWeight: 'normal',
                                }}
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TemplatePage;