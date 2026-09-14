'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import CollectionCard from '../../components/CollectionCard/CollectionCard';
import ProductCard from '../../components/ProductCard/ProductCard';
import QuickViewModal from '../../components/QuickViewModal/QuickViewModal';
import { useProducts } from '../../context/ProductContext';
const Collections = () => {
  const { products, themeCollections, loading } = useProducts();
  const collectionsList = themeCollections || [];
  const searchParamsHook = useSearchParams();
  const sareesGridRef = useRef(null);

  const [activeCollection, setActiveCollection] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const handleSelectCollection = (colId) => {
    setActiveCollection(colId);
    setTimeout(() => {
      sareesGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  useEffect(() => {
    const idParam = searchParamsHook.get('id');
    const themeParam = searchParamsHook.get('theme');
    let target = 'all';

    if (idParam) target = idParam;
    else if (themeParam === 'wedding') target = 'bridal-collection';
    else if (themeParam === 'festive') target = 'festive-collection';

    setActiveCollection(target);

    if (idParam || themeParam) {
      setTimeout(() => {
        sareesGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [searchParamsHook]);

  const filteredProducts = useMemo(() => {
    const searchParam = searchParamsHook.get('search');
    let baseProducts = products || [];

    if (searchParam) {
      const q = searchParam.toLowerCase();
      baseProducts = baseProducts.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.fabric && p.fabric.toLowerCase().includes(q)) ||
        (p.occasion && p.occasion.toLowerCase().includes(q))
      );
    }

    if (activeCollection === 'all' || !activeCollection) return baseProducts;

    const colObj = collectionsList.find(
      (c) => c && (String(c.id) === String(activeCollection) || (c.collectionName && activeCollection && c.collectionName.toLowerCase() === String(activeCollection).toLowerCase()))
    );
    const targetName = colObj ? (colObj.collectionName || '').toLowerCase() : String(activeCollection || '').toLowerCase();

    return baseProducts.filter((p) => {
      if (!p) return false;
      // 1. Array or string theme collection match
      const colList = Array.isArray(p.collections) ? p.collections : (p.collection ? [p.collection] : []);
      const directMatch = colList.some(
        (c) => c && (c.toLowerCase().includes(targetName) || targetName.includes(c.toLowerCase()))
      );
      if (directMatch) return true;

      // 2. Standard heuristic fallback for default collections
      const colTag = (p.collection || '').toLowerCase();
      const catTag = (p.category || '').toLowerCase();
      const occTag = (p.occasion || '').toLowerCase();
      const pName = (p.name || '').toLowerCase();

      if (targetName.includes('bridal')) {
        return colTag.includes('bridal') || catTag.includes('kanchipuram') || catTag.includes('bridal') || occTag.includes('bridal') || pName.includes('bridal');
      }
      if (targetName.includes('temple')) {
        return colTag.includes('temple') || catTag.includes('gadwal') || catTag.includes('pochampally') || occTag.includes('temple') || pName.includes('temple');
      }
      if (targetName.includes('wedding')) {
        return colTag.includes('wedding') || catTag.includes('banarasi') || catTag.includes('uppada') || occTag.includes('wedding') || pName.includes('wedding');
      }
      if (targetName.includes('festive')) {
        return colTag.includes('festive') || catTag.includes('chanderi') || catTag.includes('soft silk') || occTag.includes('festive') || pName.includes('festive');
      }
      if (targetName.includes('daily') || targetName.includes('linen')) {
        return colTag.includes('daily') || colTag.includes('linen') || catTag.includes('cotton') || catTag.includes('linen') || occTag.includes('daily');
      }
      if (targetName.includes('celebrity')) {
        return colTag.includes('celebrity') || catTag.includes('organza') || p.isNew;
      }

      // 3. Dynamic word matching for custom created collections
      const words = targetName.split(/[\s-&]+/);
      return words.some(w => w.length > 2 && (catTag.includes(w) || pName.includes(w) || occTag.includes(w)));
    });
  }, [products, activeCollection, collectionsList]);

  const activeCollectionObj = collectionsList.find(c => c && (
    c.id === activeCollection || 
    (c.name && activeCollection && c.name.toLowerCase() === activeCollection.toLowerCase())
  ));

  return (
    <div className="collections-page py-4 py-md-5 bg-ivory">
      <div className="container py-3">
        
        {/* Collection Header Banner */}
        <div className="card border-0 rounded-4 p-4 mb-5 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #7B112C 0%, #580B1F 100%)', border: '1.5px solid #C8A54B' }}>
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <span className="badge bg-gold text-white font-montserrat px-3 py-1 rounded-pill mb-2" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>
                👑 COLLECTIONS (THEMES & OCCASIONS)
              </span>
              <h1 className="font-serif fw-bold text-gold mb-1" style={{ fontSize: '2.2rem' }}>
                Explore Curated Theme Collections
              </h1>
              <p className="text-light-gold font-poppins mb-0" style={{ fontSize: '0.9rem', color: '#F4E3B3' }}>
                Hand-curated groupings tailored for <strong>special occasions, auspicious rituals & lifestyle themes</strong> (Bridal Edit, Temple Collection, Festive Silks, Celebrity Style) spanning across various weave categories.
              </p>
            </div>
            <div className="text-md-end font-montserrat">
              <span className="badge bg-gold text-maroon font-montserrat px-3 py-2 rounded-pill shadow-sm fw-bold" style={{ fontSize: '0.82rem' }}>
                {collectionsList.length} Theme Curations
              </span>
            </div>
          </div>
        </div>

        {/* Collections Banner Grid */}
        <div className="row g-4 mb-5">
          {loading && collectionsList.length === 0 ? (
            [1, 2, 3].map(i => (
              <div key={i} className="col-md-6 col-lg-4">
                <div className="skeleton-card shadow-sm" style={{ height: '360px' }}>
                  <div className="skeleton skeleton-img h-100" />
                </div>
              </div>
            ))
          ) : (
            (collectionsList || []).map((col) => {
              const isActive = activeCollection === col.id || 
                               (col.collectionName && col.collectionName.toLowerCase() === String(activeCollection).toLowerCase()) ||
                               (col.id && String(col.id).toLowerCase() === String(activeCollection).toLowerCase());
              return (
                <div key={col.id} className="col-md-6 col-lg-4">
                  <div 
                    onClick={() => handleSelectCollection(col.id)}
                    className={`cursor-pointer rounded-4 transition-all ${isActive ? 'ring-gold shadow-lg' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <CollectionCard collection={col} onSelect={handleSelectCollection} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Collection Filter Tabs & Sarees Anchor */}
        <div ref={sareesGridRef} className="pt-3" style={{ scrollMarginTop: '100px' }}>
          
          <div className="d-flex flex-wrap justify-content-center gap-2 mb-4 border-bottom border-gold pb-4">
            <button
              onClick={() => handleSelectCollection('all')}
              className={`btn rounded-pill font-montserrat fw-semibold px-4 ${activeCollection === 'all' ? 'btn-maroon text-white' : 'btn-outline-gold'}`}
            >
              All Collections
            </button>
            {(collectionsList || []).map((col) => {
              const isActive = activeCollection === col.id || 
                               (col.collectionName && col.collectionName.toLowerCase() === String(activeCollection).toLowerCase()) ||
                               (col.id && String(col.id).toLowerCase() === String(activeCollection).toLowerCase());
              return (
                <button
                  key={col.id}
                  onClick={() => handleSelectCollection(col.id)}
                  className={`btn rounded-pill font-montserrat fw-semibold px-3 ${isActive ? 'btn-maroon text-white' : 'btn-outline-gold'}`}
                >
                  {col.collectionName}
                </button>
              );
            })}
          </div>

          {/* Active Collection Header */}
          <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom border-gold">
            <div>
              <span className="badge bg-gold text-white font-montserrat px-3 py-1 rounded-pill mb-1" style={{ fontSize: '0.72rem' }}>
                {activeCollection === 'all' ? 'STOREWIDE CURATION' : activeCollectionObj?.badge || 'CURATED COLLECTION'}
              </span>
              <h3 className="font-serif fw-bold text-maroon mb-0">
                {activeCollection === 'all' ? 'All Handloom Sarees' : activeCollectionObj?.collectionName || 'Curated Sarees'}
              </h3>
            </div>
            <span className="font-montserrat fw-semibold text-muted" style={{ fontSize: '0.88rem' }}>
              Showing {filteredProducts.length} Sarees
            </span>
          </div>

          {/* Collection Product Results Grid */}
          <div className="row g-4">
            {loading && filteredProducts.length === 0 ? (
              [1,2,3,4].map(i => (
                <div key={i} className="col-6 col-md-4 col-lg-3">
                  <div className="skeleton-card shadow-sm">
                    <div className="skeleton skeleton-img" />
                    <div className="skeleton skeleton-text medium" />
                    <div className="skeleton skeleton-text short" />
                    <div className="skeleton skeleton-btn" />
                  </div>
                </div>
              ))
            ) : filteredProducts.length === 0 ? (
              <div className="col-12 text-center py-5 bg-white rounded-4 border border-gold shadow-sm">
                <h4 className="font-serif text-maroon mb-2">No Sarees Available in this Collection</h4>
                <p className="text-muted font-poppins mb-3">Check back soon for fresh artisan handloom arrivals.</p>
                <button onClick={() => handleSelectCollection('all')} className="btn btn-gold rounded-pill px-4 font-montserrat fw-bold">
                  View All Sarees
                </button>
              </div>
            ) : (
              (filteredProducts || []).map((product) => (
                <div key={product.id} className="col-6 col-md-4 col-lg-3">
                  <ProductCard product={product} onQuickView={setQuickViewProduct} />
                </div>
              ))
            )}
          </div>

        </div>

      </div>

      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
        />
      )}
    </div>
  );
};

export default Collections;
