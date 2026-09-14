'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiX, FiArrowRight, FiTag } from 'react-icons/fi';
import { useProducts } from '../../context/ProductContext';
import { getProductImageUrl } from '../../lib/imageHelper';

const popularSearchChips = [
  "Kanchipuram Pure Zari",
  "Banarasi Brocade",
  "Bridal Silks",
  "Organza Floral",
  "Soft Silk",
  "Mysore Silk",
  "Gadwal Handloom"
];

const SearchBar = ({ isOpen, onClose }) => {
  const { products } = useProducts();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length > 1) {
      const q = query.toLowerCase();
      const filtered = products.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.fabric.toLowerCase().includes(q) ||
          item.occasion.toLowerCase().includes(q)
      );
      setResults(filtered.slice(0, 6));
    } else {
      setResults([]);
    }
  }, [query, products]);

  const handleSelectProduct = (id) => {
    onClose();
    router.push(`/product/${id}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/sarees?search=${encodeURIComponent(query)}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-start pt-5 px-3"
      style={{
        zIndex: 2000,
        backgroundColor: 'rgba(46, 46, 46, 0.75)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.3s ease'
      }}
    >
      <div 
        className="card w-100 shadow-lg border-0 rounded-4 overflow-hidden"
        style={{
          maxWidth: '720px',
          background: '#FFFDF8',
          border: '1.5px solid #C8A54B'
        }}
      >
        {/* Header Search Input Form */}
        <div className="card-header bg-white p-3 p-md-4 border-bottom border-gold d-flex align-items-center gap-3">
          <FiSearch size={24} className="text-maroon" />
          <form onSubmit={handleSearchSubmit} className="flex-grow-1">
            <input
              ref={inputRef}
              type="text"
              className="form-control form-control-lg border-0 shadow-none px-0"
              placeholder="Search by saree name, fabric, category, or occasion..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '1.1rem',
                backgroundColor: 'transparent',
                color: '#2E2E2E'
              }}
            />
          </form>
          {query && (
            <button 
              className="btn btn-link text-muted p-0"
              onClick={() => setQuery('')}
            >
              Clear
            </button>
          )}
          <button 
            className="btn btn-outline-maroon rounded-circle p-2 d-flex align-items-center justify-content-center"
            onClick={onClose}
            style={{ width: '38px', height: '38px' }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Search Body Content */}
        <div className="card-body p-3 p-md-4 max-h-70vh overflow-auto">
          {/* Results List */}
          {results.length > 0 ? (
            <div>
              <h6 className="font-montserrat text-uppercase text-gold fw-bold mb-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                Matching Sarees ({results.length})
              </h6>
              <div className="d-flex flex-column gap-2">
                {(results || []).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product.id)}
                    className="d-flex align-items-center gap-3 p-2 rounded-3 hover-bg-gold cursor-pointer transition-all border border-light"
                    style={{ cursor: 'pointer' }}
                  >
                    <img 
                      src={getProductImageUrl(product.images[0])} 
                      alt={product.name} 
                      className="rounded-3 object-fit-cover"
                      style={{ width: '55px', height: '65px' }}
                     onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
                    <div className="flex-grow-1">
                      <h6 className="font-serif mb-1 fw-bold text-dark text-truncate" style={{ fontSize: '0.95rem' }}>
                        {product.name}
                      </h6>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-maroon-subtle text-maroon font-montserrat" style={{ fontSize: '0.7rem' }}>
                          {product.category}
                        </span>
                        <span className="fw-bold text-maroon" style={{ fontSize: '0.9rem' }}>
                          ₹{(product.price || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <FiArrowRight size={18} className="text-gold me-2" />
                  </div>
                ))}
              </div>
            </div>
          ) : query.trim().length > 1 ? (
            <div className="text-center py-4">
              <p className="text-muted mb-2">No sarees found matching "{query}".</p>
              <span className="text-gold font-serif">Try searching "Kanchipuram", "Banarasi", or "Organza"</span>
            </div>
          ) : (
            <div>
              <h6 className="font-montserrat text-uppercase text-gold fw-bold mb-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                Popular Searches
              </h6>
              <div className="d-flex flex-wrap gap-2 mb-4">
                {(popularSearchChips || []).map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(chip)}
                    className="btn btn-sm btn-outline-gold rounded-pill px-3 py-1 d-flex align-items-center gap-1 font-poppins"
                    style={{ fontSize: '0.82rem' }}
                  >
                    <FiTag size={13} />
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
