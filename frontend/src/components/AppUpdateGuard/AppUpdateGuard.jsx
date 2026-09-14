import React, { useState, useEffect } from 'react';
import { FiDownloadCloud, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { GiCrown, GiSparkles } from 'react-icons/gi';

const INITIAL_BUILD_TIME = Date.now();

const AppUpdateGuard = ({ children }) => {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let timer;
    const checkForUpdates = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const serverTime = Number(data.buildTimestamp) || 0;
          const localSavedTime = Number(localStorage.getItem('sps_app_build_timestamp')) || 0;

          if (localSavedTime > 0 && serverTime > localSavedTime) {
            setHasUpdate(true);
          } else if (localSavedTime === 0) {
            // First run - record current build timestamp without showing popup
            localStorage.setItem('sps_app_build_timestamp', serverTime.toString() || INITIAL_BUILD_TIME.toString());
          }
        }
      } catch (e) {}
    };

    // Check on startup
    checkForUpdates();

    // Poll every 30 seconds for new app builds
    const interval = setInterval(checkForUpdates, 30000);

    // Listen ONLY for explicit APP_UPDATED events
    let channel;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('sree_padmavathi_cloud_channel');
        channel.onmessage = (event) => {
          if (event.data && event.data.type === 'APP_UPDATED') {
            setHasUpdate(true);
          }
        };
      }
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
      if (timer) clearInterval(timer);
    };
  }, []);

  // Auto-countdown timer to refresh app when update is ready
  useEffect(() => {
    if (!hasUpdate) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleApplyUpdate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasUpdate]);

  const handleApplyUpdate = () => {
    setIsUpdating(true);
    try {
      localStorage.setItem('sps_app_build_timestamp', Date.now().toString());
      if (typeof window !== 'undefined') {
        window.location.reload(true);
      }
    } catch (e) {
      window.location.reload();
    }
  };

  if (!hasUpdate) return children;

  return (
    <>
      {children}
      <div 
        className="position-fixed bottom-0 start-0 w-100 p-3 p-md-4 d-flex justify-content-center"
        style={{ zIndex: 999999, pointerEvents: 'none' }}
      >
      <div 
        className="card border-0 rounded-4 shadow-2xl p-3 p-md-4 max-w-500 w-100 animate__animated animate__bounceInUp"
        style={{
          pointerEvents: 'auto',
          background: 'linear-gradient(135deg, #7B112C 0%, #4A0517 100%)',
          color: '#FFFDF8',
          border: '2px solid #C8A54B',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}
      >
        <div className="d-flex align-items-center gap-3 mb-2">
          <div 
            className="rounded-circle p-2 bg-gold text-maroon d-flex align-items-center justify-content-center shadow"
            style={{ width: '44px', height: '44px', flexShrink: 0 }}
          >
            <GiCrown size={26} />
          </div>

          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-warning text-dark font-montserrat fw-bold px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                <GiSparkles className="me-1" /> NEW VERSION READY
              </span>
            </div>
            <h6 className="font-serif fw-bold text-gold mb-0 mt-1" style={{ fontSize: '1rem' }}>
              App Update Available!
            </h6>
          </div>
        </div>

        <p className="font-poppins mb-3 opacity-90" style={{ fontSize: '0.84rem', lineHeight: '1.4' }}>
          Sree Padmavathi Silks has been updated with new saree collections and performance enhancements.
        </p>

        <div className="d-flex align-items-center gap-2">
          <button 
            onClick={handleApplyUpdate}
            disabled={isUpdating}
            className="btn btn-gold w-100 py-2.5 rounded-pill font-montserrat fw-bold text-maroon shadow-sm d-flex align-items-center justify-content-center gap-2"
            style={{ fontSize: '0.88rem' }}
          >
            <FiRefreshCw className={isUpdating ? 'spin-animation' : ''} size={16} />
            <span>{isUpdating ? 'Updating App...' : `Update Now (Auto-sync in ${countdown}s)`}</span>
          </button>
        </div>
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
    </>
  );
};

export default AppUpdateGuard;
