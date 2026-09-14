import React, { useState, useEffect } from 'react';
import { FiWifiOff, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import { GiCrown } from 'react-icons/gi';

const InternetCheckGuard = ({ children }) => {
  const [isOnline, setIsOnline] = useState(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic heartbeat check
    const interval = setInterval(() => {
      if (typeof navigator !== 'undefined') {
        setIsOnline(navigator.onLine);
      }
    }, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleRetry = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsOnline(navigator.onLine);
      setIsChecking(false);
    }, 1000);
  };

  if (isOnline) return children;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        zIndex: 99999,
        backgroundColor: 'rgba(46, 28, 43, 0.96)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      <div 
        className="card border-0 rounded-5 p-4 p-md-5 text-center shadow-2xl max-w-500 w-100 animate__animated animate__fadeInUp"
        style={{
          background: '#FFFDF8',
          border: '2px solid #C8A54B'
        }}
      >
        <div 
          className="rounded-circle d-inline-flex p-3 mb-3 bg-maroon text-gold shadow-md"
          style={{ width: '70px', height: '70px', alignItems: 'center', justifyContent: 'center' }}
        >
          <FiWifiOff size={36} />
        </div>

        <span className="badge bg-danger-subtle text-danger font-montserrat px-3 py-1 rounded-pill mb-2 fw-bold" style={{ fontSize: '0.78rem' }}>
          MANDATORY CONNECTION REQUIRED
        </span>

        <h3 className="font-serif fw-bold text-maroon mb-2">Internet Connection Lost</h3>

        <p className="font-poppins text-muted mb-4" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
          Sree Padmavathi Silks mobile app requires an active Internet connection to synchronize live saree catalog updates, prices, stock levels, and checkout with our store server.
        </p>

        <div className="p-3 rounded-4 bg-light-gold mb-4 border-gold text-start font-poppins" style={{ fontSize: '0.82rem' }}>
          <div className="d-flex align-items-center gap-2 text-maroon fw-bold mb-1">
            <GiCrown size={18} className="text-gold" />
            <span>Live Web & Mobile Synchronization</span>
          </div>
          <span className="text-dark opacity-80">
            Please connect your mobile device to Wi-Fi or Mobile Data (4G/5G) to continue browsing our luxury saree collection.
          </span>
        </div>

        <button 
          onClick={handleRetry} 
          disabled={isChecking}
          className="btn btn-maroon w-100 py-3 rounded-pill font-montserrat fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2"
        >
          <FiRefreshCw className={isChecking ? 'spin-animation' : ''} size={18} />
          <span>{isChecking ? 'Checking Network Connection...' : 'Retry Connection'}</span>
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default InternetCheckGuard;
