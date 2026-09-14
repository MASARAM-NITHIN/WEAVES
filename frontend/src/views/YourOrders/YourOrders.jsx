'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FiShoppingBag, FiSearch, FiStar, FiCheckCircle, FiUpload, FiPlus, FiX, FiCopy, FiTruck, FiShield, FiCalendar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { getProductImageUrl } from '../../lib/imageHelper';
import { lookupOrderApi } from '../../lib/apiClient';

const YourOrders = () => {
  const { products, reviews, addReview, getProductRatingInfo } = useProducts();

  const [phone, setPhone] = useState('');
  const [trackedOrders, setTrackedOrders] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [activeReviewItem, setActiveReviewItem] = useState(null); // { orderId, product }
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhoto, setReviewPhoto] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const { lookupOrderHistoryApi } = await import('../../lib/apiClient');
      let res = await lookupOrderHistoryApi(phone.trim());
      if (res && res.content && Array.isArray(res.content)) {
        res = res.content;
      }
      // Handle either array or single object response
      setTrackedOrders(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setTrackedOrders([]);
    }
    setIsSearching(false);
  };

  const handleClearSearch = () => {
    setPhone('');
    setTrackedOrders([]);
    setHasSearched(false);
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(''), 3000);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert(`File "${file.name}" exceeds 8MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setReviewPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const openReviewModal = (order, item) => {
    setActiveReviewItem({
      orderId: order.id,
      orderCode: order.orderCode,
      phone: phone || order.customerPhone,
      productId: item.sareeId || item.productId,
      productName: item.sareeName || item.productName,
      productImage: item.imageUrl || item.image,
      customerName: order.customerName || 'Verified Buyer'
    });
    setReviewName(order.customerName || 'Verified Buyer');
    setReviewRating(5);
    setReviewTitle('');
    setReviewComment('');
    setReviewPhoto('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!activeReviewItem || !reviewName.trim() || !reviewComment.trim()) return;

    setIsSubmittingReview(true);
    const { orderId, productId } = activeReviewItem;

    // Helper: mark the item as reviewed in local state
    const markItemReviewed = () => {
      setTrackedOrders(prev => prev.map(o =>
        o.id === orderId
          ? { ...o, items: (o.items || []).map(it => (it.sareeId || it.productId) === productId ? { ...it, isReviewed: true } : it) }
          : o
      ));
    };

    try {
      await addReview(productId, {
        orderCode: activeReviewItem.orderCode,
        phone: activeReviewItem.phone,
        name: reviewName,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        photoUrl: reviewPhoto
      });

      markItemReviewed();
      setSuccessMsg(`Thank you! Your rating & review for "${(activeReviewItem.productName || '').slice(0, 30)}..." has been published.`);
      setActiveReviewItem(null);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('already')) {
        markItemReviewed(); // backend says already reviewed — reflect that in UI
        setSuccessMsg('⚠️ You have already submitted a review for this item.');
      } else {
        setSuccessMsg('❌ ' + (msg || 'Failed to submit review. Please try again.'));
      }
      setActiveReviewItem(null);
      setTimeout(() => setSuccessMsg(''), 6000);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="your-orders-page py-5 bg-ivory font-poppins min-vh-80">
      <div className="container py-3">

        {/* Page Header */}
        <div className="section-title-wrap text-center mb-4">
          <span className="section-subtitle">Customer Order History</span>
          <h2 className="section-title text-maroon font-serif fw-bold">Your Orders & Product Reviews</h2>
          <p className="text-muted font-poppins mt-2" style={{ maxWidth: '650px', margin: '0 auto', fontSize: '0.92rem' }}>
            View your placed luxury saree orders, track status, and share verified reviews & star ratings for each purchased saree item.
          </p>
        </div>

        {/* Search / Filter Bar */}
        <div className="row justify-content-center mb-4">
          <div className="col-md-10 col-lg-8">
            <form className="row g-3 justify-content-center" onSubmit={handleSearch}>
              <div className="col-md-8">
                <input 
                  type="text" 
                  required
                  className="form-control border-gold rounded-pill py-3 px-4 font-poppins shadow-sm"
                  placeholder="Enter your 10-digit Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              
              <div className="col-md-4 d-flex align-items-center">
                <button 
                  type="submit" 
                  className="btn btn-gold text-white rounded-pill px-4 py-3 font-montserrat fw-bold shadow w-100"
                  disabled={isSearching}
                >
                  {isSearching ? <span className="spinner-border spinner-border-sm"></span> : <><FiSearch className="me-2" /> Track</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Global Toast / Success Message */}
        {successMsg && (
          <div className="row justify-content-center mb-4">
            <div className="col-md-8">
              <div className={`alert border-gold rounded-pill font-montserrat fw-bold text-center py-2.5 shadow-sm ${successMsg.includes('❌') || successMsg.includes('⚠️') ? 'alert-warning text-dark' : 'alert-success'}`}>
                {!successMsg.includes('❌') && !successMsg.includes('⚠️') && <FiCheckCircle className="me-2" size={18} />} 
                {successMsg}
              </div>
            </div>
          </div>
        )}

        {/* Orders List Container */}
        {!hasSearched ? (
          <div className="row justify-content-center">
            <div className="col-md-8 text-center py-5 bg-white rounded-5 border-gold shadow-sm">
              <div className="mb-3 text-gold">
                <FiSearch size={54} />
              </div>
              <h4 className="font-serif fw-bold text-maroon mb-2">Track Your Order History</h4>
              <p className="text-muted mb-4 font-poppins" style={{ fontSize: '0.92rem' }}>
                Enter your phone number to view all your past and active orders.
              </p>
            </div>
          </div>
        ) : trackedOrders.length === 0 ? (
          <div className="row justify-content-center">
            <div className="col-md-8 text-center py-5 bg-white rounded-5 border-gold shadow-sm">
              <div className="mb-3 text-gold">
                <FiShoppingBag size={54} />
              </div>
              <h4 className="font-serif fw-bold text-maroon mb-2">No Orders Found</h4>
              <p className="text-muted mb-4 font-poppins" style={{ fontSize: '0.92rem' }}>
                No orders matched "{phone}". Please check your details.
              </p>
              <Link href="/sarees" className="btn btn-gold btn-lg text-white rounded-pill font-montserrat fw-bold px-5 shadow">
                Explore Sarees Catalog
              </Link>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {(trackedOrders || []).map((order) => {
              const orderDate = order.orderedAt || order.date;
              const formattedDate = orderDate ? new Date(orderDate).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }) : 'Recent Order';

              return (
                <div key={order.id} className="card border-0 rounded-4 bg-white border-gold shadow-sm overflow-hidden">
                  
                  {/* Card Header */}
                  <div className="p-3 p-md-4 bg-light-gold border-bottom border-gold d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div>
                        <span className="badge bg-gold text-white font-montserrat px-3 py-1 rounded-pill" style={{ fontSize: '0.75rem' }}>
                          ORDER ID
                        </span>
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <h5 className="font-montserrat fw-extrabold text-maroon mb-0" style={{ fontSize: '1.2rem' }}>
                            {order.orderCode || order.id}
                          </h5>
                          <button 
                            onClick={() => handleCopyId(order.id)}
                            className="btn btn-sm btn-outline-gold p-1 rounded-circle border-0"
                            title="Copy Order ID"
                          >
                            <FiCopy size={15} />
                          </button>
                          {copiedOrderId === order.id && (
                            <span className="text-success font-poppins fw-bold" style={{ fontSize: '0.75rem' }}>
                              Copied!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-3 font-poppins" style={{ fontSize: '0.85rem' }}>
                      <div className="d-flex align-items-center gap-1.5 text-muted">
                        <FiCalendar className="text-gold" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="badge bg-danger bg-opacity-10 text-maroon font-montserrat px-3 py-2 rounded-pill fw-bold border border-danger border-opacity-25 shadow-xs">
                        Status: {order.orderStatus || 'Packaging & Dispatched'}
                      </div>
                      <div className="fw-bold font-montserrat text-maroon fs-5">
                        ₹{(order.orderTotal || order.grandTotal || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Card Body: Shipping Details & Items List */}
                  <div className="p-3 p-md-4">
                    
                    {/* Customer Info Box */}
                    <div className="p-3 bg-light rounded-3 border-gold mb-4 font-poppins" style={{ fontSize: '0.84rem' }}>
                      <div className="row g-2">
                        <div className="col-md-6">
                          <strong>Customer Name:</strong> {order.customerName}
                        </div>
                        <div className="col-md-6">
                          <strong>Contact Phone:</strong> {order.customerPhone}
                        </div>
                        <div className="col-12">
                          <strong>Shipping Address:</strong> {order.shippingAddress}
                        </div>
                      </div>
                    </div>

                    <h6 className="font-serif fw-bold text-maroon mb-3 border-bottom border-gold pb-2">
                      Purchased Sarees in Order ({(order.items || []).length}):
                    </h6>
                    {/* Purchased Saree Items Row */}
                    <div className="d-flex flex-column gap-3">
                      {(order.items || []).map((item, idx) => {
                        const sId = item.sareeId || item.productId;
                        const sName = item.sareeName || item.productName;
                        const ratingInfo = getProductRatingInfo(sId);
                        
                        const userRev = (reviews || []).find(r => (r.sareeId === sId || r.productId === sId) && r.name && order.customerName && r.name.toLowerCase().includes(order.customerName.toLowerCase()));
                        const hasReviewed = item.isReviewed || userRev;

                        return (
                          <div key={idx} className="p-3 bg-white rounded-3 border-gold d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 shadow-xs">
                            
                            <div className="d-flex align-items-center gap-3">
                              <img 
                                src={getProductImageUrl(item.imageUrl || item.image)} 
                                alt={sName}
                                className="rounded-3 object-fit-cover border border-gold"
                                style={{ width: '64px', height: '80px' }}
                               onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
                              <div>
                                <h6 className="font-serif fw-bold text-dark mb-1" style={{ fontSize: '0.95rem' }}>
                                  {sName}
                                </h6>
                                <p className="mb-0 text-maroon font-montserrat fw-semibold" style={{ fontSize: '0.85rem' }}>
                                  Qty: {item.quantity}  <span className="mx-2 text-gold">|</span>  ₹ {Number(item.price).toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>

                            {/* Review & Rating Action Control for EACH Item */}
                            <div className="d-flex flex-column align-items-md-end gap-1">
                              {hasReviewed ? (
                                <div className="text-md-end">
                                  <div className="badge bg-success text-white font-montserrat px-4 py-2 rounded-pill mb-1 shadow-sm">
                                    <FiCheckCircle className="me-1" /> Review Submitted
                                  </div>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => openReviewModal(order, item)}
                                  className="btn btn-maroon btn-sm rounded-pill font-montserrat fw-bold px-4 py-2 shadow-sm"
                                  style={{ fontSize: '0.82rem' }}
                                >
                                  Rate & Review Saree
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Interactive Review Drawer / Modal for Specific Purchased Item */}
      {activeReviewItem && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 4000, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
          onClick={() => setActiveReviewItem(null)}
        >
          <div 
            className="card border-0 rounded-4 p-4 max-w-600 w-100 bg-white shadow-2xl border-gold"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-gold">
              <h5 className="font-serif fw-bold text-maroon mb-0">⭐ Rate & Review Purchased Saree</h5>
              <button onClick={() => setActiveReviewItem(null)} className="btn btn-sm btn-outline-danger rounded-circle">
                <FiX size={18} />
              </button>
            </div>

            <div className="d-flex align-items-center gap-3 mb-3 p-2 bg-light-gold rounded-3 border-gold">
              <img 
                src={getProductImageUrl(activeReviewItem.productImage)} 
                alt={activeReviewItem.productName}
                className="rounded-2 border border-gold"
                style={{ width: '50px', height: '60px', objectFit: 'cover' }}
               onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
              <div>
                <h6 className="font-serif fw-bold text-maroon mb-0 line-clamp-1">{activeReviewItem.productName}</h6>
                <small className="text-muted font-montserrat">Order: #{activeReviewItem.orderCode || activeReviewItem.orderId}</small>
              </div>
            </div>

            <form onSubmit={handleReviewSubmit} className="row g-3">
              
              {/* Star Rating Picker */}
              <div className="col-12 text-center my-2">
                <label className="form-label fw-bold text-dark d-block mb-1" style={{ fontSize: '0.88rem' }}>Tap Stars to Rate *</label>
                <div className="d-flex justify-content-center gap-2 text-warning cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar 
                      key={star} 
                      size={32}
                      onClick={() => setReviewRating(star)}
                      style={{ 
                        fill: star <= reviewRating ? '#C8A54B' : 'none', 
                        color: '#C8A54B',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease'
                      }}
                    />
                  ))}
                </div>
                <span className="font-montserrat fw-bold text-maroon mt-1 d-block fs-5">
                  {reviewRating} / 5 Stars
                </span>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-muted" style={{ fontSize: '0.8rem' }}>Your Name *</label>
                <input 
                  type="text" 
                  required 
                  className="form-control border-gold rounded-pill"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-muted" style={{ fontSize: '0.8rem' }}>Review Headline</label>
                <input 
                  type="text" 
                  placeholder="e.g. Exceptional Zari & Pure Silk!" 
                  className="form-control border-gold rounded-pill"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold text-muted" style={{ fontSize: '0.8rem' }}>Detailed Feedback *</label>
                <textarea 
                  required
                  rows="3"
                  placeholder="Tell us about the fabric feel, color match, packaging, and saree drape..."
                  className="form-control border-gold rounded-3"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold text-maroon" style={{ fontSize: '0.8rem' }}>
                  Upload Saree Photo (Optional)
                </label>
                <div className="d-flex align-items-center gap-3">
                  <input 
                    type="file" 
                    accept="image/*" 
                    id="orderReviewPhotoInput" 
                    className="d-none"
                    onChange={handlePhotoUpload} 
                  />
                  <label 
                    htmlFor="orderReviewPhotoInput" 
                    className="btn btn-outline-maroon rounded-pill font-montserrat fw-bold btn-sm px-3 py-2 cursor-pointer shadow-sm"
                  >
                    <FiUpload className="me-1" /> Device Photo
                  </label>
                  
                  <input 
                    type="text" 
                    placeholder="Or image URL..." 
                    className="form-control border-gold rounded-pill"
                    value={reviewPhoto}
                    onChange={(e) => setReviewPhoto(e.target.value)}
                  />

                  {reviewPhoto && (
                    <img src={reviewPhoto} alt="Review upload" className="rounded-3 border border-gold" style={{ width: '45px', height: '45px', objectFit: 'cover' }}  onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
                  )}
                </div>
              </div>

              <div className="col-12 text-end pt-2">
                <button type="button" onClick={() => setActiveReviewItem(null)} className="btn btn-outline-secondary rounded-pill me-2 px-4">
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold text-white rounded-pill px-5 font-montserrat fw-bold shadow" disabled={isSubmittingReview}>
                  {isSubmittingReview ? <><span className="spinner-border spinner-border-sm me-2"></span> Submitting...</> : 'Submit Review'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default YourOrders;
