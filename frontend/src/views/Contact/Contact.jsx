import React, { useState } from 'react';
import { FiPhone, FiMail, FiMapPin, FiClock, FiCheckCircle, FiSend, FiExternalLink } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

const storesList = [
  {
    city: "Sree Padmavathi Silks (Flagship Store)",
    address: "Subash nagar, Muddireddypalli, Hindupur, Sri Sathya Sai, Andhra Pradesh 515201",
    phone: "+91 9291303040",
    timing: "10:00 AM – 9:00 PM (Open All 7 Days)"
  }
];

const Contact = () => {
  const { addInquiry, orderHistory } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    orderId: '',
    email: '',
    phone: '',
    sareeInterest: 'Bridal Kanchipuram Consultation',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [orderIdError, setOrderIdError] = useState('');

  const handleOrderIdChange = (val) => {
    setOrderIdError('');
    let cleaned = val.toUpperCase().replace(/[^A-Z0-9-]/g, '');

    // Auto prepend SPS- if customer types digits
    if (/^\d+$/.test(cleaned)) {
      cleaned = `SPS-${cleaned}`;
    } else if (cleaned.length > 0 && !cleaned.startsWith('SPS-') && !cleaned.startsWith('SPS')) {
      const digits = cleaned.replace(/[^0-9]/g, '');
      cleaned = digits ? `SPS-${digits}` : 'SPS-';
    }

    if (cleaned.length > 10) {
      cleaned = cleaned.slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, orderId: cleaned }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOrderIdError('');

    // Order ID format check: Mandatory
    if (!formData.orderId.trim()) {
      setOrderIdError('Order ID is required.');
      return;
    }
    const orderIdRegex = /^SPS-\d{6}$/;
    if (!orderIdRegex.test(formData.orderId.trim())) {
      setOrderIdError('Invalid Order ID format! Must be in format SPS-XXXXXX (e.g. SPS-771624).');
      return;
    }

    if (!formData.name || !formData.phone || !formData.message) {
      alert('Please fill out all required fields.');
      return;
    }

    addInquiry(formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', orderId: '', email: '', phone: '', sareeInterest: 'Bridal Kanchipuram Consultation', message: '' });
    }, 6000);
  };

  return (
    <div className="contact-page py-5 bg-ivory">
      <div className="container py-3">
        
        {/* Header */}
        <div className="section-title-wrap text-center mb-5">
          <span className="section-subtitle">We Are Here For You</span>
          <h1 className="section-title">Visit Our Flagship Store or Get in Touch</h1>
          <p className="text-muted font-poppins" style={{ fontSize: '0.95rem' }}>
            Book a private video shopping consultation or visit our boutique showroom in Hindupur.
          </p>
          <div className="gold-divider">
            <span className="gold-diamond"></span>
          </div>
        </div>

        <div className="row g-5 mb-5">
          {/* Contact Form Column */}
          <div className="col-lg-6">
            <div className="card border-0 rounded-4 p-4 p-md-5 bg-white shadow-md border-gold">
              <h3 className="font-serif fw-bold text-maroon mb-3">Send Us a Message</h3>
              <p className="text-muted font-poppins mb-4" style={{ fontSize: '0.88rem' }}>
                Have questions about custom bridal weaving, blouse tailoring, or order status? Fill out the form below or call us at <strong>+91 9291303040</strong>.
              </p>

              {submitted ? (
                <div className="p-4 bg-light-gold text-maroon rounded-4 text-center font-montserrat fw-bold animate__animated animate__fadeIn">
                  <FiCheckCircle size={40} className="text-success mb-2" />
                  <h4>Thank You, {formData.name || 'Patron'}!</h4>
                  <p className="font-poppins text-muted mb-0" style={{ fontSize: '0.88rem' }}>
                    Our luxury saree concierge has received your request and will reach out within 2 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3 font-poppins">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: '0.85rem' }}>
                        Full Name *
                      </label>
                      <input 
                        type="text" 
                        required 
                        className="form-control border-gold rounded-3"
                        placeholder="e.g. Ananya Sundaram"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: '0.85rem' }}>
                        Order ID *
                      </label>
                      <input 
                        type="text" 
                        required
                        maxLength={10}
                        className={`form-control border-gold rounded-3 font-montserrat fw-bold ${orderIdError ? 'is-invalid border-danger' : ''}`}
                        placeholder="SPS-771624"
                        value={formData.orderId}
                        onChange={(e) => handleOrderIdChange(e.target.value)}
                        list="recent-customer-orders"
                      />
                      {orderHistory && orderHistory.length > 0 && (
                        <datalist id="recent-customer-orders">
                          {(orderHistory || []).map((ord) => (
                            <option key={ord.id || ord.orderCode} value={ord.orderCode || ord.id}>
                            {ord.orderCode || ord.id} ({ord.customerName || (ord.customer?.firstName ? ord.customer.firstName : 'Customer')})
                          </option>
                          ))}
                        </datalist>
                      )}
                      {orderIdError ? (
                        <small className="text-danger font-poppins d-block mt-1 fw-bold" style={{ fontSize: '0.78rem' }}>
                          ⚠️ {orderIdError}
                        </small>
                      ) : (
                        <small className="text-muted font-poppins d-block mt-1" style={{ fontSize: '0.75rem' }}>
                          Format: <strong className="text-maroon">SPS-123456</strong> (e.g. SPS-771624)
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Email Address *</label>
                      <input 
                        type="email" 
                        required 
                        className="form-control border-gold rounded-3"
                        placeholder="ananya@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Phone / WhatsApp *</label>
                      <div className="input-group">
                        <span className="input-group-text border-gold bg-light fw-bold text-dark">+91</span>
                        <input 
                          type="tel" 
                          required 
                          className="form-control border-gold"
                          style={{ borderTopRightRadius: '0.375rem', borderBottomRightRadius: '0.375rem' }}
                          placeholder="9999999999"
                          value={formData.phone}
                          onChange={(e) => {
                            const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
                            setFormData({ ...formData, phone: onlyNumbers });
                          }}
                        />
                      </div>
                    </div>
                  </div>


                  <div>
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Message / Custom Requirements</label>
                    <textarea 
                      rows={4}
                      className="form-control border-gold rounded-3"
                      placeholder="Tell us about your wedding date, color preferences, or specific zari weave request..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-maroon py-3 rounded-pill font-montserrat fw-bold shadow d-flex align-items-center justify-content-center gap-2">
                    <FiSend size={18} />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Store Location Column */}
          <div className="col-lg-6">
            <h3 className="font-serif fw-bold text-maroon mb-4">Our Store Location</h3>
            <div className="d-flex flex-column gap-3 mb-4">
              {(storesList || []).map((store, idx) => (
                <div key={idx} className="card border-0 rounded-4 p-4 bg-white shadow-sm border-gold">
                  <h5 className="font-serif fw-bold text-maroon mb-2" style={{ fontSize: '1.2rem' }}>
                    {store.city}
                  </h5>
                  <div className="d-flex flex-column gap-2 font-poppins text-dark" style={{ fontSize: '0.9rem' }}>
                    <div className="d-flex align-items-start gap-2">
                      <FiMapPin className="text-gold flex-shrink-0 mt-1" size={18} />
                      <span className="fw-medium">{store.address}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <FiPhone className="text-gold" size={18} />
                      <span className="fw-bold text-maroon">{store.phone}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <FiClock className="text-gold" size={18} />
                      <span>{store.timing}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Google Maps Location Showcase Card */}
            <div className="card border-0 rounded-4 overflow-hidden shadow-md border-gold position-relative" style={{ minHeight: '320px', background: '#580B1F', color: '#FFFDF8' }}>
              <div className="w-100 h-100 p-4 p-md-5 d-flex flex-column justify-content-center align-items-center text-center">
                <FiMapPin size={48} className="text-gold mb-3 animate-bounce" />
                <h4 className="font-serif fw-bold text-white mb-2" style={{ fontSize: '1.4rem' }}>
                  Locate Us on Google Maps
                </h4>
                <p className="font-poppins text-light-gold mb-4" style={{ fontSize: '0.92rem', color: '#E5C368', maxWidth: '420px' }}>
                  Subash nagar, Muddireddypalli, Hindupur, Sri Sathya Sai, Andhra Pradesh 515201
                </p>
                
                <a 
                  href="https://maps.app.goo.gl/yLHvGchJpRZVTHF36" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-gold btn-lg rounded-pill font-montserrat fw-bold px-4 py-2.5 shadow d-inline-flex align-items-center gap-2"
                >
                  <span>Open in Google Maps</span>
                  <FiExternalLink size={18} />
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
