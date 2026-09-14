import React from 'react';
import Link from 'next/link';
import { FiPhone, FiMail, FiMapPin, FiInstagram, FiFacebook, FiYoutube, FiTwitter, FiLock } from 'react-icons/fi';
import { GiCrown } from 'react-icons/gi';

const Footer = () => {
  return (
    <footer className="footer-section text-white pt-5 position-relative" style={{ background: '#580B1F', borderTop: '3px solid #C8A54B' }}>
      <div className="container pb-4">
        <div className="row g-4 justify-content-between">
          
          {/* Column 1: Brand Info */}
          <div className="col-lg-4 col-md-6">
            <Link href="/" className="text-decoration-none d-flex align-items-center gap-2 mb-3">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px', background: '#C8A54B', color: '#580B1F' }}
              >
                <GiCrown size={22} />
              </div>
              <span className="font-serif fw-bold text-white fs-4">Sree Padmavathi Silks</span>
            </Link>
            <p className="text-white-70 font-poppins mb-3" style={{ fontSize: '0.88rem', lineHeight: '1.6', color: 'rgba(255, 253, 248, 0.8)' }}>
              Weaving pure South Indian silk heritage into timeless elegance. Certified by the Silk Mark Organisation of India, preserving authentic handloom artistry since 1984.
            </p>
            
            <div className="d-flex align-items-center gap-2 mb-3 bg-maroon-dark p-2 rounded-3 border border-gold" style={{ width: 'fit-content', background: 'rgba(0,0,0,0.2)' }}>
              <GiCrown className="text-gold" size={24} />
              <div className="d-flex flex-column">
                <span className="font-montserrat fw-bold text-gold" style={{ fontSize: '0.72rem' }}>100% HANDWOVEN SILK</span>
                <span className="font-poppins text-white" style={{ fontSize: '0.68rem' }}>Authentic Loom Craftsmanship</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="d-flex gap-2">
              <a href="#instagram" className="btn btn-outline-gold rounded-circle p-2 text-white" title="Instagram"><FiInstagram size={16} /></a>
              <a href="#facebook" className="btn btn-outline-gold rounded-circle p-2 text-white" title="Facebook"><FiFacebook size={16} /></a>
              <a href="#youtube" className="btn btn-outline-gold rounded-circle p-2 text-white" title="YouTube"><FiYoutube size={16} /></a>
              <a href="#twitter" className="btn btn-outline-gold rounded-circle p-2 text-white" title="Twitter"><FiTwitter size={16} /></a>
            </div>
          </div>

          {/* Column 2: Quick Collections */}
          <div className="col-lg-2 col-md-6">
            <h6 className="font-serif fw-bold text-gold mb-3 text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.95rem' }}>
              Collections
            </h6>
            <ul className="list-unstyled font-poppins d-flex flex-column gap-2" style={{ fontSize: '0.85rem' }}>
              <li><Link href="/sarees?category=Kanchipuram%20Silk" className="footer-link">Kanchipuram Silk</Link></li>
              <li><Link href="/sarees?category=Banarasi" className="footer-link">Banarasi Brocade</Link></li>
              <li><Link href="/sarees?category=Organza" className="footer-link">Organza Floral</Link></li>
              <li><Link href="/sarees?category=Chanderi" className="footer-link">Chanderi Tissue</Link></li>
              <li><Link href="/sarees?category=Mysore%20Silk" className="footer-link">Mysore Silk</Link></li>
              <li><Link href="/sarees?category=Bridal" className="footer-link">Bridal Silks</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Owner Portal */}
          <div className="col-lg-3 col-md-6">
            <h6 className="font-serif fw-bold text-gold mb-3 text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.95rem' }}>
              Customer Care & Portal
            </h6>
            <ul className="list-unstyled font-poppins d-flex flex-column gap-2" style={{ fontSize: '0.85rem' }}>
              <li><Link href="/contact" className="footer-link text-white">Store Locator & Hours</Link></li>
              <li><Link href="/about" className="footer-link text-white">Our Weaving Heritage</Link></li>

              <li><Link href="/care-guide" className="footer-link text-white">Saree Wash & Care Guide</Link></li>
              <li>
                <Link href="/admin" className="footer-link text-white d-flex align-items-center gap-1 mt-1">
                  <FiLock size={14} className="text-gold" />
                  <span className="text-white">Owner Login Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Store Location & Contact */}
          <div className="col-lg-3 col-md-6">
            <h6 className="font-serif fw-bold text-gold mb-3 text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.95rem' }}>
              Flagship Store
            </h6>
            <div className="d-flex flex-column gap-2.5 font-poppins text-white" style={{ fontSize: '0.82rem' }}>
              <div className="d-flex align-items-start gap-2">
                <FiMapPin className="text-gold flex-shrink-0 mt-1" />
                <span className="text-white">Subash nagar, Muddireddypalli, Hindupur, Sri Sathya Sai, Andhra Pradesh 515201</span>
              </div>
              <div className="d-flex align-items-center gap-2 mt-1">
                <FiPhone className="text-gold" />
                <span className="text-white">+91 9291303040</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <FiMail className="text-gold" />
                <span className="text-white">care@sreepadmavathisilks.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar - STRICTLY UPI PAYMENTS ONLY */}
        <div className="mt-5 pt-3 border-top border-gold-subtle d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 font-montserrat text-white" style={{ fontSize: '0.78rem' }}>
          <div className="text-white">
            © 2026 <strong>Sree Padmavathi Silks</strong>. All Rights Reserved. Designed with Royal Elegance.
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-gold fw-semibold">UPI PAYMENTS ONLY:</span>
            <span className="badge bg-gold text-dark font-montserrat">PhonePe</span>
            <span className="badge bg-gold text-dark font-montserrat">GPay</span>
            <span className="badge bg-gold text-dark font-montserrat">Paytm</span>
            <span className="badge bg-gold text-dark font-montserrat">BHIM UPI</span>
          </div>
        </div>

      </div>


    </footer>
  );
};

export default Footer;
