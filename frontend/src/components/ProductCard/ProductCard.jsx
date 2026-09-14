'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiHeart, FiEye, FiShoppingBag, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getProductImageUrl } from '../../lib/imageHelper';
import Image from 'next/image';

const ProductCard = ({ product, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();

  const isSaved = isInWishlist(product.id);
  const isOutOfStock = product.stock !== undefined ? product.stock <= 0 : false;
  const secondImage = product.images && product.images[1] ? product.images[1] : product.images[0];

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    router.push('/checkout');
  };

  return (
    <div 
      className="card product-card h-100 border-0 rounded-4 overflow-hidden position-relative shadow-sm transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: '#FFFDF8',
        border: '1px solid rgba(200, 165, 75, 0.2)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}
    >
      {/* Discount Badge or Out of Stock Badge */}
      {isOutOfStock ? (
        <div 
          className="position-absolute top-0 start-0 m-2.5 z-2 badge bg-danger font-montserrat px-2 py-1 shadow-sm text-uppercase fw-bold"
          style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}
        >
          Out Of Stock
        </div>
      ) : (
        product.originalPrice && product.originalPrice > product.price && (
          <div 
            className="position-absolute top-0 start-0 m-2.5 z-2 badge bg-maroon font-montserrat px-2 py-1 shadow-sm"
            style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}
          >
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )
      )}

      {/* Wishlist Heart Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className={`position-absolute top-0 end-0 m-1.5 m-sm-2 z-2 btn btn-light rounded-circle shadow-sm p-1.5 d-flex align-items-center justify-content-center transition-all ${
          isSaved ? 'text-danger bg-white' : 'text-muted'
        }`}
        style={{ width: '32px', height: '32px' }}
        title="Save to Wishlist"
      >
        <FiHeart size={15} style={{ fill: isSaved ? '#DC3545' : 'rgba(220, 53, 69, 0.2)', color: '#DC3545' }} />
      </button>

      {/* Image Container with Hover Zoom */}
      <div 
        className="position-relative overflow-hidden cursor-pointer bg-light" 
        onClick={() => router.push(`/product/${product.id}`)}
        style={{ aspectRatio: '3 / 4', width: '100%' }}
      >
        <Image 
          src={isHovered ? getProductImageUrl(secondImage) : getProductImageUrl(product.images && product.images[0])} 
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-fit-cover transition-all ${isOutOfStock ? 'opacity-75 grayscale' : ''}`}
          style={{
            transition: 'transform 0.5s ease',
            transform: isHovered ? 'scale(1.06)' : 'scale(1)'
          }}
         />

        {/* Quick View Button Overlay */}
        <div 
          className={`position-absolute bottom-0 start-0 w-100 p-2.5 d-flex justify-content-center transition-all z-2 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
          style={{
            background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
            transition: 'all 0.25s ease'
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="btn btn-sm btn-gold rounded-pill px-4 py-1.5 font-montserrat shadow-sm"
            style={{ fontSize: '0.75rem' }}
          >
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Card Body Details */}
      <div className="card-body p-3 d-flex flex-column justify-content-between">
        <div>
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="text-uppercase font-montserrat text-gold fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
              {product.category}
            </span>
            <div className="d-flex align-items-center gap-1.5 text-warning">
              <div className="d-flex" style={{ gap: '1.5px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    size={11}
                    style={{
                      fill: star <= Math.round(product.rating || 0) && product.rating > 0 ? '#C8A54B' : 'none',
                      color: '#C8A54B'
                    }}
                  />
                ))}
              </div>
              <span className="font-montserrat text-dark fw-bold ms-0.5" style={{ fontSize: '0.72rem' }}>
                {product.rating > 0 ? product.rating : 'New'}
              </span>
            </div>
          </div>

          <Link href={`/product/${product.id}`} className="text-decoration-none">
            <h5 className="font-serif fw-bold text-dark mb-1.5 text-truncate-2 hover-text-maroon" style={{ fontSize: '0.92rem', minHeight: '2.5rem' }}>
              {product.name}
            </h5>
          </Link>

          <p 
            className="text-muted font-poppins mb-2.5 line-clamp-2" 
            style={{ 
              fontSize: '0.8rem', 
              lineHeight: '1.4',
              minHeight: '2.2rem',
              margin: '0 0 0.8rem 0'
            }}
          >
            {product.shortDescription || product.description}
          </p>
        </div>

        {/* Price & Aesthetic Compact Action Buttons */}
        <div>
          <div className="d-flex align-items-baseline gap-2 mb-2.5">
            <span className="font-montserrat fw-bold text-maroon fs-5">
              ₹{(product.price || 0).toLocaleString('en-IN')}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-muted text-decoration-line-through font-montserrat" style={{ fontSize: '0.78rem' }}>
                ₹{(product.originalPrice || 0).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {isOutOfStock ? (
            <button
              disabled
              className="btn btn-sm btn-secondary w-100 rounded-pill font-montserrat fw-bold text-uppercase shadow-sm d-flex align-items-center justify-content-center"
              style={{ 
                fontSize: '0.78rem', 
                height: '38px', 
                whiteSpace: 'nowrap',
                lineHeight: '1',
                backgroundColor: '#6c757d',
                cursor: 'not-allowed',
                border: 'none'
              }}
            >
              Out of Stock
            </button>
          ) : (
            <div className="d-flex flex-column flex-xl-row gap-1.5 gap-xl-2">
              <button
                onClick={handleAddToCart}
                className="btn btn-sm btn-outline-maroon flex-grow-1 rounded-pill font-montserrat fw-bold d-flex align-items-center justify-content-center py-1.5 px-2 text-nowrap"
                style={{ fontSize: '0.78rem', height: '38px', whiteSpace: 'nowrap', lineHeight: '1' }}
              >
                <span>Add to Bag</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="btn btn-sm btn-maroon flex-grow-1 rounded-pill font-montserrat fw-bold py-1.5 px-2 text-nowrap"
                style={{ fontSize: '0.78rem', height: '38px', whiteSpace: 'nowrap', lineHeight: '1' }}
              >
                Buy Now
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductCard;
