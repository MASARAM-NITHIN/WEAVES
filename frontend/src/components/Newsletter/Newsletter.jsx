import React, { useState } from 'react';
import { FiMail, FiCheckCircle } from 'react-icons/fi';
import { GiCrown } from 'react-icons/gi';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 5000);
    }
  };

  return (
    <section className="newsletter-section py-5">
      <div className="container">
        <div 
          className="card border-0 rounded-5 p-4 p-md-5 text-white position-relative overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #7B112C 0%, #580B1F 50%, #400716 100%)',
            border: '2px solid #C8A54B'
          }}
        >
          {/* Decorative Gold Watermark */}
          <GiCrown 
            size={220} 
            className="position-absolute end-0 bottom-0 text-gold opacity-10 pe-none" 
            style={{ transform: 'translate(40px, 40px)' }}
          />

          <div className="row align-items-center position-relative z-2">
            <div className="col-lg-7 mb-4 mb-lg-0">
              <div className="d-flex align-items-center gap-2 mb-2 text-gold">
                <FiMail size={22} />
                <span className="font-montserrat fw-bold text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '2px' }}>
                  Royal Privilege Club
                </span>
              </div>
              <h2 className="font-serif fw-bold text-white mb-2" style={{ fontSize: 'calc(1.5rem + 1vw)' }}>
                Subscribe to Receive Private Previews & Exclusive Festive Offers
              </h2>
              <p className="text-white-80 font-poppins mb-0" style={{ fontSize: '0.95rem', color: '#FFFDF8' }}>
                Join over 45,000 silk connoisseurs for new collection releases, weaving artisan stories, and VIP bridal discounts.
              </p>
            </div>

            <div className="col-lg-5">
              {subscribed ? (
                <div className="p-3 bg-white text-maroon rounded-4 font-montserrat fw-bold text-center animate__animated animate__fadeIn">
                  <FiCheckCircle size={28} className="text-success mb-1" />
                  <div>Welcome to the Sree Padmavathi Royalty Club!</div>
                  <small className="text-muted font-poppins font-normal">Check your inbox for your 10% welcome coupon.</small>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="d-flex flex-column flex-sm-row gap-2 bg-white p-2 rounded-pill shadow-lg">
                  <input
                    type="email"
                    required
                    className="form-control border-0 shadow-none px-3 py-2 font-poppins rounded-pill"
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ fontSize: '0.9rem' }}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-gold rounded-pill px-4 py-2 font-montserrat fw-bold text-nowrap"
                  >
                    Subscribe Now
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
