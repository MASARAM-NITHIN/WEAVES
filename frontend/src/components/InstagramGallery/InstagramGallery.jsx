import React from 'react';
import { FiInstagram, FiHeart } from 'react-icons/fi';

const instagramPosts = [
  { id: 1, gradient: "linear-gradient(135deg, #7B112C 0%, #C8A54B 100%)", likes: "2.4k", handle: "@sreepadmavathisilks", label: "Bridal" },
  { id: 2, gradient: "linear-gradient(135deg, #093f30 0%, #C8A54B 100%)", likes: "4.1k", handle: "@sreepadmavathisilks", label: "Banarasi" },
  { id: 3, gradient: "linear-gradient(135deg, #580B1F 0%, #9E173B 100%)", likes: "1.9k", handle: "@sreepadmavathisilks", label: "Temple" },
  { id: 4, gradient: "linear-gradient(135deg, #7c6224 0%, #F4E7C5 100%)", likes: "3.8k", handle: "@sreepadmavathisilks", label: "Festive" },
  { id: 5, gradient: "linear-gradient(135deg, #2A0510 0%, #C8A54B 100%)", likes: "5.2k", handle: "@sreepadmavathisilks", label: "Silk" },
  { id: 6, gradient: "linear-gradient(135deg, #580B1F 0%, #7B112C 50%, #C8A54B 100%)", likes: "2.8k", handle: "@sreepadmavathisilks", label: "Zari" }
];

const InstagramGallery = () => {
  return (
    <section className="instagram-section py-5 bg-white position-relative">
      <div className="container py-4">
        
        <div className="section-title-wrap text-center mb-5">
          <div className="d-inline-flex align-items-center gap-2 text-maroon mb-2">
            <FiInstagram size={22} className="text-gold" />
            <span className="font-montserrat fw-bold text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '2px' }}>
              #SreePadmavathiSilks
            </span>
          </div>
          <h2 className="section-title">Follow Us on Instagram</h2>
          <p className="text-muted font-poppins" style={{ fontSize: '0.95rem' }}>
            Tag @sreepadmavathisilks on Instagram to be featured on our royal gallery grid.
          </p>
          <div className="gold-divider">
            <span className="gold-diamond"></span>
          </div>
        </div>

        {/* Masonry Image Grid */}
        <div className="row g-3">
          {(instagramPosts || []).map((post) => (
            <div key={post.id} className="col-6 col-md-4 col-lg-2">
              <div className="card insta-card border-0 rounded-4 overflow-hidden position-relative shadow-sm" style={{ height: '240px' }}>
                <div 
                  className="w-100 h-100 d-flex align-items-center justify-content-center transition-all"
                  style={{ background: post.gradient, transition: 'transform 0.5s ease' }}
                >
                  <span className="font-serif fw-bold text-white" style={{ fontSize: '1.1rem', opacity: 0.6 }}>{post.label}</span>
                </div>
                
                {/* Hover Instagram Overlay */}
                <div 
                  className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white opacity-0 hover-opacity-100 transition-all p-3"
                  style={{
                    background: 'rgba(123, 17, 44, 0.85)',
                    backdropFilter: 'blur(3px)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FiInstagram size={30} className="text-gold mb-2" />
                  <span className="font-montserrat text-gold-light mt-1" style={{ fontSize: '0.72rem' }}>
                    {post.handle}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        .insta-card:hover img {
          transform: scale(1.1);
        }
        .insta-card:hover .hover-opacity-100 {
          opacity: 1 !important;
        }
      `}</style>
    </section>
  );
};

export default InstagramGallery;
