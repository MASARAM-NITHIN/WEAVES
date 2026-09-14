'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiX, FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { getProductImageUrl } from '../../lib/imageHelper';

const CartDrawer = () => {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal } = useCart();
  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const router = useRouter();



  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === 'PADMAVATHI10' || coupon.trim().toUpperCase() === 'ROYALSILK') {
      setDiscountPercent(10);
      setAppliedCoupon(coupon.toUpperCase());
    } else {
      alert('Invalid coupon code. Try "PADMAVATHI10" for 10% OFF!');
    }
  };

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const handleViewFullCart = () => {
    setIsCartOpen(false);
    router.push('/cart');
  };

  if (!isCartOpen) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-end"
      style={{
        zIndex: 2050,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div 
        className="bg-ivory h-100 w-100 d-flex flex-column shadow-lg"
        style={{
          maxWidth: '460px',
          background: '#FFFDF8',
          borderLeft: '2px solid #C8A54B',
          animation: 'slideLeft 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div className="p-3 p-md-4 border-bottom border-gold d-flex align-items-center justify-content-between text-white" style={{ background: 'linear-gradient(135deg, #7B112C 0%, #580B1F 100%)' }}>
          <div className="d-flex align-items-center gap-2">
            <FiShoppingBag size={22} className="text-gold" />
            <h5 className="font-serif mb-0 fw-bold" style={{ color: '#FFFDF8' }}>
              Your Shopping Bag ({cartItems.length})
            </h5>
          </div>
          <button 
            className="btn btn-link text-white p-0"
            onClick={() => setIsCartOpen(false)}
          >
            <FiX size={24} />
          </button>
        </div>



        {/* Cart Body Items List */}
        <div className="flex-grow-1 p-3 p-md-4 overflow-auto">
          {cartItems.length === 0 ? (
            <div className="text-center py-5">
              <FiShoppingBag size={50} className="text-muted mb-3 opacity-50" />
              <h5 className="font-serif text-maroon mb-2">Your Bag is Empty</h5>
              <p className="text-muted font-poppins" style={{ fontSize: '0.88rem' }}>
                Explore our exquisite silk saree collections and add timeless weaves to your bag.
              </p>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="btn btn-gold btn-sm mt-3"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {(cartItems || []).map((item) => (
                <div 
                  key={item.product.id} 
                  className="d-flex gap-3 p-2 rounded-3 border border-gold bg-white shadow-sm"
                >
                  <img 
                    src={getProductImageUrl(item.product.images[0])} 
                    alt={item.product.name} 
                    className="rounded-2 object-fit-cover"
                    style={{ width: '70px', height: '85px' }}
                   onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
                  <div className="flex-grow-1 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="font-serif text-dark fw-bold mb-1 line-clamp-1" style={{ fontSize: '0.88rem' }}>
                          {item.product.name}
                        </h6>
                        <button 
                          onClick={() => removeFromCart(item.product.id)}
                          className="btn btn-link text-danger p-0 ms-1 opacity-75"
                          title="Remove item"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                      <span className="text-muted font-montserrat d-block mb-1" style={{ fontSize: '0.75rem' }}>
                        Fabric: {item.product.fabric}
                      </span>
                    </div>

                    <div className="d-flex align-items-center justify-content-between">
                      {/* Quantity Controls */}
                      <div className="d-flex align-items-center border border-gold rounded-pill px-2 py-0">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedColor)}
                          className="btn btn-link text-dark p-0"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="px-2 font-montserrat fw-semibold" style={{ fontSize: '0.82rem' }}>
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedColor)}
                          className="btn btn-link text-dark p-0"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>

                      <span className="fw-bold text-maroon font-montserrat" style={{ fontSize: '0.92rem' }}>
                        ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary & Redirect to Payment Gateway */}
        {cartItems.length > 0 && (
          <div className="p-3 p-md-4 border-top border-gold bg-white">
            {/* Coupon Code Form */}
            <form onSubmit={handleApplyCoupon} className="d-flex gap-2 mb-3">
              <input 
                type="text" 
                className="form-control form-control-sm border-gold font-montserrat text-uppercase"
                placeholder="Promo Code (PADMAVATHI10)"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                style={{ fontSize: '0.8rem' }}
              />
              <button type="submit" className="btn btn-sm btn-outline-gold px-3 font-montserrat" style={{ fontSize: '0.8rem' }}>
                Apply
              </button>
            </form>

            {appliedCoupon && (
              <div className="d-flex justify-content-between text-success font-montserrat mb-2" style={{ fontSize: '0.8rem' }}>
                <span>Coupon ({appliedCoupon}):</span>
                <span>-₹{(discountAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="d-flex justify-content-between font-montserrat mb-1" style={{ fontSize: '0.85rem' }}>
              <span className="text-muted">Subtotal:</span>
              <span className="fw-semibold">₹{(subtotal || 0).toLocaleString('en-IN')}</span>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="font-serif fw-bold fs-5 text-dark">Grand Total:</span>
              <span className="font-montserrat fw-bold fs-4 text-maroon">
                ₹{(grandTotal || 0).toLocaleString('en-IN')}
              </span>
            </div>

            {/* DIRECT PAYMENT GATEWAY REDIRECT BUTTON */}
            <div className="d-flex flex-column gap-2">
              <button 
                onClick={handleProceedToCheckout} 
                className="btn btn-maroon w-100 py-3 rounded-pill fw-bold font-montserrat d-flex align-items-center justify-content-center gap-2 shadow"
              >
                <span>Proceed to Payment Gateway</span>
                <FiArrowRight size={18} />
              </button>

              <button 
                onClick={handleViewFullCart} 
                className="btn btn-outline-gold w-100 py-2 rounded-pill font-montserrat fw-semibold"
                style={{ fontSize: '0.82rem' }}
              >
                View Full Shopping Bag
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
