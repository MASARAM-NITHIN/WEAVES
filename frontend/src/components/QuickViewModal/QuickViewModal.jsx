'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiX, FiStar, FiShoppingBag, FiHeart, FiTruck, FiShield } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getProductImageUrl } from '../../lib/imageHelper';
import Image from 'next/image';

const QuickViewModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedQuantity] = useState(1);
  const router = useRouter();

  if (!product) return null;

  const isSaved = isInWishlist(product.id);
  const isOutOfStock = product.stock !== undefined ? product.stock <= 0 : (product.inStock === false);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedQuantity);
    onClose();
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedQuantity);
    onClose();
    router.push('/checkout');
  };

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center p-3"
      style={{
        zIndex: 2060,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.25s ease'
      }}
    >
      <div 
        className="card w-100 shadow-2xl border-0 rounded-4 overflow-hidden"
        style={{
          maxWidth: '880px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#FFFDF8',
          border: '1.5px solid #C8A54B'
        }}
      >
        <div className="card-body p-0 position-relative">
          {/* Close Modal Button */}
          <button 
            onClick={onClose}
            className="btn btn-outline-maroon rounded-circle p-2 position-absolute top-0 end-0 m-3 z-3 bg-white"
            style={{ width: '38px', height: '38px' }}
          >
            <FiX size={20} />
          </button>

          <div className="row g-0">
            {/* Image Gallery Column */}
            <div className="col-md-6 bg-light p-3 d-flex flex-column align-items-center justify-content-center">
              <div className="position-relative w-100 text-center mb-3">
                <div className="position-relative w-100 overflow-hidden rounded-3 shadow-sm" style={{ height: '400px' }}>
                  <Image 
                    src={getProductImageUrl(product.images[activeImageIndex] || product.images[0])} 
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-fit-cover"
                  />
                </div>
                {isOutOfStock ? (
                  <span className="position-absolute top-0 start-0 m-2 badge bg-danger font-montserrat px-3 py-1.5 shadow fs-6 text-uppercase fw-bold">
                    Out of Stock
                  </span>
                ) : (
                  product.originalPrice && product.originalPrice > product.price && (
                    <span className="position-absolute top-0 start-0 m-2 badge bg-danger font-montserrat px-2 py-1">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  )
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="d-flex gap-2 justify-content-center">
                  {(product.images || []).map((img, idx) => (
                    <Image
                      key={idx}
                      src={getProductImageUrl(img)}
                      alt="Thumbnail"
                      width={55}
                      height={65}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`rounded-2 cursor-pointer border ${activeImageIndex === idx ? 'border-maroon border-2' : 'border-light'}`}
                      style={{ objectFit: 'cover', cursor: 'pointer' }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Details Column */}
            <div className="col-md-6 p-4 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-gold text-white font-montserrat" style={{ fontSize: '0.7rem' }}>
                    {product.category}
                  </span>
                  <span className="badge bg-maroon-subtle text-maroon font-montserrat" style={{ fontSize: '0.7rem' }}>
                    {product.fabric}
                  </span>
                </div>

                <h4 className="font-serif fw-bold text-maroon mb-2" style={{ fontSize: '1.3rem' }}>
                  {product.name}
                </h4>

                {/* Rating */}
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="d-flex text-warning" style={{ gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar 
                        key={star} 
                        size={15} 
                        style={{ fill: star <= Math.round(product.rating || 0) && product.rating > 0 ? '#C8A54B' : 'none', color: '#C8A54B' }}
                      />
                    ))}
                  </div>
                  <span className="fw-bold font-montserrat text-dark" style={{ fontSize: '0.85rem' }}>
                    {product.rating > 0 ? product.rating : 'New'}
                  </span>
                  <span className="text-muted font-poppins" style={{ fontSize: '0.8rem' }}>
                    ({product.reviewsCount} reviews)
                  </span>
                </div>

                {/* Price Display */}
                <div className="d-flex align-items-baseline gap-3 mb-3">
                  <span className="font-montserrat fw-bold text-maroon fs-3">
                    ₹{(product.price || 0).toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-muted text-decoration-line-through font-montserrat fs-6">
                      ₹{(product.originalPrice || 0).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <p className="text-muted font-poppins mb-3" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                  {product.shortDescription || product.description}
                </p>

                {/* Key Features Callout */}
                <div className="d-flex flex-column gap-2 mb-4 bg-light-gold p-2.5 rounded-3" style={{ backgroundColor: 'rgba(200, 165, 75, 0.08)' }}>
                  <div className="d-flex align-items-center gap-2 text-dark font-poppins" style={{ fontSize: '0.8rem' }}>
                    <FiShield className="text-gold" />
                    <span>Certified Pure Silk Mark Authenticity Guarantee</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-dark font-poppins" style={{ fontSize: '0.8rem' }}>
                    <FiTruck className="text-gold" />
                    <span>Free Shipping Across India & Express Global Delivery</span>
                  </div>
                </div>
              </div>

              {/* Actions Button Row */}
              <div className="d-flex gap-2">
                {isOutOfStock ? (
                  <button
                    disabled
                    className="btn btn-secondary flex-grow-1 py-2.5 rounded-pill font-montserrat fw-bold text-uppercase shadow-sm"
                    style={{ fontSize: '0.85rem', cursor: 'not-allowed', backgroundColor: '#6c757d', whiteSpace: 'nowrap', lineHeight: '1' }}
                  >
                    Out of Stock
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleAddToCart}
                      className="btn btn-outline-maroon flex-grow-1 py-2.5 rounded-pill font-montserrat fw-bold d-flex align-items-center justify-content-center"
                      style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', lineHeight: '1' }}
                    >
                      <span>Add to Bag</span>
                    </button>

                    <button
                      onClick={handleBuyNow}
                      className="btn btn-maroon flex-grow-1 py-2.5 rounded-pill font-montserrat fw-bold"
                      style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', lineHeight: '1' }}
                    >
                      Buy Now
                    </button>
                  </>
                )}

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`btn p-2.5 rounded-circle border-gold ${isSaved ? 'btn-danger text-white' : 'btn-outline-gold'}`}
                  style={{ width: '45px', height: '45px' }}
                  title="Wishlist"
                >
                  <FiHeart size={18} style={{ fill: isSaved ? '#FFFFFF' : 'none' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
