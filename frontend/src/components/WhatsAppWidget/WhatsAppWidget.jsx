import React, { useState } from 'react';
import { FiX, FiSend, FiMessageSquare } from 'react-icons/fi';

const WhatsAppIconSVG = ({ size = 28, color = "#FFF" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    style={{ color }}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.156 4.229 4.225-1.109zm10.741-6.196c-.198-.099-1.17-.578-1.353-.644-.183-.067-.317-.099-.45.099-.133.198-.516.644-.633.776-.117.133-.233.149-.431.05-.198-.099-.838-.309-1.596-.984-.59-.525-.988-1.174-1.104-1.373-.117-.198-.013-.306.086-.404.089-.089.198-.233.297-.349.099-.117.133-.198.198-.33.066-.133.033-.248-.017-.347-.05-.099-.45-1.085-.616-1.487-.163-.393-.33-.338-.45-.345-.117-.006-.25-.008-.383-.008-.133 0-.349.05-.532.248-.183.198-.7.684-.7 1.666 0 .982.716 1.931.816 2.064.099.133 1.41 2.153 3.416 3.018.477.206.85.329 1.141.422.479.152.915.131 1.26.079.385-.058 1.17-.478 1.336-.941.166-.462.166-.859.117-.941-.05-.083-.183-.133-.381-.232z"/>
  </svg>
);

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '919291303040';
  const defaultMessage = 'Namaste Sree Padmavathi Silks, I would like to inquire about your saree collections.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div 
      className="position-fixed" 
      style={{ 
        bottom: '88px', 
        right: '20px', 
        zIndex: 9998 
      }}
    >
      {/* WhatsApp Popup Card */}
      {isOpen && (
        <div 
          className="card border-0 rounded-4 shadow-lg overflow-hidden mb-3 animate__animated animate__fadeInUp"
          style={{
            width: '320px',
            background: '#FFFDF8',
            border: '1px solid #25D366'
          }}
        >
          {/* Card Header */}
          <div 
            className="p-3 text-white d-flex align-items-center justify-content-between"
            style={{ background: 'linear-gradient(135deg, #128C7E 0%, #075E54 100%)' }}
          >
            <div className="d-flex align-items-center gap-2.5">
              <div className="position-relative">
                <div 
                  className="rounded-circle bg-white text-success d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: '42px', height: '42px', fontSize: '1.2rem' }}
                >
                  <WhatsAppIconSVG size={26} color="#25D366" />
                </div>
                <span 
                  className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle p-1"
                  style={{ width: '10px', height: '10px' }}
                ></span>
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-white font-serif">Sree Padmavathi Silks</h6>
                <span className="small text-white-50" style={{ fontSize: '0.75rem' }}>🟢 Usually replies instantly</span>
              </div>
            </div>
            <button 
              className="btn text-white p-1 rounded-circle border-0"
              onClick={() => setIsOpen(false)}
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Card Body */}
          <div className="p-3">
            <div 
              className="p-2.5 rounded-3 mb-3 small"
              style={{ background: '#E7FCE3', color: '#075E54', borderLeft: '4px solid #25D366' }}
            >
              <strong>Namaste! 🙏</strong>
              <p className="mb-0 mt-1" style={{ fontSize: '0.82rem', lineHeight: '1.4' }}>
                Need help picking the perfect Kanchipuram or Banarasi silk saree? Chat directly with our store team in Hindupur.
              </p>
            </div>

            {/* Direct Link Button */}
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn text-white w-100 py-2 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2 text-decoration-none"
              style={{ background: '#25D366', color: '#FFF' }}
            >
              <WhatsAppIconSVG size={20} color="#FFF" />
              <span>Chat on WhatsApp</span>
              <FiSend size={15} />
            </a>
            <div className="text-center mt-2">
              <span className="small text-muted" style={{ fontSize: '0.72rem' }}>Number: +91 9291303040</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Circle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn p-0 border-0 rounded-circle shadow-lg d-flex align-items-center justify-content-center position-relative hover-scale"
        style={{
          width: '56px',
          height: '56px',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          color: '#FFF',
          border: '2px solid #D4AF37',
          boxShadow: '0 8px 25px rgba(37, 211, 102, 0.45)'
        }}
        title="Chat on WhatsApp (+91 9291303040)"
      >
        {isOpen ? <FiX size={26} /> : <WhatsAppIconSVG size={28} color="#FFF" />}
        
        {/* Pulse ring animation indicator */}
        {!isOpen && (
          <span 
            className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
            style={{ width: '12px', height: '12px' }}
          ></span>
        )}
      </button>
    </div>
  );
};

export default WhatsAppWidget;
