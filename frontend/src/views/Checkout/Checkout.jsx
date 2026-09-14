'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiCopy, FiLock, FiShield, FiArrowLeft, FiImage, FiSearch, FiHelpCircle, FiEye, FiX, FiStar } from 'react-icons/fi';
import { GiCrown } from 'react-icons/gi';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import confetti from 'canvas-confetti';
import { getProductImageUrl } from '../../lib/imageHelper';

const upiQrImage = '/images/upi_qr.png';

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

const Checkout = () => {
  const { 
    cartItems, 
    subtotal, 
    discountAmount, 
    shippingFee, 
    taxIncluded, 
    grandTotal, 
    saveOrder 
  } = useCart();
  const { deductStock, loadDatabaseCatalog } = useProducts();

  const router = useRouter();

  // Contact & Delivery State
  const [customer, setCustomer] = useState({
    email: '',
    emailNews: true,
    country: 'India',
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    apartment: '',
    city: 'Hindupur',
    state: 'Andhra Pradesh',
    pinCode: '515201',
    phone: ''
  });

  // Billing address state
  const [billingSame, setBillingSame] = useState(true);
  const [billingAddress, setBillingAddress] = useState({
    country: 'India',
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    apartment: '',
    city: '',
    state: 'Andhra Pradesh',
    pinCode: '',
    phone: ''
  });

  // Payment Screenshot State
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [paymentScreenshotFile, setPaymentScreenshotFile] = useState(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [customerUpiId, setCustomerUpiId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Customer Payment Screenshot Preview Modal & Direct Image Zoom State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewZoomed, setPreviewZoomed] = useState(false);
  const [previewOrigin, setPreviewOrigin] = useState('center center');

  const handlePreviewMouseMove = (e) => {
    if (!previewZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPreviewOrigin(`${x}% ${y}%`);
  };

  const upiNumber = '9291303040';
  const upiId = '9291303040@ybl';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiNumber);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('File size exceeds 8MB. Please choose a smaller screenshot image.');
        return;
      }
      setScreenshotName(file.name);
      setPaymentScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshot(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteOrderSubmit = async (e) => {
    e.preventDefault();

    if (!paymentScreenshot) {
      alert('Please upload your UPI payment screenshot before completing your order.');
      return;
    }

    if (!utrNumber || utrNumber.trim() === '') {
      alert('Please enter your UPI Transaction / UTR Ref Number.');
      return;
    }

    if (!/^\d+$/.test(utrNumber.trim())) {
      alert('Invalid UTR Number. It must contain only numbers (no spaces, letters, or symbols).');
      return;
    }

    if (!customerUpiId || customerUpiId.trim() === '') {
      alert('Please enter the UPI ID you paid from.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      router.push('/sarees');
      return;
    }

    // Deduct ordered sarees inventory stock automatically
    deductStock(cartItems);

    setIsSubmitting(true);
    try {
      // Save Order Payload to localStorage / database
      const orderPayload = await saveOrder({
        subtotal,
        discount: discountAmount,
        shippingFee,
        taxIncluded,
        grandTotal,
        customer,
        billingSame,
        billingAddress: billingSame ? customer : billingAddress,
        paymentScreenshot: paymentScreenshotFile, // PASS FILE OBJECT INSTEAD OF BASE64
        utrNumber,
        customerUpiId
      });

      if (!orderPayload.success) {
        alert(`Error placing order: ${orderPayload.message}`);
        return;
      }

      // Refresh catalog from DB to ensure stock is globally updated!
      await loadDatabaseCatalog();

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 }
      });

      setOrderConfirmed({
        ...orderPayload.data,
        id: orderPayload.data?.orderCode || `SPS-${Math.floor(100000 + Math.random() * 900000)}`,
        customer: customer,
        items: orderPayload.data?.items?.length > 0 
          ? orderPayload.data.items 
          : (cartItems || []).map(item => ({ 
              sareeId: item.product.id,
              sareeName: item.product.name,
              imageUrl: item.product.images && item.product.images.length > 0 ? item.product.images[0] : null,
              quantity: item.quantity 
            })),
        grandTotal: grandTotal,
      });
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderConfirmed) {
    return (
      <div className="checkout-success-page py-5 bg-ivory min-vh-80 d-flex align-items-center justify-content-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="card border-0 rounded-5 p-4 p-md-5 bg-white border-gold shadow-2xl">
                
                {/* Aesthetic Glowing Circular Checkmark */}
                <div className="d-flex justify-content-center mb-3">
                  <div 
                    className="rounded-circle text-white d-flex align-items-center justify-content-center shadow-lg"
                    style={{
                      width: '84px',
                      height: '84px',
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, #7B112C 0%, #0F6A50 100%)',
                      border: '3.5px solid #C8A54B',
                      boxShadow: '0 0 25px rgba(200, 165, 75, 0.5)'
                    }}
                  >
                    <FiCheckCircle size={46} className="text-gold" />
                  </div>
                </div>

                <span className="badge bg-gold text-white font-montserrat px-3 py-1.5 rounded-pill mb-3" style={{ fontSize: '0.78rem', letterSpacing: '1px' }}>
                  ORDER PLACED SUCCESSFULLY
                </span>

                <h1 className="font-serif fw-bold text-maroon mb-2 display-6">
                  Thank You, {orderConfirmed.customerName || 'Patron'}!
                </h1>
                
                <p className="font-montserrat fw-bold text-dark fs-5 mb-1">
                  Order ID: <span className="text-maroon fw-extrabold">{orderConfirmed.orderCode || orderConfirmed.id}</span>
                </p>
                <p className="font-poppins text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                  Placed on: {orderConfirmed.orderedAt ? new Date(orderConfirmed.orderedAt).toLocaleString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true
                  }) : new Date().toLocaleString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true
                  })}
                </p>

                {/* Warm Customer Message Plate */}
                <div 
                  className="p-3 rounded-4 mb-4 font-montserrat fw-semibold d-flex align-items-center justify-content-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(123, 17, 44, 0.08) 0%, rgba(200, 165, 75, 0.12) 100%)',
                    border: '1.5px solid #C8A54B',
                    color: '#7B112C',
                    fontSize: '0.92rem'
                  }}
                >
                  <span className="text-gold fs-5">✨</span>
                  <span>Thank you for choosing Sree Padmavathi Silks! Your luxury handloom order has been recorded and will be artisan packaged with care.</span>
                </div>

                <p className="font-poppins text-muted mb-4" style={{ fontSize: '0.92rem', lineHeight: '1.6' }}>
                  Your UPI payment screenshot has been logged for instant verification by the owner of Sree Padmavathi Silks.
                </p>

                <div className="p-3.5 bg-light rounded-4 border-gold text-start mb-4 font-poppins shadow-sm" style={{ border: '1px solid rgba(200, 165, 75, 0.4)', fontSize: '0.88rem' }}>
                  <div className="mb-1"><strong>Delivery Address:</strong> {orderConfirmed.shippingAddress}, {orderConfirmed.city}, {orderConfirmed.state} - {orderConfirmed.pincode}</div>
                  <div className="mb-1"><strong>Contact Phone:</strong> {orderConfirmed.customerPhone}</div>
                  <div className="mb-1"><strong>Total Paid Amount:</strong> <span className="text-maroon fw-bold">₹{(orderConfirmed.orderTotal || 0).toLocaleString('en-IN')}</span></div>
                  <div><strong>Payment Method:</strong> UPI ({orderConfirmed.upiId || upiNumber})</div>
                </div>

                {/* Shopper Review & Rating Section */}
                <div className="card border-0 rounded-4 p-4 mb-4 text-start bg-light-gold border-gold font-poppins shadow-sm">
                  <h5 className="font-serif fw-bold text-maroon mb-2 d-flex align-items-center gap-2">
                    <FiStar className="text-gold" />
                    <span>Rate & Review Your Purchased Sarees</span>
                  </h5>
                  <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>
                    Thank you for shopping with Sree Padmavathi Silks! As a shopper, your review helps fellow patrons. Click below to rate your items:
                  </p>

                  <div className="d-flex flex-column gap-3">
                    {(orderConfirmed.items || []).map((item, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-3 border-gold d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 shadow-sm">
                        <div className="d-flex align-items-center gap-3">
                          <img 
                            src={getProductImageUrl(item.imageUrl)} 
                            alt={item.sareeName}
                            className="rounded-3 object-fit-cover border border-gold"
                            style={{ width: '54px', height: '68px' }}
                           onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
                          <div>
                            <h6 className="font-serif fw-bold text-dark mb-1" style={{ fontSize: '0.92rem' }}>
                              {item.sareeName}
                            </h6>
                            <span className="badge bg-gold text-white font-montserrat" style={{ fontSize: '0.68rem' }}>
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>

                        <Link 
                          href={`/product/${item.sareeId}`}
                          className="btn btn-sm btn-maroon rounded-pill font-montserrat fw-bold px-4 py-2 shadow-sm text-decoration-none text-white text-center"
                          style={{ fontSize: '0.82rem' }}
                        >
                          <FiStar className="me-1" /> Rate & Review Saree
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <Link href="/" className="btn btn-gold btn-lg rounded-pill font-montserrat fw-bold px-5 py-2.5 shadow-sm">
                    Return to Storefront
                  </Link>
                  <Link href="/sarees" className="btn btn-outline-gold btn-lg rounded-pill font-montserrat text-maroon px-4 py-2.5">
                    Explore More Sarees
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page bg-white min-vh-100 font-poppins">
      
      {/* Checkout Top Bar */}
      <div className="border-bottom border-gold py-3 px-4 bg-ivory">
        <div className="container d-flex align-items-center justify-content-between">
          <Link href="/" className="text-decoration-none d-flex align-items-center gap-2">
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', background: '#7B112C', color: '#FFFDF8' }}>
              <GiCrown size={20} />
            </div>
            <span className="font-serif fw-bold text-maroon fs-4">Sree Padmavathi Silks</span>
          </Link>
          <Link href="/cart" className="text-decoration-none text-gold font-montserrat fw-semibold d-flex align-items-center gap-1" style={{ fontSize: '0.88rem' }}>
            <FiArrowLeft size={16} /> Return to Cart
          </Link>
        </div>
      </div>

      <div className="container py-4 py-md-5">
        <form onSubmit={handleCompleteOrderSubmit}>
          <div className="row g-5">
            
            {/* LEFT COLUMN: Contact, Address, UPI Payment, Screenshot Upload */}
            <div className="col-lg-7">
              
              {/* Contact Section */}
              <div className="mb-4 pb-3 border-bottom">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="font-serif fw-bold text-maroon mb-0">Contact</h4>
                </div>
                <input 
                  type="email"
                  required
                  className="form-control form-control-lg border-gold rounded-3 font-poppins"
                  placeholder="Email address *"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  style={{ fontSize: '0.95rem' }}
                />
                <div className="form-check mt-2">
                  <input 
                    type="checkbox" 
                    className="form-check-input border-gold" 
                    id="emailNews" 
                    checked={customer.emailNews}
                    onChange={(e) => setCustomer({ ...customer, emailNews: e.target.checked })}
                  />
                  <label className="form-check-label text-muted" htmlFor="emailNews" style={{ fontSize: '0.82rem' }}>
                    Email me with news and exclusive silk saree offers
                  </label>
                </div>
              </div>

              {/* Delivery Address Section */}
              <div className="mb-4 pb-3 border-bottom">
                <h4 className="font-serif fw-bold text-maroon mb-3">Delivery Address</h4>
                <div className="row g-3">
                  
                  <div className="col-12">
                    <label className="form-label text-muted" style={{ fontSize: '0.78rem' }}>Country / Region</label>
                    <select 
                      className="form-select border-gold rounded-3"
                      value={customer.country}
                      onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
                    >
                      <option value="India">India</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <input 
                      type="text"
                      required
                      className="form-control border-gold rounded-3"
                      placeholder="First name *"
                      value={customer.firstName}
                      onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <input 
                      type="text"
                      required
                      className="form-control border-gold rounded-3"
                      placeholder="Last name *"
                      value={customer.lastName}
                      onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <input 
                      type="text"
                      className="form-control border-gold rounded-3"
                      placeholder="Company (optional)"
                      value={customer.company}
                      onChange={(e) => setCustomer({ ...customer, company: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <input 
                      type="text"
                      required
                      className="form-control border-gold rounded-3"
                      placeholder="Street Address *"
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <input 
                      type="text"
                      className="form-control border-gold rounded-3"
                      placeholder="Apartment, suite, house no., etc. (optional)"
                      value={customer.apartment}
                      onChange={(e) => setCustomer({ ...customer, apartment: e.target.value })}
                    />
                  </div>

                  <div className="col-md-4">
                    <input 
                      type="text"
                      required
                      className="form-control border-gold rounded-3"
                      placeholder="City *"
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    />
                  </div>

                  {/* Indian States Dropdown for Delivery Address */}
                  <div className="col-md-4">
                    <select 
                      className="form-select border-gold rounded-3"
                      value={customer.state}
                      onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                    >
                      {(indianStates || []).map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <input 
                      type="text"
                      required
                      className="form-control border-gold rounded-3"
                      placeholder="PIN code *"
                      value={customer.pinCode}
                      onChange={(e) => setCustomer({ ...customer, pinCode: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <input 
                      type="tel"
                      required
                      className="form-control border-gold rounded-3"
                      placeholder="Phone number *"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    />
                  </div>

                </div>
              </div>

              {/* PAYMENT SECTION: STRICTLY UPI PAYMENTS ONLY */}
              <div className="mb-4">
                <h4 className="font-serif fw-bold text-maroon mb-1">Payment Method</h4>
                <p className="text-muted font-poppins mb-3" style={{ fontSize: '0.85rem' }}>
                  All transactions are secure & verified via UPI (PhonePe, GPay, Paytm, BHIM). Credit/Debit cards are disabled.
                </p>

                <div className="card border-maroon rounded-4 overflow-hidden mb-4 shadow-sm" style={{ border: '2px solid #7B112C' }}>
                  
                  {/* UPI Gateway Header */}
                  <div className="p-3 bg-maroon text-white d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <FiLock className="text-gold" size={18} />
                      <span className="font-montserrat fw-bold text-white" style={{ fontSize: '0.9rem' }}>
                        UPI Direct Gateway (PhonePe / Google Pay / Paytm)
                      </span>
                    </div>
                    <span className="badge bg-gold text-white font-montserrat">UPI ONLY</span>
                  </div>

                  <div className="p-4 bg-ivory">
                    
                    {/* UPI Number Callout */}
                    <div className="p-3 bg-white rounded-3 border-gold text-center mb-4 shadow-sm">
                      <span className="font-montserrat fw-bold text-gold text-uppercase d-block mb-1" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                        Official Store UPI Number
                      </span>
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <span className="font-montserrat fw-bold display-6 text-maroon">
                          {upiNumber}
                        </span>
                        <button 
                          type="button" 
                          onClick={handleCopyUpi} 
                          className="btn btn-outline-gold btn-sm rounded-circle p-2"
                          title="Copy UPI Number"
                        >
                          <FiCopy size={16} />
                        </button>
                      </div>
                      {copiedUpi && <span className="text-success font-montserrat fw-semibold" style={{ fontSize: '0.78rem' }}>Copied to clipboard!</span>}
                      <small className="text-muted d-block mt-1 font-poppins">UPI ID: <strong>{upiId}</strong></small>
                    </div>

                    {/* QR Code Scanner Image Display */}
                    <div className="text-center mb-4">
                      <div className="d-inline-block bg-white p-3 rounded-4 border-gold shadow-md">
                        <img 
                          src={upiQrImage} 
                          alt="PhonePe UPI QR Scanner Code" 
                          className="img-fluid rounded-3"
                          style={{ maxWidth: '240px', height: 'auto' }}
                         onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
                        <span className="d-block mt-2 font-montserrat fw-bold text-maroon" style={{ fontSize: '0.8rem' }}>
                          Scan with PhonePe, GPay, Paytm, or BHIM
                        </span>
                      </div>
                    </div>

                    {/* Total Amount Reminder */}
                    <div className="alert alert-warning border-gold text-center font-montserrat fw-bold text-dark mb-4">
                      Pay Exact Amount: <span className="text-maroon fs-4">₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>

                    {/* REQUIRED: Upload Payment Screenshot File Input */}
                    <div className="p-3 bg-white rounded-3 border-gold">
                      <label className="form-label fw-bold text-maroon d-flex align-items-center gap-2 mb-2" style={{ fontSize: '0.9rem' }}>
                        <FiImage className="text-gold" size={20} />
                        <span>Upload Payment Screenshot (Required) *</span>
                      </label>
                      <input 
                        type="file"
                        accept="image/*"
                        required
                        className="form-control border-gold rounded-3 font-poppins"
                        onChange={handleScreenshotUpload}
                      />
                      <small className="text-muted font-poppins d-block mt-1" style={{ fontSize: '0.78rem' }}>
                        Take a screenshot of your successful UPI payment and upload it here so the owner can verify and dispatch your order.
                      </small>

                      {/* Screenshot Attached Badge & Preview Button */}
                      {paymentScreenshot && (
                        <div className="mt-3 p-3 bg-success-subtle rounded-3 border border-success d-flex flex-wrap align-items-center justify-content-between gap-2 font-montserrat">
                          <div className="d-flex align-items-center gap-2 text-success fw-semibold" style={{ fontSize: '0.85rem' }}>
                            <FiCheckCircle size={18} />
                            <span>Payment Screenshot Attached ({screenshotName || 'Attached'})</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setShowPreviewModal(true)}
                            className="btn btn-sm btn-gold rounded-pill px-3 py-1 font-montserrat fw-bold d-flex align-items-center gap-1 shadow-sm"
                            style={{ fontSize: '0.78rem' }}
                          >
                            <FiEye size={14} />
                            <span>Preview Screenshot</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Optional UTR Reference Number Input */}
                    <div className="mt-3">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.82rem' }}>
                        UPI Transaction / UTR Ref Number *
                      </label>
                      <input 
                        type="text"
                        required
                        inputMode="numeric"
                        pattern="\d*"
                        className="form-control border-gold rounded-3"
                        placeholder="e.g. 319204928104"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>

                    <div className="mt-3">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.82rem' }}>
                        Your UPI ID (The ID you paid from) *
                      </label>
                      <input 
                        type="text"
                        required
                        className="form-control border-gold rounded-3"
                        placeholder="e.g. yourname@okbank"
                        value={customerUpiId}
                        onChange={(e) => setCustomerUpiId(e.target.value)}
                      />
                    </div>

                  </div>
                </div>
              </div>



            </div>

            {/* RIGHT COLUMN: Order Summary & Price Math */}
            <div className="col-lg-5">
              <div className="p-4 rounded-4 bg-light border-gold sticky-top shadow-sm" style={{ top: '30px' }}>
                
                <h4 className="font-serif fw-bold text-maroon mb-3 pb-2 border-bottom border-gold">
                  Order Items ({cartItems.length})
                </h4>

                {/* Saree List */}
                <div className="d-flex flex-column gap-3 mb-4 max-h-350 overflow-auto pe-1">
                  {(cartItems || []).map((item) => (
                    <div key={item.product.id} className="d-flex align-items-center gap-3">
                      <div className="position-relative">
                        <img 
                          src={getProductImageUrl(item.product.images[0])} 
                          alt={item.product.name}
                          className="rounded-3 object-fit-cover shadow-sm border border-gold"
                          style={{ width: '64px', height: '80px' }}
                         onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-maroon text-white font-montserrat">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="flex-grow-1">
                        <h6 className="font-serif fw-bold text-dark mb-1 line-clamp-1" style={{ fontSize: '0.9rem' }}>
                          {item.product.name}
                        </h6>
                        <span className="text-muted font-poppins d-block" style={{ fontSize: '0.78rem' }}>
                          {item.product.category}
                        </span>
                      </div>

                      <div className="fw-bold font-montserrat text-maroon" style={{ fontSize: '0.92rem' }}>
                        ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Math Calculations */}
                <div className="d-flex flex-column gap-2 font-poppins border-top border-gold pt-3 mb-3" style={{ fontSize: '0.9rem' }}>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Subtotal:</span>
                    <span className="fw-semibold">₹{(subtotal || 0).toLocaleString('en-IN')}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="d-flex justify-content-between text-success">
                      <span>Discount:</span>
                      <span className="fw-semibold">-₹{(discountAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Grand Total */}
                <div className="d-flex justify-content-between align-items-baseline pt-2 border-top border-gold mb-3">
                  <span className="font-serif fw-bold fs-5 text-dark">Total (INR):</span>
                  <span className="font-montserrat fw-bold display-6 text-maroon">
                    ₹{(grandTotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-3 border-gold font-poppins text-muted" style={{ fontSize: '0.78rem' }}>
                  <FiShield className="text-gold me-1" />
                  Enjoy Free Express Shipping on all orders across India.
                </div>

              </div>
            </div>

          </div>

          {/* Full Width Submit Button at Bottom After All Form Sections & Items */}
          <div className="row mt-4">
            <div className="col-12">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn btn-maroon w-100 py-3.5 rounded-pill font-montserrat fw-bold fs-4 shadow-lg text-white d-flex align-items-center justify-content-center gap-2"
                style={{ minHeight: '56px' }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm text-gold" role="status" aria-hidden="true" style={{ width: '1.5rem', height: '1.5rem' }}></span>
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <FiLock className="text-gold" size={22} />
                    <span>Confirm Order (₹{(grandTotal || 0).toLocaleString('en-IN')})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* CUSTOMER PAYMENT SCREENSHOT PREVIEW MODAL (WITH INTERACTIVE DIRECT IMAGE ZOOM - NO BUTTONS) */}
      {showPreviewModal && paymentScreenshot && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 4000, backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}
          onClick={() => { setShowPreviewModal(false); setPreviewZoomed(false); }}
        >
          <div 
            className="position-relative bg-white p-4 rounded-4 shadow-2xl overflow-hidden" 
            style={{ maxWidth: '780px', width: '100%', border: '2px solid #C8A54B' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              onClick={() => { setShowPreviewModal(false); setPreviewZoomed(false); }}
              className="btn btn-outline-danger btn-sm rounded-circle position-absolute top-0 end-0 m-3 z-3 bg-white shadow-sm"
              style={{ width: '36px', height: '36px' }}
            >
              <FiX size={20} />
            </button>

            <div className="text-center mb-2">
              <h5 className="font-serif fw-bold text-maroon mb-1">Attached Payment Screenshot Preview</h5>
              <div className="badge bg-gold-subtle text-maroon font-montserrat fw-semibold px-3 py-1 rounded-pill" style={{ backgroundColor: 'rgba(200, 165, 75, 0.15)', fontSize: '0.78rem' }}>
                💡 Click directly on the image to toggle 2.5x detail zoom & move mouse to pan details
              </div>
            </div>

            {/* Direct Image Interactive Zoom Viewport (No Buttons Needed) */}
            <div 
              className="overflow-hidden rounded-3 border border-gold bg-dark d-flex align-items-center justify-content-center position-relative mt-3"
              style={{
                maxHeight: '68vh',
                minHeight: '380px',
                cursor: previewZoomed ? 'zoom-out' : 'zoom-in'
              }}
              onClick={() => setPreviewZoomed(!previewZoomed)}
              onMouseMove={handlePreviewMouseMove}
            >
              <img 
                src={paymentScreenshot} 
                alt="Attached UPI Payment Screenshot" 
                className="img-fluid rounded-3 transition-all"
                style={{
                  maxHeight: '65vh',
                  objectFit: 'contain',
                  transform: previewZoomed ? 'scale(2.5)' : 'scale(1)',
                  transformOrigin: previewOrigin,
                  transition: previewZoomed ? 'transform 0.1s ease-out' : 'transform 0.25s ease'
                }}
               onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3 font-poppins text-muted" style={{ fontSize: '0.8rem' }}>
              <span>{previewZoomed ? '🔍 2.5x Detail Zoom Active (Move mouse to pan screenshot)' : '🔎 Click image for 2.5x detail zoom'}</span>
              <button 
                type="button"
                onClick={() => { setShowPreviewModal(false); setPreviewZoomed(false); }}
                className="btn btn-sm btn-gold rounded-pill px-4 font-montserrat fw-bold shadow-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
