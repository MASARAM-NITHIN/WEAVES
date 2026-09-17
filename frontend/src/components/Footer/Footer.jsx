'use client';

import React from 'react';
import Link from 'next/link';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiPhone, FiMail, FiMapPin, FiLock } from 'react-icons/fi';
import { GiCrown } from 'react-icons/gi';
import { useProducts } from '../../context/ProductContext';

const Footer = () => {
  const { categories } = useProducts();
  const displayCategories = categories && categories.length > 0 ? categories.slice(0, 6) : [];

  return (
    <footer style={{ background: 'linear-gradient(to right, #2A0510, #4A091A)', borderTop: '4px solid #C8A54B' }} className="pt-5 pb-3">
      <div className="container py-4">
        <div className="row g-4">
          <div className="col-lg-4 pe-lg-5">
            <Link href="/" className="text-decoration-none d-flex align-items-center gap-2 mb-3">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center bg-gold shadow-sm"
                style={{ width: '45px', height: '45px', flexShrink: 0 }}
              >
                <GiCrown size={26} className="text-maroon" />
              </div>
              <div>
                <h3 className="m-0 font-serif fw-bold text-gold" style={{ fontSize: '1.2rem', letterSpacing: '0.5px' }}>
                  Sree Padmavathi
                </h3>
                <span className="font-montserrat text-white opacity-75" style={{ fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  Handlooms
                </span>
              </div>
            </Link>
            <p className="font-poppins text-white opacity-75 mb-4" style={{ fontSize: '0.9rem', lineHeight: '1.7' }}>
              Since 1982, preserving the sacred art of handloom weaving. Directly from our artisan master weavers in Hindupur to your wardrobe.
            </p>
            <div className="d-flex gap-2">
              <a href="#instagram" className="btn btn-outline-gold rounded-circle p-2 text-white" title="Instagram"><FiInstagram size={16} /></a>
              <a href="#facebook" className="btn btn-outline-gold rounded-circle p-2 text-white" title="Facebook"><FiFacebook size={16} /></a>
              <a href="#youtube" className="btn btn-outline-gold rounded-circle p-2 text-white" title="YouTube"><FiYoutube size={16} /></a>
              <a href="#twitter" className="btn btn-outline-gold rounded-circle p-2 text-white" title="Twitter"><FiTwitter size={16} /></a>
            </div>
          </div>

          <div className="col-sm-6 col-lg-2">
            <h5 className="font-serif fw-bold text-gold mb-4" style={{ letterSpacing: '1px' }}>Our Weaves</h5>
            <ul className="list-unstyled font-poppins d-flex flex-column gap-2" style={{ fontSize: '0.9rem' }}>
              {displayCategories.map(cat => (
                <li key={cat.id || cat.name}>
                  <Link href={`/sarees?category=${encodeURIComponent(cat.name)}`} className="footer-link text-white">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-sm-6 col-lg-3">
            <h5 className="font-serif fw-bold text-gold mb-4" style={{ letterSpacing: '1px' }}>Customer Care</h5>
            <ul className="list-unstyled font-poppins d-flex flex-column gap-2" style={{ fontSize: '0.9rem' }}>
              <li><Link href="/contact" className="footer-link text-white">Store Locator & Hours</Link></li>
              <li><Link href="/about" className="footer-link text-white">Our Weaving Heritage</Link></li>
              <li><Link href="/care-guide" className="footer-link text-white">Saree Wash & Care Guide</Link></li>
              <li className="mt-2 pt-2 border-top border-gold-subtle" style={{ width: 'fit-content' }}>
                <Link href="/admin" className="footer-link text-white d-flex align-items-center gap-1 mt-1">
                  <FiLock size={14} className="text-gold" />
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Owner Login</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-3">
            <h5 className="font-serif fw-bold text-gold mb-4" style={{ letterSpacing: '1px' }}>Hindupur Store</h5>
            <ul className="list-unstyled font-poppins d-flex flex-column gap-3 text-white opacity-75" style={{ fontSize: '0.9rem' }}>
              <li className="d-flex gap-3">
                <FiMapPin size={18} className="text-gold mt-1 flex-shrink-0" />
                <span>
                  Sree Padmavathi Silks<br/>
                  Main Bazaar Road<br/>
                  Hindupur, Andhra Pradesh 515201
                </span>
              </li>
              <li className="d-flex align-items-center gap-3">
                <FiPhone size={18} className="text-gold flex-shrink-0" />
                <span>+91 92913 03040</span>
              </li>
              <li className="d-flex align-items-center gap-3">
                <FiMail size={18} className="text-gold flex-shrink-0" />
                <span>contact@sreepadmavathisilks.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-top border-gold-subtle mt-5 pt-4 text-center">
          <p className="font-poppins text-white opacity-50 mb-0" style={{ fontSize: '0.8rem' }}>
            &copy; {new Date().getFullYear()} Sree Padmavathi Handlooms. All Rights Reserved. <br/>
            Certified 100% Authentic Handloom Silk Mark Association.
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .footer-link {
          text-decoration: none;
          opacity: 0.75;
          transition: all 0.2s ease;
          position: relative;
          display: inline-block;
        }
        .footer-link:hover {
          opacity: 1;
          color: #C8A54B !important;
          transform: translateX(4px);
        }
        .border-gold-subtle {
          border-color: rgba(200, 165, 75, 0.2) !important;
        }
      `}} />
    </footer>
  );
};

export default Footer;
