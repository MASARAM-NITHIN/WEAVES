import React, { useState } from 'react';
import { lookupOrderApi } from '../../lib/apiClient';
import { FiSearch, FiPackage, FiCheckCircle, FiClock, FiTruck, FiAlertCircle } from 'react-icons/fi';
import { getProductImageUrl } from '../../lib/imageHelper';
import { Link } from 'react-router-dom';

const MyOrders = () => {
  const [orderCode, setOrderCode] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);

    if (!orderCode.trim() || !phone.trim()) {
      setError('Please enter both your Order ID and Phone Number.');
      return;
    }

    setLoading(true);
    try {
      const res = await lookupOrderApi(orderCode.trim(), phone.trim());
      if (res && res.orderCode) {
        setOrder(res);
      } else {
        setError('Order not found. Please verify your details.');
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('Order not found. Please verify your Order ID and Phone Number.');
      } else {
        setError('Failed to fetch order details. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge bg-warning text-dark"><FiClock className="me-1" /> Pending</span>;
      case 'CONFIRMED':
        return <span className="badge bg-info"><FiCheckCircle className="me-1" /> Confirmed</span>;
      case 'SHIPPED':
        return <span className="badge bg-primary"><FiTruck className="me-1" /> Shipped</span>;
      case 'DELIVERED':
        return <span className="badge bg-success"><FiPackage className="me-1" /> Delivered</span>;
      case 'CANCELLED':
        return <span className="badge bg-danger"><FiAlertCircle className="me-1" /> Cancelled</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="container py-5" style={{ minHeight: '70vh' }}>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          
          <div className="text-center mb-5">
            <h1 className="font-serif fw-bold text-maroon mb-3">Track Your Order</h1>
            <p className="text-muted font-poppins">Enter your Order ID and Phone Number to view your order details and delivery status.</p>
          </div>

          <div className="card shadow-sm border-gold rounded-4 overflow-hidden mb-5">
            <div className="card-body p-4 p-md-5 bg-white">
              <form onSubmit={handleLookup}>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label font-montserrat fw-bold text-maroon">Order ID</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg font-poppins border-gold" 
                      placeholder="e.g., ORD-A1B2C3D4"
                      value={orderCode}
                      onChange={(e) => setOrderCode(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label font-montserrat fw-bold text-maroon">Phone Number</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg font-poppins border-gold" 
                      placeholder="Phone number used at checkout"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="col-12 mt-4 text-center">
                    <button 
                      type="submit" 
                      className="btn btn-maroon btn-lg font-montserrat px-5 py-2 shadow-sm"
                      disabled={loading}
                    >
                      {loading ? 'Searching...' : <><FiSearch className="me-2" /> Track Order</>}
                    </button>
                  </div>
                </div>
              </form>

              {error && (
                <div className="alert alert-danger mt-4 font-poppins text-center border-0 shadow-sm">
                  <FiAlertCircle className="me-2" /> {error}
                </div>
              )}
            </div>
          </div>

          {order && (
            <div className="card shadow-sm border-gold rounded-4 overflow-hidden animation-fade-in">
              <div className="card-header bg-maroon text-white p-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div>
                    <h5 className="font-serif mb-1">Order {order.orderCode}</h5>
                    <p className="font-poppins mb-0 small opacity-75">Placed on {new Date(order.orderedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    {getStatusBadge(order.orderStatus)}
                  </div>
                </div>
              </div>
              <div className="card-body p-4 p-md-5 bg-light">
                
                <h6 className="font-montserrat fw-bold text-maroon mb-4 pb-2 border-bottom border-gold">Order Summary</h6>
                
                <div className="d-flex flex-column gap-3 mb-4">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-3 border border-gold d-flex align-items-center gap-3 shadow-sm">
                      <div className="rounded-3 overflow-hidden border border-gold" style={{ width: '70px', height: '70px', flexShrink: 0 }}>
                        <img 
                          src={getProductImageUrl(item.sareeImage || item.sareeImageUrl)} 
                          alt={item.sareeName}
                          className="w-100 h-100 object-fit-cover"
                         onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1 text-maroon font-montserrat fw-bold" style={{ fontSize: '0.95rem' }}>{item.sareeName}</h6>
                        <span className="text-muted small font-poppins d-block">Qty: {item.quantity}</span>
                      </div>
                      <div className="text-end fw-bold font-poppins text-dark" style={{ fontSize: '1.05rem' }}>
                        ₹{item.subtotal?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="row g-4 border-top border-gold pt-4">
                  <div className="col-md-6">
                    <h6 className="font-montserrat fw-bold text-maroon mb-3">Shipping Details</h6>
                    <div className="font-poppins text-muted small lh-lg bg-white p-3 rounded-3 border">
                      <strong>{order.customerName}</strong><br/>
                      Phone: {order.customerPhone}<br/>
                      {order.shippingAddress}<br/>
                      {order.city}, {order.state} - {order.pincode}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-white p-4 rounded-3 border shadow-sm">
                      <div className="d-flex justify-content-between mb-2 font-poppins">
                        <span className="text-muted">Subtotal</span>
                        <span>₹{order.orderTotal?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2 font-poppins">
                        <span className="text-muted">Shipping</span>
                        <span className="text-success">Free</span>
                      </div>
                      <hr className="my-2 opacity-25" />
                      <div className="d-flex justify-content-between align-items-center font-montserrat">
                        <span className="fw-bold text-maroon fs-5">Grand Total</span>
                        <span className="fw-bold text-maroon fs-5">₹{order.orderTotal?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MyOrders;
