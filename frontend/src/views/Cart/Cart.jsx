'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiShoppingBag, FiTrash2, FiPlus, FiMinus, FiArrowRight } from 'react-icons/fi';
import { GiCrown } from 'react-icons/gi';
import { useCart } from '../../context/CartContext';
import { getProductImageUrl } from '../../lib/imageHelper';

const Cart = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    subtotal, 
    applyPromoCode, 
    appliedCoupon, 
    discountAmount, 
    grandTotal 
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoAlert, setPromoAlert] = useState(null);
  const router = useRouter();



  const handleApplyPromo = (e) => {
    e.preventDefault();
    const res = applyPromoCode(promoInput);
    setPromoAlert(res);
  };

  return (
    <div className="cart-page py-5 bg-ivory">
      <div className="container py-3">
        
        {/* Breadcrumb Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-gold pb-3">
          <div>
            <span className="font-montserrat text-gold text-uppercase fw-bold" style={{ fontSize: '0.78rem', letterSpacing: '1.5px' }}>
              Your Shopping Bag
            </span>
            <h1 className="font-serif fw-bold text-maroon mb-0" style={{ fontSize: '2.2rem' }}>
              Cart & Summary ({cartItems.length} items)
            </h1>
          </div>
          <Link href="/sarees" className="btn btn-outline-gold btn-sm rounded-pill font-montserrat fw-semibold">
            ← Continue Shopping
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="card border-0 rounded-4 p-5 text-center bg-white border-gold shadow-sm">
            <FiShoppingBag size={64} className="text-gold mb-3 opacity-50" />
            <h3 className="font-serif fw-bold text-maroon mb-2">Your Shopping Bag is Empty</h3>
            <p className="text-muted font-poppins mb-4" style={{ fontSize: '0.95rem' }}>
              Explore our royal handloom silk saree collection and add your favorite weaves to the bag.
            </p>
            <div>
              <Link href="/sarees" className="btn btn-gold btn-lg rounded-pill font-montserrat fw-bold px-5">
                Browse Silk Sarees
              </Link>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            
            {/* Left Column: Cart Items List */}
            <div className="col-lg-8">
              


              {/* Items List Table / Cards */}
              <div className="d-flex flex-column gap-3">
                {(cartItems || []).map((item) => (
                  <div 
                    key={item.product.id}
                    className="card border-0 rounded-4 p-3 shadow-sm bg-white border-gold d-flex flex-row align-items-center gap-3"
                  >
                    <img 
                      src={item.product?.images?.[0] || '/images/placeholder-saree.jpg'} 
                      alt={item.product.name} 
                      className="rounded-3 object-fit-cover shadow-sm flex-shrink-0"
                      style={{ width: '90px', height: '115px' }}
                      onError={(e) => { e.target.onerror = null; e.target.style.background = 'linear-gradient(135deg, #f0ece4, #e8e2d6)'; e.target.src = '/images/placeholder-saree.jpg'; }}
                    />

                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <Link href={`/product/${item.product.id}`} className="text-decoration-none">
                          <h5 className="font-serif fw-bold text-dark mb-0 hover-text-maroon line-clamp-1" style={{ fontSize: '1.05rem' }}>
                            {item.product.name}
                          </h5>
                        </Link>
                        <button 
                          onClick={() => removeFromCart(item.product.id)}
                          className="btn btn-link text-danger p-0 ms-2 opacity-75"
                          title="Remove Saree"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>

                      <div className="d-flex align-items-center gap-2 mb-2 font-montserrat" style={{ fontSize: '0.78rem' }}>
                        <span className="badge bg-gold text-white">{item.product.category}</span>
                        <span className="text-muted">Fabric: {item.product.fabric}</span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-1">
                        {/* Quantity Controls */}
                        <div className="d-flex align-items-center border border-gold rounded-pill px-3 py-1 bg-ivory">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedColor)}
                            className="btn btn-link text-dark p-0 me-2"
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="fw-bold font-montserrat px-2">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedColor)}
                            className="btn btn-link text-dark p-0 ms-2"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>

                        {/* Math Price Calculation */}
                        <div className="text-end">
                          <span className="text-muted font-poppins d-block" style={{ fontSize: '0.75rem' }}>
                            ₹{item.product.price.toLocaleString('en-IN')} × {item.quantity}
                          </span>
                          <span className="font-montserrat fw-bold text-maroon fs-5">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Column: Order Summary & Checkout Math */}
            <div className="col-lg-4">
              <div className="card border-0 rounded-4 p-4 bg-white border-gold shadow-sm sticky-top" style={{ top: '100px' }}>
                
                <h4 className="font-serif fw-bold text-maroon mb-3 pb-2 border-bottom border-gold">
                  Order Summary
                </h4>

                {/* Promo Code Form */}
                <form onSubmit={handleApplyPromo} className="mb-3">
                  <label className="form-label font-montserrat fw-semibold text-uppercase text-gold" style={{ fontSize: '0.75rem' }}>
                    Have a Promo Code?
                  </label>
                  <div className="d-flex gap-2">
                    <input 
                      type="text" 
                      className="form-control form-control-sm border-gold rounded-pill px-3 font-montserrat text-uppercase"
                      placeholder="e.g. PADMAVATHI10"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                    />
                    <button type="submit" className="btn btn-sm btn-outline-gold rounded-pill px-3 font-montserrat fw-semibold">
                      Apply
                    </button>
                  </div>
                </form>

                {promoAlert && (
                  <div className={`alert ${promoAlert.success ? 'alert-success' : 'alert-danger'} p-2 font-montserrat text-center mb-3`} style={{ fontSize: '0.78rem' }}>
                    {promoAlert.message}
                  </div>
                )}

                {/* Math Breakdown */}
                <div className="d-flex flex-column gap-2.5 font-poppins mb-3 pb-3 border-bottom border-gold" style={{ fontSize: '0.9rem' }}>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Subtotal ({cartItems.length} items):</span>
                    <span className="fw-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="d-flex justify-content-between text-success">
                      <span>Promo Discount ({appliedCoupon}):</span>
                      <span className="fw-semibold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}


                </div>

                {/* Grand Total */}
                <div className="d-flex justify-content-between align-items-baseline mb-4">
                  <span className="font-serif fw-bold fs-5 text-dark">Grand Total:</span>
                  <span className="font-montserrat fw-bold display-6 text-maroon">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <button 
                  onClick={() => router.push('/checkout')}
                  className="btn btn-maroon w-100 py-3 rounded-pill font-montserrat fw-bold shadow d-flex align-items-center justify-content-center gap-2"
                >
                  <span>Proceed to Checkout & UPI Payment</span>
                  <FiArrowRight size={18} />
                </button>

                <div className="mt-3 text-center text-muted font-poppins" style={{ fontSize: '0.78rem' }}>
                  🔒 Secure UPI Payment Gateway (PhonePe, GPay, Paytm)
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Cart;
