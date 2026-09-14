import React from 'react';
import Link from 'next/link';
import { FiArrowUpRight, FiChevronRight } from 'react-icons/fi';
import { useProducts } from '../../context/ProductContext';
import { getCategoryImageUrl } from '../../lib/imageHelper';
import Image from 'next/image';

const CategoryCard = ({ category }) => {
  const { getCategorySareeCount } = useProducts();
  const exactCount = getCategorySareeCount(category.name);

  return (
    <Link 
      href={`/sarees?category=${encodeURIComponent(category.name)}`}
      className="text-decoration-none d-block group"
    >
      <div 
        className="card category-card border-0 rounded-4 overflow-hidden position-relative shadow-sm transition-all"
        style={{ 
          height: '350px',
          border: '1px solid rgba(200, 165, 75, 0.3)',
          background: '#1A040A'
        }}
      >
        {/* Saree Image with Zoom Effect */}
        <Image 
          src={getCategoryImageUrl(category.image)} 
          alt={category.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-fit-cover transition-all"
          style={{ transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
        />

        {/* Gradient Luxury Overlays */}
        <div 
          className="position-absolute top-0 start-0 w-100 h-100 p-3 d-flex flex-column justify-content-between pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 35%, rgba(18, 2, 7, 0.85) 100%)'
          }}
        >
          {/* Top Floating Header Bar */}
          <div className="d-flex justify-content-between align-items-center pointer-events-auto gap-2">
            <span 
              className="badge text-white font-montserrat px-3 py-1.5 rounded-pill shadow-sm text-truncate"
              style={{
                maxWidth: '70%',
                background: 'linear-gradient(135deg, #7B112C 0%, #9E193C 100%)',
                border: '1px solid #C8A54B',
                fontSize: '0.72rem',
                letterSpacing: '0.5px'
              }}
            >
              {category.tag || 'Handloom Silk'}
            </span>
            
            <div 
              className="category-arrow-btn rounded-circle text-maroon d-flex align-items-center justify-content-center shadow flex-shrink-0"
              style={{
                width: '38px',
                height: '38px',
                background: '#FFFDF8',
                border: '1.5px solid #C8A54B',
                transition: 'all 0.3s ease'
              }}
            >
              <FiArrowUpRight size={19} color="#7B112C" />
            </div>
          </div>
        </div>

        {/* Bottom Floating Glassmorphism Title Panel */}
        <div className="position-absolute bottom-0 start-0 w-100 p-3">
          <div 
            className="glass-category-panel p-3 rounded-4 transition-all"
            style={{
              background: 'rgba(26, 4, 10, 0.82)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(200, 165, 75, 0.4)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
          >
            {/* Top Subtitle Row */}
            <div className="d-flex align-items-center justify-content-between mb-1.5">
              <span 
                className="font-montserrat fw-semibold text-gold text-uppercase"
                style={{ fontSize: '0.72rem', letterSpacing: '1px', color: '#D4AF37' }}
              >
                {exactCount > 0 ? `${exactCount} Sarees` : 'Handcrafted Edition'}
              </span>
              <span 
                className="badge rounded-pill bg-dark text-gold font-montserrat px-2.5 py-1 border border-gold"
                style={{ fontSize: '0.62rem', letterSpacing: '0.5px' }}
              >
                Pure Silk Mark
              </span>
            </div>

            {/* Saree Category Title */}
            <h3 
              className="font-serif fw-bold text-white mb-2 text-truncate"
              style={{ fontSize: '1.35rem', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}
            >
              {category.name}
            </h3>

            {/* Single Clean Action Bar */}
            <div className="d-flex align-items-center justify-content-between pt-2 mt-1 border-top border-white border-opacity-10">
              <span className="text-gold font-montserrat fw-bold d-flex align-items-center gap-1.5" style={{ fontSize: '0.82rem' }}>
                <span>Explore Collection</span>
                <FiChevronRight size={16} className="explore-chevron text-gold" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .category-card {
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }
        .category-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px rgba(123, 17, 44, 0.3) !important;
        }
        .category-card:hover img {
          transform: scale(1.08);
        }
        .category-card:hover .category-arrow-btn {
          transform: rotate(45deg) scale(1.1);
          background: #7B112C !important;
        }
        .category-card:hover .category-arrow-btn svg {
          color: #FFFDF8 !important;
        }
        .category-card:hover .glass-category-panel {
          background: rgba(123, 17, 44, 0.92) !important;
          border-color: #D4AF37 !important;
        }
        .category-card:hover .explore-chevron {
          transform: translateX(5px);
        }
        .explore-chevron {
          transition: transform 0.3s ease;
        }
      `}</style>
    </Link>
  );
};

export default CategoryCard;
