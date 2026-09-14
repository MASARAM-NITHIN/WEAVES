import React from 'react';
import { FiX, FiHeart, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { getProductImageUrl } from '../../lib/imageHelper';

const WishlistDrawer = () => {
  const { wishlistItems, isWishlistOpen, setIsWishlistOpen, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!isWishlistOpen) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-end"
      style={{
        zIndex: 2040,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div 
        className="bg-ivory h-100 w-100 d-flex flex-column shadow-lg"
        style={{
          maxWidth: '440px',
          background: '#FFFDF8',
          borderLeft: '2px solid #C8A54B',
          animation: 'slideLeft 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div className="p-3 p-md-4 border-bottom border-gold d-flex align-items-center justify-content-between text-white" style={{ background: 'linear-gradient(135deg, #7B112C 0%, #580B1F 100%)' }}>
          <div className="d-flex align-items-center gap-2">
            <FiHeart size={22} className="text-gold" />
            <h5 className="font-serif mb-0 fw-bold" style={{ color: '#FFFDF8' }}>
              Saved Wishlist ({wishlistItems.length})
            </h5>
          </div>
          <button 
            className="btn btn-link text-white p-0"
            onClick={() => setIsWishlistOpen(false)}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Body Items */}
        <div className="flex-grow-1 p-3 p-md-4 overflow-auto">
          {wishlistItems.length === 0 ? (
            <div className="text-center py-5">
              <FiHeart size={50} className="text-muted mb-3 opacity-50" />
              <h5 className="font-serif text-maroon mb-2">Your Wishlist is Empty</h5>
              <p className="text-muted font-poppins" style={{ fontSize: '0.88rem' }}>
                Tap the heart icon on any saree to save your favorite luxury weaves here.
              </p>
              <button 
                onClick={() => setIsWishlistOpen(false)} 
                className="btn btn-gold btn-sm mt-3"
              >
                Browse Sarees
              </button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {(wishlistItems || []).map((product) => (
                <div 
                  key={product.id}
                  className="d-flex gap-3 p-2 rounded-3 border border-gold bg-white shadow-sm align-items-center"
                >
                  <img 
                    src={getProductImageUrl(product.images[0])} 
                    alt={product.name} 
                    className="rounded-2 object-fit-cover"
                    style={{ width: '70px', height: '85px' }}
                   onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
                  <div className="flex-grow-1">
                    <h6 className="font-serif text-dark fw-bold mb-1 line-clamp-1" style={{ fontSize: '0.88rem' }}>
                      {product.name}
                    </h6>
                    <span className="badge bg-gold text-white font-montserrat mb-1" style={{ fontSize: '0.68rem' }}>
                      {product.category}
                    </span>
                    <div className="fw-bold text-maroon font-montserrat" style={{ fontSize: '0.9rem' }}>
                      ₹{(product.price || 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    <button
                      onClick={() => {
                        addToCart(product);
                        toggleWishlist(product);
                      }}
                      className="btn btn-sm btn-gold p-2 rounded-circle"
                      title="Move to Cart"
                    >
                      <FiShoppingBag size={16} />
                    </button>
                    <button
                      onClick={() => toggleWishlist(product)}
                      className="btn btn-sm btn-outline-danger p-2 rounded-circle"
                      title="Remove from Wishlist"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistDrawer;
