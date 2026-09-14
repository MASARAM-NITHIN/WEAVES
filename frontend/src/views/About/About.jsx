import React from 'react';
import { GiCrown, GiRibbonMedal } from 'react-icons/gi';
import { FiCheckCircle, FiAward, FiHeart, FiShield } from 'react-icons/fi';

const timelineEvents = [
  { year: "1984", title: "First Loom in Kanchipuram", desc: "Shri Padmavathi Chettiar establishes our inaugural handloom pit loom with 3 master weavers." },
  { year: "1996", title: "Flagship Store in Hindupur", desc: "Established our grand flagship showroom in Hindupur, Sri Sathya Sai district, introducing genuine pure 24K gold zari certified bridal silks." },
  { year: "2008", title: "Silk Mark Accreditation", desc: "Honored with national Silk Mark Organisation certification for 100% pure Mulberry yarn standard." },
  { year: "2018", title: "Artisan Empowerment Guild", desc: "Formed a cooperative cluster supporting over 500 handloom weaving artisan families across South India." },
  { year: "2026", title: "Global Luxury E-Boutique", desc: "Bringing Indian silk heritage to patrons in over 40 countries with modern digital boutique experience." }
];

const About = () => {
  return (
    <div className="about-page py-5 bg-ivory">
      <div className="container py-3">
        
        {/* Story Header */}
        <div className="row align-items-center mb-5 pb-4">
          <div className="col-lg-6 mb-4 mb-lg-0">
            <span className="font-montserrat text-gold text-uppercase fw-bold" style={{ fontSize: '0.85rem', letterSpacing: '2px' }}>
              Four Decades of Regal Heritage
            </span>
            <h1 className="font-serif fw-bold text-maroon mb-3 display-5">
              The Legacy of Sree Padmavathi Silks
            </h1>
            <p className="font-poppins text-dark mb-3" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
              For over forty years, <strong>Sree Padmavathi Silks</strong> has stood as a bastion of authentic Indian handloom luxury. What began as a humble weaving loom in Kanchipuram has flourished into one of South India's most cherished silk destinations.
            </p>
            <p className="font-poppins text-muted mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
              Every saree in our collection is an ode to the weaver's soul — crafted thread by thread using pure mulberry silk yarn, authentic silver-gold zari, and centuries-old jacquard tapestry techniques passed down through generations.
            </p>

            <div className="d-flex flex-wrap gap-4 border-top border-gold pt-3">
              <div>
                <h3 className="font-serif fw-bold text-maroon mb-0">500+</h3>
                <span className="font-montserrat text-muted" style={{ fontSize: '0.78rem' }}>Master Weavers</span>
              </div>
              <div>
                <h3 className="font-serif fw-bold text-maroon mb-0">100k+</h3>
                <span className="font-montserrat text-muted" style={{ fontSize: '0.78rem' }}>Royal Brides Draped</span>
              </div>
              <div>
                <h3 className="font-serif fw-bold text-maroon mb-0">100%</h3>
                <span className="font-montserrat text-muted" style={{ fontSize: '0.78rem' }}>Silk Mark Certified</span>
              </div>
            </div>
          </div>

          <div className="col-lg-6 text-center">
            <div 
              className="d-flex flex-column align-items-center justify-content-center rounded-4 shadow-2xl p-5 mx-auto"
              style={{ 
                background: 'linear-gradient(135deg, rgba(200, 165, 75, 0.15) 0%, rgba(123, 17, 44, 0.3) 100%)',
                border: '4px solid #C8A54B',
                maxWidth: '480px',
                minHeight: '400px'
              }}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center mb-4 shadow"
                style={{ width: '80px', height: '80px', background: '#C8A54B', color: '#7B112C' }}
              >
                <GiCrown size={45} className="text-maroon" />
              </div>
              <h3 className="font-serif fw-bold text-gold mb-2" style={{ letterSpacing: '1px' }}>Sree Padmavathi Silks</h3>
              <p className="font-poppins text-white-80 small px-3 text-center" style={{ fontSize: '0.85rem', color: '#FFF' }}>
                Handweaving royal bridal trousseaus and heritage Indian silks since 1984.
              </p>
              <div className="gold-divider mt-2">
                <span className="gold-diamond"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline of Heritage */}
        <section className="py-5 bg-white rounded-5 p-4 p-md-5 border-gold shadow-sm mb-5">
          <div className="section-title-wrap text-center mb-5">
            <span className="section-subtitle">Chronicles of Excellence</span>
            <h2 className="section-title">Our Brand Journey</h2>
            <div className="gold-divider">
              <span className="gold-diamond"></span>
            </div>
          </div>

          <div className="row g-4">
            {(timelineEvents || []).map((item, idx) => (
              <div key={idx} className="col-md-6 col-lg col-xl">
                <div className="card h-100 border-0 rounded-4 p-3 bg-ivory border-gold text-center">
                  <span className="badge bg-gold text-white font-montserrat px-3 py-1 rounded-pill mb-2 fs-6">
                    {item.year}
                  </span>
                  <h6 className="font-serif fw-bold text-maroon mb-2" style={{ fontSize: '1rem' }}>
                    {item.title}
                  </h6>
                  <p className="text-muted font-poppins mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission & Vision */}
        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div className="card h-100 border-0 rounded-4 p-4 p-md-5 bg-maroon text-white shadow-md">
              <GiCrown size={45} className="text-gold mb-3" />
              <h3 className="font-serif fw-bold text-white mb-3">Our Sacred Mission</h3>
              <p className="font-poppins text-white-80" style={{ fontSize: '0.95rem', lineHeight: '1.7', color: '#FFFDF8' }}>
                To preserve and champion India’s ancient handloom weaving clusters by offering authentic, silk mark certified sarees directly from master weavers to patrons worldwide with uncompromised quality and transparent pricing.
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card h-100 border-0 rounded-4 p-4 p-md-5 bg-white text-dark shadow-md border-gold">
              <GiRibbonMedal size={45} className="text-gold mb-3" />
              <h3 className="font-serif fw-bold text-maroon mb-3">Our Vision</h3>
              <p className="font-poppins text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
                To become the world's most trusted Indian silk e-boutique, celebrated for preserving cultural legacy, supporting weaver welfare, and draping every festive moment with timeless elegance.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
