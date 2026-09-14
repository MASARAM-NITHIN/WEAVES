import React, { useState, useEffect } from 'react';
import { FiTruck, FiRotateCcw, FiShield, FiPhoneCall, FiX, FiAward } from 'react-icons/fi';

const announcements = [
  { icon: <FiTruck className="text-warning" />, text: "Free Domestic Shipping Across India on Orders Above ₹4,999" },
  { icon: <FiRotateCcw className="text-warning" />, text: "Hassle-Free 7-Day Silk Exchange Guarantee" },
  { icon: <FiShield className="text-warning" />, text: "100% Certified Pure Silk Mark & Authentic Handloom Guarantee" },
  { icon: <FiAward className="text-warning" />, text: "Complimentary Designer Stitching & Saree Fall/Peco Service" }
];

const AnnouncementBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="announcement-bar py-2 px-3 text-white position-relative"
      style={{
        background: 'linear-gradient(90deg, #580B1F 0%, #7B112C 50%, #580B1F 100%)',
        borderBottom: '1px solid rgba(200, 165, 75, 0.3)',
        fontSize: '0.82rem',
        fontWeight: '500'
      }}
    >
      <div className="container d-flex justify-content-between align-items-center">
        <div className="d-none d-md-flex align-items-center gap-2">
          <FiPhoneCall className="text-warning me-1" />
          <span>Customer Support: <strong>+91 9291303040</strong></span>
        </div>

        <div className="text-center flex-grow-1 mx-2 overflow-hidden position-relative style-slider" style={{ minHeight: '24px' }}>
          <div 
            className="d-flex align-items-center justify-content-center gap-2 transition-all"
            key={currentIndex}
            style={{ animation: 'fadeInDown 0.5s ease-in-out' }}
          >
            {announcements[currentIndex].icon}
            <span className="text-truncate" style={{ letterSpacing: '0.3px' }}>
              {announcements[currentIndex].text}
            </span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <span className="d-none d-lg-inline badge bg-warning text-dark px-2 py-1 font-montserrat" style={{ fontSize: '0.7rem' }}>
            WORLDWIDE SHIPPING
          </span>
          <button 
            onClick={() => setIsVisible(false)}
            className="btn btn-link text-white p-0 opacity-75 opacity-100-hover"
            title="Dismiss"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
