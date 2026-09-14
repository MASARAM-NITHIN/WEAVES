import React, { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="btn btn-gold rounded-circle shadow-lg position-fixed bottom-0 end-0 m-4 p-3 d-flex align-items-center justify-content-center"
      style={{
        zIndex: 1000,
        width: '46px',
        height: '46px',
        border: '1px solid #FFFDF8',
        animation: 'bounceIn 0.4s ease'
      }}
      title="Back to Top"
    >
      <FiArrowUp size={22} className="text-white" />
    </button>
  );
};

export default BackToTop;
