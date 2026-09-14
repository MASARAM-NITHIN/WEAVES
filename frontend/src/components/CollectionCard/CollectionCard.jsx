import React from 'react';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { getCategoryImageUrl } from '../../lib/imageHelper';
import Image from 'next/image';

const CollectionCard = ({ collection, onSelect }) => {
  const handleClick = (e) => {
    if (onSelect) {
      e.preventDefault();
      onSelect(collection.id);
    }
  };

  return (
    <div className="card collection-card border-0 rounded-4 overflow-hidden position-relative shadow-md" style={{ height: '360px' }}>
      <Image 
        src={getCategoryImageUrl(collection.imageUrl)} 
        alt={collection.collectionName} 
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
        className="object-fit-cover transition-all"
        style={{ transition: 'transform 0.7s ease' }}
      />
      <div 
        className="position-absolute top-0 start-0 w-100 h-100 p-4 d-flex flex-column justify-content-end"
        style={{
          background: 'linear-gradient(0deg, rgba(88, 11, 31, 0.9) 0%, rgba(123, 17, 44, 0.3) 60%, rgba(0,0,0,0) 100%)'
        }}
      >
        <span className="badge bg-gold text-white font-montserrat px-3 py-1 rounded-pill mb-2 align-self-start shadow" style={{ fontSize: '0.72rem' }}>
          {collection.badge}
        </span>
        <h3 className="font-serif fw-bold text-white mb-1" style={{ fontSize: '1.6rem' }}>
          {collection.collectionName}
        </h3>
        <p className="text-white-50 font-poppins mb-3 line-clamp-2" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
          {collection.description}
        </p>

        <div>
          {onSelect ? (
            <button 
              type="button"
              onClick={handleClick} 
              className="btn btn-outline-gold btn-sm rounded-pill font-montserrat fw-semibold px-3 py-2 text-white shadow-sm"
            >
              <span>View Collection</span>
              <FiArrowRight size={14} className="ms-1" />
            </button>
          ) : (
            <Link 
              href={`/collections?id=${collection.id}`} 
              className="btn btn-outline-gold btn-sm rounded-pill font-montserrat fw-semibold px-3 py-2 text-white shadow-sm"
            >
              <span>View Collection</span>
              <FiArrowRight size={14} className="ms-1" />
            </Link>
          )}
        </div>
      </div>

      <style>{`
        .collection-card:hover img {
          transform: scale(1.08);
        }
      `}</style>
    </div>
  );
};

export default CollectionCard;
