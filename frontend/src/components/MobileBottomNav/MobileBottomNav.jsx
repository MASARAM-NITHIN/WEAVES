import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiGrid, FiShoppingBag, FiHeart, FiPackage } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const MobileBottomNav = () => {
  const pathname = usePathname();
  const { cartCount, setIsCartOpen, subtotal } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();

  // Hide bottom bar on admin portal page to avoid distraction
  if (pathname === '/admin') return null;

  return (
    <nav className="mobile-bottom-nav d-md-none fixed-bottom shadow-2xl">
      <div className="d-flex align-items-center justify-content-around py-2 px-1">
        
        {/* Home Tab */}
        <Link 
          href="/" 
          className={`mobile-nav-item d-flex flex-column align-items-center text-decoration-none ${pathname === '/' ? 'active' : ''}`}
        >
          <FiHome size={20} className="nav-icon mb-1" />
          <span className="nav-label font-montserrat">Home</span>
        </Link>

        {/* Sarees Catalog Tab */}
        <Link 
          href="/sarees" 
          className={`mobile-nav-item d-flex flex-column align-items-center text-decoration-none ${pathname === '/sarees' ? 'active' : ''}`}
        >
          <FiGrid size={20} className="nav-icon mb-1" />
          <span className="nav-label font-montserrat">Sarees</span>
        </Link>

        {/* Shopping Bag Drawer Tab */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="mobile-nav-item d-flex flex-column align-items-center text-decoration-none btn p-0 border-0 position-relative"
        >
          <div className="position-relative">
            <FiShoppingBag size={20} className="nav-icon mb-1 text-white" />
            {cartCount > 0 && (
              <span className="badge-count position-absolute top-0 start-100 translate-middle bg-gold text-dark font-montserrat fw-bold rounded-circle">
                {cartCount}
              </span>
            )}
          </div>
          <span className="nav-label font-montserrat text-white">
            {cartCount > 0 ? `₹${(subtotal || 0).toLocaleString('en-IN')}` : 'Bag'}
          </span>
        </button>

        {/* Wishlist Drawer Tab */}
        <button 
          onClick={() => setIsWishlistOpen(true)}
          className="mobile-nav-item d-flex flex-column align-items-center text-decoration-none btn p-0 border-0 position-relative"
        >
          <div className="position-relative">
            <FiHeart size={20} className="nav-icon mb-1 text-white" />
            {wishlistCount > 0 && (
              <span className="badge-count position-absolute top-0 start-100 translate-middle bg-gold text-dark font-montserrat fw-bold rounded-circle">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="nav-label font-montserrat text-white">Wishlist</span>
        </button>


      </div>

      <style>{`
        .mobile-bottom-nav {
          background: linear-gradient(180deg, #680E25 0%, #4A0819 100%);
          border-top: 2px solid #C8A54B;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 1050;
          padding-bottom: max(6px, env(safe-area-inset-bottom));
        }

        .mobile-nav-item {
          color: rgba(255, 253, 248, 0.75);
          transition: all 0.2s ease;
          width: 20%;
          padding: 4px 0;
        }

        .mobile-nav-item:active {
          transform: scale(0.92);
        }

        .mobile-nav-item.active {
          color: #C8A54B !important;
        }

        .mobile-nav-item.active .nav-icon {
          color: #C8A54B !important;
          transform: translateY(-2px);
        }

        .nav-label {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.2px;
          line-height: 1.1;
        }

        .badge-count {
          font-size: 0.62rem;
          width: 17px;
          height: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
      `}</style>
    </nav>
  );
};

export default MobileBottomNav;
