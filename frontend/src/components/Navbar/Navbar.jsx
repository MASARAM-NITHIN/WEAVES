import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiSearch, FiShoppingBag, FiMenu, FiX, FiLock, FiHeart, FiUser, FiLogOut, FiGrid, FiPackage, FiChevronDown } from 'react-icons/fi';
import { GiCrown } from 'react-icons/gi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
const brandLogo = '/images/placeholder-saree.jpg';

const Navbar = ({ onOpenSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { cartCount, setIsCartOpen, subtotal } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const userDropdownRef = useRef(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setUserDropdownOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className={`sticky-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container py-2 py-lg-3">
        <div className="d-flex align-items-center justify-content-between">
          
          {/* Mobile Hamburger Button */}
          <button 
            className="btn d-lg-none p-1 border-0 me-1"
            style={{ color: isScrolled ? '#FFFDF8' : '#7B112C' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <FiX size={26} color={isScrolled ? '#FFFDF8' : '#7B112C'} /> : <FiMenu size={26} color={isScrolled ? '#FFFDF8' : '#7B112C'} />}
          </button>

          {/* Logo & Branding */}
          <Link href="/" className="brand-hover-effect text-decoration-none d-flex align-items-center gap-2 me-auto me-lg-0">
            <div 
              className="brand-logo-icon rounded-circle overflow-hidden d-flex align-items-center justify-content-center shadow-sm"
              style={{
                width: '42px',
                height: '42px',
                border: '1.5px solid #C8A54B',
                boxShadow: '0 2px 8px rgba(123, 17, 44, 0.2)'
              }}
            >
              <img 
                src={brandLogo} 
                alt="Sree Padmavathi Silks Logo" 
                className="w-100 h-100 object-fit-cover"
               onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
            </div>
            <div className="d-flex flex-column">
              <span 
                className="brand-title font-serif fw-bold lh-1 text-nowrap" 
                style={{ 
                  fontSize: 'clamp(0.95rem, 3.8vw, 1.25rem)', 
                  letterSpacing: '0.5px',
                  color: isScrolled ? '#FFFDF8' : 'var(--primary-maroon)'
                }}
              >
                Sree Padmavathi Silks
              </span>
              <span 
                className="brand-tagline font-montserrat fw-medium text-uppercase text-gold d-none d-sm-block" 
                style={{ 
                  fontSize: '0.55rem', 
                  letterSpacing: '1.2px',
                  color: 'var(--royal-gold)' 
                }}
              >
                Tradition Woven Into Elegance
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="d-none d-lg-flex align-items-center flex-nowrap text-nowrap gap-2 gap-xl-3">
            <Link href="/" className={`nav-link-custom ${pathname === '/' ? 'active-link' : ''}`}>
              Home
            </Link>
            <Link href="/sarees" className={`nav-link-custom ${pathname === '/sarees' ? 'active-link' : ''}`}>
              The Loom Gallery
            </Link>
            <Link href="/collections" className={`nav-link-custom ${pathname === '/collections' ? 'active-link' : ''}`}>
              Collections
            </Link>
            <Link href="/contact" className={`nav-link-custom ${pathname === '/contact' ? 'active-link' : ''}`}>
              Contact
            </Link>


          </nav>

          {/* Action Icons */}
          <div className="d-flex align-items-center gap-1.5 gap-sm-2">
            
            {/* Expanding Search Bar (Desktop & Mobile) */}
            <form 
              className={`search-expanding-wrapper d-flex align-items-center rounded-pill px-1 px-md-2 ${isScrolled ? 'scrolled' : ''}`}
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const searchInput = form.elements.searchQuery;
                const query = searchInput.value.trim();
                if (query) {
                  router.push(`/sarees?search=${encodeURIComponent(query)}`);
                  searchInput.value = '';
                  searchInput.blur();
                } else {
                  onOpenSearch();
                }
              }}
            >
              <button 
                type="submit"
                className="btn search-expanding-btn d-flex align-items-center justify-content-center p-0"
                title="Search"
                onClick={(e) => {
                  const searchInput = e.currentTarget.nextElementSibling;
                  if (document.activeElement !== searchInput && window.innerWidth < 768) {
                    e.preventDefault();
                    searchInput.focus();
                  }
                }}
              >
                <FiSearch size={20} style={{ width: '20px', height: '20px', minWidth: '20px' }} />
              </button>
              <input 
                type="text"
                name="searchQuery"
                className="search-expanding-input font-montserrat"
                placeholder="Search..."
              />
            </form>

            {/* User Auth Section */}
            {!isLoggedIn ? (
              /* Guest: Owner/Admin Login & Your Orders */
              <div className="d-flex align-items-center gap-2">
                <Link 
                  href="/your-orders" 
                  className="btn btn-icon-custom d-none d-sm-flex align-items-center justify-content-center rounded-pill px-3 py-1 gap-1.5"
                  style={{ 
                    border: '1.5px solid transparent',
                    backgroundColor: 'transparent',
                    color: isScrolled ? '#FFFDF8' : '#7B112C',
                    height: '36px',
                    fontSize: '0.85rem',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                  title="Your Orders"
                >
                  <FiShoppingBag size={15} />
                  <span>Your Orders</span>
                </Link>
                <Link 
                  href="/admin" 
                  className="btn btn-icon-custom d-none d-sm-flex align-items-center justify-content-center rounded-pill px-3 py-1 gap-1.5"
                  style={{ 
                    border: '1.5px solid #C8A54B',
                    backgroundColor: isScrolled ? 'rgba(255,255,255,0.15)' : 'rgba(123, 17, 44, 0.05)',
                    color: isScrolled ? '#FFFDF8' : '#7B112C',
                    height: '36px',
                    fontSize: '0.78rem',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                  title="Owner Login"
                >
                  <FiLock size={14} />
                  <span>Owner Login</span>
                </Link>
                {/* Mobile: Lock icon removed because it is in the drawer and causes layout overflow */}
              </div>
            ) : (
              /* Logged In: User dropdown */
              <div className="position-relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="btn btn-icon-custom d-flex align-items-center justify-content-center rounded-pill px-2 py-1 gap-1"
                  style={{ 
                    border: '1px solid #C8A54B',
                    backgroundColor: isScrolled ? 'rgba(255,255,255,0.15)' : 'rgba(123, 17, 44, 0.05)',
                    color: isScrolled ? '#FFFDF8' : '#7B112C',
                    height: '36px'
                  }}
                  title={user?.fullName || user?.username || 'Account'}
                >
                  <div 
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{ 
                      width: '24px', height: '24px', 
                      background: 'linear-gradient(135deg, #C8A54B, #7B112C)', 
                      color: '#FFFDF8', 
                      fontSize: '0.7rem', 
                      fontWeight: 700,
                      fontFamily: "'Montserrat', sans-serif"
                    }}
                  >
                    {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="d-none d-md-inline font-montserrat fw-semibold" style={{ fontSize: '0.78rem', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.fullName || user?.username}
                  </span>
                  <FiChevronDown size={14} style={{ transition: 'transform 0.2s', transform: userDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="user-dropdown-menu">
                    {/* User info header */}
                    <div className="user-dropdown-header">
                      <div className="user-dropdown-avatar">
                        {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-bold" style={{ fontSize: '0.85rem', color: '#2E2E2E' }}>{user?.fullName || user?.username}</div>
                        <div style={{ fontSize: '0.7rem', color: '#888' }}>{user?.email || ''}</div>
                      </div>
                    </div>
                    <div className="user-dropdown-divider"></div>
                    <button onClick={handleLogout} className="user-dropdown-item user-dropdown-logout">
                      <FiLogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}



            {/* Wishlist Button (Responsive: Heart Icon on Mobile, Full Pill on Desktop) */}
            <button 
              onClick={() => setIsWishlistOpen(true)} 
              className="btn btn-icon-custom position-relative d-flex align-items-center justify-content-center px-2 py-1 rounded-pill" 
              style={{ 
                border: '1px solid #C8A54B',
                backgroundColor: isScrolled ? 'rgba(255,255,255,0.15)' : 'rgba(123, 17, 44, 0.05)',
                color: isScrolled ? '#FFFDF8' : '#7B112C',
                height: '36px',
                minWidth: '36px'
              }}
              title="Wishlist"
            >
              <FiHeart size={16} className="text-maroon me-0 me-sm-1" style={{ color: isScrolled ? '#FFFDF8' : '#7B112C' }} />
              <span className="font-montserrat fw-bold d-none d-sm-inline" style={{ fontSize: '0.78rem', color: isScrolled ? '#FFFDF8' : '#7B112C' }}>
                Wishlist
              </span>
              {wishlistCount > 0 && (
                <span className="badge rounded-circle bg-gold text-dark font-montserrat ms-1" style={{ fontSize: '0.62rem', padding: '0.2em 0.45em' }}>
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="btn btn-icon-custom position-relative d-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill"
              style={{ 
                border: '1px solid #C8A54B',
                backgroundColor: isScrolled ? 'rgba(255,255,255,0.15)' : 'rgba(123, 17, 44, 0.05)',
                color: isScrolled ? '#FFFDF8' : '#7B112C',
                height: '36px'
              }}
              title="Shopping Cart"
            >
              <div className="position-relative">
                <FiShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger text-white" style={{ fontSize: '0.62rem' }}>
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="d-none d-sm-inline font-montserrat fw-semibold" style={{ fontSize: '0.78rem' }}>
                ₹{(subtotal || 0).toLocaleString('en-IN')}
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-panel d-lg-none mt-3 p-3 rounded-4 shadow-lg animate__animated animate__fadeInDown" style={{ background: '#7B112C', color: '#FFFDF8', border: '1.5px solid #C8A54B' }}>
            <div className="d-flex flex-column gap-2.5 py-2">
              <Link href="/" className="text-white text-decoration-none fw-medium fs-6 pb-2 border-bottom border-secondary">Home</Link>
              <Link href="/sarees" className="text-white text-decoration-none fw-medium fs-6 pb-2 border-bottom border-secondary">The Loom Gallery (Fabrics & Weaves)</Link>
              <Link href="/collections" className="text-white text-decoration-none fw-medium fs-6 pb-2 border-bottom border-secondary">Theme Collections</Link>
              <Link href="/contact" className="text-white text-decoration-none fw-medium fs-6 pb-2 border-bottom border-secondary">Contact Us</Link>
              
              {/* Auth-aware mobile links */}
              {!isLoggedIn ? (
                <div className="mt-2 d-flex flex-column gap-2">
                  <Link 
                    href="/your-orders" 
                    className="btn btn-outline-light w-100 rounded-pill font-montserrat fw-bold py-2.5 text-white text-decoration-none d-flex align-items-center justify-content-center gap-2"
                    style={{ borderColor: 'rgba(255,255,255,0.4)' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiShoppingBag size={16} />
                    <span>Your Orders</span>
                  </Link>
                  <Link 
                    href="/admin" 
                    className="btn btn-gold w-100 rounded-pill font-montserrat fw-bold py-2.5 text-white text-decoration-none d-flex align-items-center justify-content-center gap-2 shadow"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiLock size={16} />
                    <span>Owner Login</span>
                  </Link>
                </div>
              ) : (
                <>

                  <button 
                    onClick={handleLogout}
                    className="btn btn-outline-light w-100 rounded-pill font-montserrat fw-bold py-2.5 mt-1 d-flex align-items-center justify-content-center gap-2"
                    style={{ borderColor: 'rgba(255,255,255,0.3)' }}
                  >
                    <FiLogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-link-custom {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.84rem;
          font-weight: 600;
          color: ${isScrolled ? '#FFFDF8' : '#2E2E2E'};
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          padding: 4px 0;
          white-space: nowrap;
        }
        .nav-link-custom:hover, .nav-link-custom.active-link {
          color: #C8A54B !important;
        }
        .nav-link-custom::after {
          content: '';
          position: absolute;
          width: 0%;
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: #C8A54B;
          transition: width 0.3s ease;
        }
        .nav-link-custom:hover::after, .nav-link-custom.active-link::after {
          width: 100%;
        }
        .btn-icon-custom {
          background: transparent;
          border: none;
          padding: 6px;
          border-radius: 50%;
          transition: opacity 0.2s ease;
        }
        .btn-icon-custom:hover {
          opacity: 0.85;
        }
        
        .brand-hover-effect {
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease;
        }
        .brand-hover-effect:hover {
          transform: scale(1.03);
        }
        .brand-hover-effect:hover .brand-title {
          text-shadow: 0 2px 10px rgba(200, 165, 75, 0.5);
          color: #C8A54B !important;
        }
        .brand-hover-effect .brand-title {
          transition: text-shadow 0.3s ease, color 0.3s ease;
        }
        .bg-gold {
          background-color: #C8A54B;
        }
        .text-maroon {
          color: #7B112C;
        }

        /* User Dropdown Styles */
        .user-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 240px;
          background: #FFFDF8;
          border: 1.5px solid #C8A54B;
          border-radius: 16px;
          box-shadow: 0 12px 40px rgba(123, 17, 44, 0.18), 0 2px 8px rgba(0,0,0,0.06);
          z-index: 9999;
          padding: 6px 0;
          animation: dropdownFadeIn 0.2s ease-out;
          overflow: hidden;
        }
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .user-dropdown-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px 10px;
        }
        .user-dropdown-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #C8A54B, #7B112C);
          color: #FFFDF8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          font-family: 'Montserrat', sans-serif;
          flex-shrink: 0;
        }
        .user-dropdown-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #C8A54B44, transparent);
          margin: 4px 12px;
        }
        .user-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          color: #2E2E2E;
          text-decoration: none;
          border: none;
          background: none;
          width: 100%;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .user-dropdown-item:hover {
          background: rgba(200, 165, 75, 0.12);
          color: #7B112C;
        }
        .user-dropdown-logout {
          color: #B91C1C;
        }
        .user-dropdown-logout:hover {
          background: rgba(185, 28, 28, 0.08);
          color: #991B1B;
        }
        .search-hover-icon {
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.3s ease;
        }
        .search-hover-icon:hover {
          transform: scale(1.25);
          color: #C8A54B !important;
        }
        .search-expanding-wrapper {
          border: 1px solid transparent;
          transition: all 0.4s ease;
          height: 36px;
        }
        .search-expanding-wrapper:hover {
          border-color: #C8A54B;
          background: rgba(123, 17, 44, 0.05);
        }
        .search-expanding-wrapper.scrolled:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .search-expanding-input {
          width: 0px;
          opacity: 0;
          border: none;
          background: transparent;
          outline: none;
          color: #7B112C;
          font-size: 0.85rem;
          transition: width 0.4s ease, opacity 0.4s ease, padding 0.4s ease, margin 0.4s ease;
          padding: 0;
          margin: 0;
        }
        .search-expanding-wrapper.scrolled .search-expanding-input {
          color: #FFFDF8;
        }
        .search-expanding-wrapper.scrolled .search-expanding-input::placeholder {
          color: rgba(255,255,255,0.7);
        }
        .search-expanding-wrapper:hover .search-expanding-input,
        .search-expanding-input:focus {
          width: 140px;
          opacity: 1;
          padding: 0 0 0 8px;
          margin-left: 4px;
        }
        @media (max-width: 576px) {
          .search-expanding-wrapper:focus-within {
            position: absolute;
            right: 90px;
            background: #FFFDF8 !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1050;
          }
          .search-expanding-wrapper.scrolled:focus-within {
            background: #7B112C !important;
            border: 1px solid #C8A54B !important;
          }
          /* Hide brand text when typing on mobile */
          .sticky-navbar:has(.search-expanding-input:focus) .brand-hover-effect,
          .sticky-navbar:has(.search-expanding-wrapper:focus-within) .brand-hover-effect {
            opacity: 0;
            pointer-events: none;
          }
          .search-expanding-wrapper:hover .search-expanding-input,
          .search-expanding-input:focus,
          .search-expanding-input:focus-within {
            width: 160px;
          }
        }
        .search-expanding-btn {
          color: #7B112C;
          background: transparent;
          border: none;
          transition: color 0.3s ease;
        }
        .search-expanding-wrapper.scrolled .search-expanding-btn {
          color: #FFFDF8;
        }
        .search-expanding-wrapper:hover .search-expanding-btn {
          color: #C8A54B;
        }
      `}} />
    </header>
  );
};

export default Navbar;
