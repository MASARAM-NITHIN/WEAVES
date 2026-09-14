import React from 'react';
import { GiCrown } from 'react-icons/gi';

const Loader = () => {
  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
      style={{
        zIndex: 9999,
        background: '#7B112C',
        color: '#FFFDF8'
      }}
    >
      <div className="position-relative mb-3 d-flex align-items-center justify-content-center">
        <GiCrown size={64} className="text-gold spinning-loom" />
      </div>
      <h3 className="font-serif fw-bold text-white mb-1" style={{ letterSpacing: '1px' }}>
        Sree Padmavathi Silks
      </h3>
      <span className="font-montserrat text-gold text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '2.5px' }}>
        Weaving Timeless Elegance...
      </span>

      <style>{`
        .spinning-loom {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
