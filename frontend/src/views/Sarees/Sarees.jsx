'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiFilter, FiGrid, FiList, FiX, FiSearch, FiSliders, FiRotateCcw } from 'react-icons/fi';
import { GiCrown } from 'react-icons/gi';
import ProductCard from '../../components/ProductCard/ProductCard';
import QuickViewModal from '../../components/QuickViewModal/QuickViewModal';
import { useProducts } from '../../context/ProductContext';

const Sarees = () => {
  const { products, categories, themeCollections, getCategorySareeCount, loading } = useProducts();
  const searchParams = useSearchParams();
  
  const categoryParam = searchParams ? searchParams.get('category') : null;
  const themeParam = searchParams ? searchParams.get('theme') : null;
  const priceParam = searchParams ? searchParams.get('priceRange') : null;
  const filterParam = searchParams ? searchParams.get('filter') : null;
  const searchParam = searchParams ? searchParams.get('search') : null;

  // Dynamically derive Categories List (Future-Proof: includes all owner-created categories + catalog categories)
  const categoriesList = useMemo(() => {
    const fromCtx = (categories || []).map(c => c.fabricName);
    const fromProds = (products || []).map(p => p.category).filter(Boolean);
    const combined = Array.from(new Set([...fromCtx, ...fromProds]));
    return combined.sort();
  }, [categories, products]);

  // Dynamically derive Theme Collections List (Future-Proof: includes all owner-created theme collections + product collections)
  const themeCollectionsList = useMemo(() => {
    const fromCtx = (themeCollections || []).map(c => c.collectionName);
    const fromProds = (products || []).flatMap(p => 
      Array.isArray(p.collections) ? p.collections : (p.collection ? [p.collection] : [])
    ).filter(Boolean);
    const combined = Array.from(new Set([...fromCtx, ...fromProds]));
    return combined.sort();
  }, [themeCollections, products]);

  // Dynamically derive Fabrics List from catalog
  const fabricsList = useMemo(() => {
    const list = (products || []).map(p => p.fabric).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [products]);

  // Dynamically derive Occasions List from catalog
  const occasionsList = useMemo(() => {
    const list = (products || []).map(p => p.occasion).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [products]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [selectedCategories, setSelectedCategories] = useState(categoryParam ? [categoryParam] : []);
  const [selectedCollections, setSelectedCollections] = useState(themeParam ? [themeParam] : []);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState(priceParam ? [priceParam] : []);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid-4'); // grid-4, grid-3, list
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    if (categoryParam) setSelectedCategories([categoryParam]);
    if (themeParam) setSelectedCollections([themeParam]);
    if (priceParam) setSelectedPriceRanges([priceParam]);
    if (searchParam) setSearchQuery(searchParam);
  }, [searchParams]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, selectedCollections, selectedPriceRanges, selectedFabrics, selectedOccasions, minRating]);

  // Toggle helper
  const toggleSelection = (item, state, setState) => {
    if (state.includes(item)) {
      setState(state.filter((i) => i !== item));
    } else {
      setState([...state, item]);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedCollections([]);
    setSelectedPriceRanges([]);
    setSelectedFabrics([]);
    setSelectedOccasions([]);
    setMinRating(0);
    setSortBy('featured');
  };

  // Standard Normalized Price Ranges Definition
  const PRICE_RANGES = useMemo(() => [
    { id: 'under-10k', label: 'Under ₹10,000', min: 0, max: 10000 },
    { id: '10k-20k', label: '₹10,000 - ₹20,000', min: 10000, max: 20000 },
    { id: '20k-35k', label: '₹20,000 - ₹35,000', min: 20000, max: 35000 },
    { id: 'above-35k', label: 'Above ₹35,000', min: 35000, max: 9999999 }
  ], []);

  // Dynamic Filter & Sort Engine (100% Accurate)
  const filteredProducts = useMemo(() => {
    return (products || []).filter((product) => {
      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const prodCols = Array.isArray(product.collections) ? product.collections.join(' ') : (product.collection || '');
        const match = 
          (product.name || '').toLowerCase().includes(q) ||
          (product.category || '').toLowerCase().includes(q) ||
          (product.fabric || '').toLowerCase().includes(q) ||
          (product.occasion || '').toLowerCase().includes(q) ||
          prodCols.toLowerCase().includes(q);
        if (!match) return false;
      }

      // New arrivals filter
      if (filterParam === 'new' && !product.isNew) return false;

      // Category filter (Matches exact or case-insensitive category)
      if (selectedCategories.length > 0) {
        const matchesCategory = selectedCategories.some(cat => 
          product.category && (product.category.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(product.category.toLowerCase()))
        );
        if (!matchesCategory) return false;
      }

      // Theme Collection filter (Matches arrays or string collections)
      if (selectedCollections.length > 0) {
        const prodCols = Array.isArray(product.collections) 
          ? product.collections 
          : (product.collection ? [product.collection] : []);

        const matchesCollection = selectedCollections.some(selCol => 
          prodCols.some(c => c && (c.toLowerCase().includes(selCol.toLowerCase()) || selCol.toLowerCase().includes(c.toLowerCase()))) ||
          (product.category && product.category.toLowerCase().includes(selCol.toLowerCase()))
        );
        if (!matchesCollection) return false;
      }

      // Price Range filter (Accurate Range Matching)
      if (selectedPriceRanges.length > 0) {
        const matchesPrice = selectedPriceRanges.some((rangeVal) => {
          const matchObj = PRICE_RANGES.find(r => r.id === rangeVal || r.label === rangeVal || rangeVal.includes(r.id));
          if (matchObj) {
            return product.price >= matchObj.min && product.price <= matchObj.max;
          }
          if (rangeVal.includes('-')) {
            const [minP, maxP] = rangeVal.split('-').map(Number);
            return product.price >= minP && product.price <= maxP;
          }
          return true;
        });
        if (!matchesPrice) return false;
      }

      // Fabric filter
      if (selectedFabrics.length > 0) {
        const matchesFabric = selectedFabrics.some(fab => 
          product.fabric && product.fabric.toLowerCase().includes(fab.toLowerCase())
        );
        if (!matchesFabric) return false;
      }

      // Occasion filter
      if (selectedOccasions.length > 0) {
        const matchesOcc = selectedOccasions.some(occ => 
          product.occasion && product.occasion.toLowerCase().includes(occ.toLowerCase())
        );
        if (!matchesOcc) return false;
      }

      // Rating filter
      if (minRating > 0 && (product.rating || 0) < minRating) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
      if (sortBy === 'discount') {
        const discA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) : 0;
        const discB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) : 0;
        return discB - discA;
      }
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      if (sortBy === 'bestseller') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      
      // Default 'featured': Featured items first, then higher rated
      const featDiff = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      if (featDiff !== 0) return featDiff;
      return (b.rating || 5) - (a.rating || 5);
    });
  }, [products, searchQuery, selectedCategories, selectedCollections, selectedPriceRanges, selectedFabrics, selectedOccasions, minRating, sortBy, filterParam, PRICE_RANGES]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="sarees-page py-4 bg-ivory">
      <div className="container py-3">
        
        {/* Category Header Banner */}
        <div className="card border-0 rounded-4 p-4 mb-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF8EC 100%)', border: '1.5px solid #C8A54B' }}>
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <span className="badge bg-gold text-white font-montserrat px-3 py-1 rounded-pill mb-2" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>
                🧵 DYNAMIC SAREE CATALOG FILTERS
              </span>
              <h1 className="font-serif fw-bold text-maroon mb-1" style={{ fontSize: '2rem' }}>
                Shop Sarees by Category & Theme Collections
              </h1>
              <p className="text-muted font-poppins mb-0" style={{ fontSize: '0.88rem' }}>
                Filter sarees by <strong>Fabric Categories</strong> (Kanchipuram, Banarasi, Gadwal, Soft Silk, Linen) or <strong>Theme Collections</strong> (Bridal, Temple, Festive, Wedding Silks).
              </p>
            </div>
            <div className="text-md-end font-montserrat">
              <span className="badge bg-maroon text-gold font-montserrat px-3 py-2 rounded-pill shadow-sm" style={{ fontSize: '0.82rem' }}>
                {filteredProducts.length} Luxurious Weaves Available
              </span>
            </div>
          </div>
        </div>

        <div className="row g-4">
          
          {/* Sidebar Filter Column */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="card border-0 rounded-4 p-4 shadow-sm" style={{ background: '#FFFDF8', border: '1.5px solid rgba(200, 165, 75, 0.3)' }}>
              
              <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom border-gold">
                <div className="d-flex align-items-center gap-2">
                  <FiSliders size={18} className="text-maroon" />
                  <h5 className="font-serif fw-bold mb-0 text-maroon">Dynamic Filters</h5>
                </div>
                <button 
                  onClick={resetFilters} 
                  className="btn btn-link text-gold p-0 font-montserrat fw-semibold d-flex align-items-center gap-1"
                  style={{ fontSize: '0.78rem' }}
                >
                  <FiRotateCcw size={12} /> Reset
                </button>
              </div>

              {/* Search filter input */}
              <div className="mb-4">
                <label className="font-montserrat fw-semibold text-uppercase text-gold mb-2" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>
                  Search Catalog
                </label>
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control form-control-sm border-gold rounded-pill pe-4"
                    placeholder="Search sarees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FiSearch className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted" size={14} />
                </div>
              </div>

              {/* Dynamic Fabric Categories Filter */}
              <div className="mb-4">
                <h6 className="font-montserrat fw-bold text-uppercase text-dark mb-2 d-flex align-items-center gap-1" style={{ fontSize: '0.78rem', letterSpacing: '0.5px' }}>
                  <span>🧵 Fabric Categories</span>
                </h6>
                <div className="d-flex flex-column gap-1.5 max-h-200 overflow-auto pe-1">
                  {(categoriesList || []).map((cat) => {
                    const catCount = products.filter(p => p.category && p.category.toLowerCase().includes(cat.toLowerCase())).length;
                    return (
                      <label key={cat} className="d-flex align-items-center justify-content-between cursor-pointer font-poppins" style={{ fontSize: '0.82rem' }}>
                        <div className="d-flex align-items-center gap-2">
                          <input 
                            type="checkbox"
                            className="form-check-input border-gold"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => toggleSelection(cat, selectedCategories, setSelectedCategories)}
                          />
                          <span>{cat}</span>
                        </div>
                        <span className="badge bg-light text-muted font-montserrat" style={{ fontSize: '0.68rem' }}>{catCount}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Theme Collections Filter */}
              <div className="mb-4">
                <h6 className="font-montserrat fw-bold text-uppercase text-dark mb-2 d-flex align-items-center gap-1" style={{ fontSize: '0.78rem', letterSpacing: '0.5px' }}>
                  <GiCrown className="text-gold" />
                  <span>👑 Theme Collections</span>
                </h6>
                <div className="d-flex flex-column gap-1.5 max-h-200 overflow-auto pe-1">
                  {(themeCollectionsList || []).map((colName) => {
                    const colCount = products.filter(p => {
                      const pCols = Array.isArray(p.collections) ? p.collections : (p.collection ? [p.collection] : []);
                      return pCols.some(c => c && c.toLowerCase().includes(colName.toLowerCase()));
                    }).length;
                    return (
                      <label key={colName} className="d-flex align-items-center justify-content-between cursor-pointer font-poppins" style={{ fontSize: '0.82rem' }}>
                        <div className="d-flex align-items-center gap-2">
                          <input 
                            type="checkbox"
                            className="form-check-input border-gold"
                            checked={selectedCollections.includes(colName)}
                            onChange={() => toggleSelection(colName, selectedCollections, setSelectedCollections)}
                          />
                          <span>{colName}</span>
                        </div>
                        <span className="badge bg-gold text-white font-montserrat" style={{ fontSize: '0.68rem' }}>{colCount}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-4">
                <h6 className="font-montserrat fw-bold text-uppercase text-dark mb-2" style={{ fontSize: '0.78rem', letterSpacing: '0.5px' }}>
                  Price Range
                </h6>
                <div className="d-flex flex-column gap-1.5">
                  {(PRICE_RANGES || []).map((pr) => (
                    <label key={pr.id} className="d-flex align-items-center gap-2 cursor-pointer font-poppins" style={{ fontSize: '0.82rem' }}>
                      <input 
                        type="checkbox"
                        className="form-check-input border-gold text-maroon"
                        checked={selectedPriceRanges.includes(pr.id) || selectedPriceRanges.includes(pr.label)}
                        onChange={() => toggleSelection(pr.id, selectedPriceRanges, setSelectedPriceRanges)}
                      />
                      <span>{pr.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dynamic Fabric Filter */}
              {fabricsList.length > 0 && (
                <div className="mb-4">
                  <h6 className="font-montserrat fw-bold text-uppercase text-dark mb-2" style={{ fontSize: '0.78rem', letterSpacing: '0.5px' }}>
                    Fabric Material
                  </h6>
                  <div className="d-flex flex-column gap-1.5 max-h-150 overflow-auto pe-1">
                    {(fabricsList || []).map((fab) => (
                      <label key={fab} className="d-flex align-items-center gap-2 cursor-pointer font-poppins" style={{ fontSize: '0.82rem' }}>
                        <input 
                          type="checkbox"
                          className="form-check-input border-gold"
                          checked={selectedFabrics.includes(fab)}
                          onChange={() => toggleSelection(fab, selectedFabrics, setSelectedFabrics)}
                        />
                        <span>{fab}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Occasion Filter */}
              {occasionsList.length > 0 && (
                <div className="mb-4">
                  <h6 className="font-montserrat fw-bold text-uppercase text-dark mb-2" style={{ fontSize: '0.78rem', letterSpacing: '0.5px' }}>
                    Occasion / Event
                  </h6>
                  <div className="d-flex flex-column gap-1.5 max-h-150 overflow-auto pe-1">
                    {(occasionsList || []).map((occ) => (
                      <label key={occ} className="d-flex align-items-center gap-2 cursor-pointer font-poppins" style={{ fontSize: '0.82rem' }}>
                        <input 
                          type="checkbox"
                          className="form-check-input border-gold"
                          checked={selectedOccasions.includes(occ)}
                          onChange={() => toggleSelection(occ, selectedOccasions, setSelectedOccasions)}
                        />
                        <span>{occ}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Catalog Products Area */}
          <div className="col-lg-9">
            
            {/* Top Toolbar */}
            <div className="card border-0 rounded-4 p-3 mb-4 shadow-sm d-flex flex-row align-items-center justify-content-between bg-white border-gold">
              <div className="d-flex align-items-center gap-3">
                <button 
                  onClick={() => setMobileFilterOpen(true)}
                  className="btn btn-outline-maroon rounded-pill d-lg-none font-montserrat btn-sm fw-bold"
                >
                  <FiFilter className="me-1" /> Filters ({selectedCategories.length + selectedCollections.length + selectedPriceRanges.length})
                </button>
                <span className="text-muted font-poppins d-none d-sm-inline" style={{ fontSize: '0.85rem' }}>
                  Showing <strong className="text-maroon">{filteredProducts.length}</strong> sarees
                </span>
              </div>

              <div className="d-flex align-items-center gap-3">
                {/* View Mode Switcher */}
                <div className="btn-group btn-group-sm d-none d-md-flex">
                  <button 
                    onClick={() => setViewMode('grid-4')} 
                    className={`btn ${viewMode === 'grid-4' ? 'btn-maroon' : 'btn-outline-gold'}`}
                    title="4 Column Grid"
                  >
                    <FiGrid size={15} />
                  </button>
                  <button 
                    onClick={() => setViewMode('grid-3')} 
                    className={`btn ${viewMode === 'grid-3' ? 'btn-maroon' : 'btn-outline-gold'}`}
                    title="3 Column Grid"
                  >
                    <FiGrid size={18} />
                  </button>
                </div>

                {/* Sort By Select */}
                <div className="d-flex align-items-center gap-2">
                  <label className="font-montserrat fw-semibold text-muted d-none d-sm-inline" style={{ fontSize: '0.78rem' }}>Sort By:</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="form-select form-select-sm border-gold rounded-pill font-montserrat fw-semibold"
                    style={{ width: '160px', fontSize: '0.8rem' }}
                  >
                    <option value="featured">Featured Curations</option>
                    <option value="newest">New Arrivals</option>
                    <option value="bestseller">Best Sellers</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="discount">Biggest Discount</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filter Chips */}
            {(selectedCategories.length > 0 || selectedCollections.length > 0 || selectedPriceRanges.length > 0 || selectedFabrics.length > 0 || selectedOccasions.length > 0 || searchQuery) && (
              <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
                <span className="font-montserrat fw-semibold text-muted" style={{ fontSize: '0.78rem' }}>Active Filters:</span>
                
                {searchQuery && (
                  <span className="badge bg-gold text-white font-montserrat py-1.5 px-3 rounded-pill d-flex align-items-center gap-1.5">
                    "{searchQuery}" <FiX className="cursor-pointer" onClick={() => setSearchQuery('')} />
                  </span>
                )}

                {(selectedCategories || []).map(cat => (
                  <span key={cat} className="badge bg-maroon text-gold font-montserrat py-1.5 px-3 rounded-pill d-flex align-items-center gap-1.5">
                    Category: {cat} <FiX className="cursor-pointer" onClick={() => toggleSelection(cat, selectedCategories, setSelectedCategories)} />
                  </span>
                ))}

                {(selectedCollections || []).map(col => (
                  <span key={col} className="badge bg-gold text-white font-montserrat py-1.5 px-3 rounded-pill d-flex align-items-center gap-1.5">
                    Theme: {col} <FiX className="cursor-pointer" onClick={() => toggleSelection(col, selectedCollections, setSelectedCollections)} />
                  </span>
                ))}

                {(selectedPriceRanges || []).map(pr => (
                  <span key={pr} className="badge bg-dark text-white font-montserrat py-1.5 px-3 rounded-pill d-flex align-items-center gap-1.5">
                    Price: {pr} <FiX className="cursor-pointer" onClick={() => toggleSelection(pr, selectedPriceRanges, setSelectedPriceRanges)} />
                  </span>
                ))}

                <button 
                  onClick={resetFilters} 
                  className="btn btn-sm btn-link text-maroon font-montserrat fw-bold text-decoration-none p-0 ms-2"
                  style={{ fontSize: '0.78rem' }}
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Products Grid */}
            {loading && products.length === 0 ? (
              <div className="row g-4">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="col-6 col-md-4 col-lg-3">
                    <div className="skeleton-card shadow-sm bg-white rounded-4 overflow-hidden">
                      <div className="skeleton skeleton-img" />
                      <div className="skeleton skeleton-text medium" />
                      <div className="skeleton skeleton-text short" />
                      <div className="skeleton skeleton-btn" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="card border-0 rounded-4 p-5 text-center bg-white border border-gold shadow-sm">
                <div className="py-4">
                  <h4 className="font-serif fw-bold text-maroon mb-2">No Sarees Found</h4>
                  <p className="text-muted font-poppins mb-4" style={{ fontSize: '0.9rem' }}>
                    No sarees match your selected filter criteria. Try clearing filters or searching for something else.
                  </p>
                  <button onClick={resetFilters} className="btn btn-maroon rounded-pill px-4 font-montserrat fw-bold">
                    <FiRotateCcw className="me-1.5" /> Reset All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="row g-4">
                {(paginatedProducts || []).map((product) => (
                  <div 
                    key={product.id} 
                    className={
                      viewMode === 'grid-3' 
                        ? 'col-md-6 col-lg-4' 
                        : 'col-6 col-md-4 col-lg-3'
                    }
                  >
                    <ProductCard 
                      product={product} 
                      onQuickView={setQuickViewProduct} 
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="btn btn-outline-maroon btn-sm rounded-pill px-3 font-montserrat fw-bold"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`btn btn-sm rounded-circle font-montserrat fw-bold ${currentPage === page ? 'btn-maroon text-white' : 'btn-outline-gold'}`}
                    style={{ width: '34px', height: '34px' }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="btn btn-outline-maroon btn-sm rounded-pill px-3 font-montserrat fw-bold"
                >
                  Next →
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Mobile Filter Drawer Overlay */}
      {mobileFilterOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-end"
          style={{
            zIndex: 2070,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            animation: 'fadeIn 0.25s ease'
          }}
        >
          <div 
            className="bg-white h-100 w-100 d-flex flex-column shadow-2xl"
            style={{
              maxWidth: '420px',
              background: '#FFFDF8',
              borderLeft: '2px solid #C8A54B',
              animation: 'slideLeft 0.3s ease-out'
            }}
          >
            {/* Drawer Header */}
            <div className="p-3 border-bottom border-gold d-flex align-items-center justify-content-between text-white" style={{ background: 'linear-gradient(135deg, #7B112C 0%, #580B1F 100%)' }}>
              <div className="d-flex align-items-center gap-2">
                <FiSliders size={20} className="text-gold" />
                <h5 className="font-serif mb-0 fw-bold" style={{ color: '#FFFDF8' }}>
                  Filter Sarees Catalog
                </h5>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button 
                  onClick={resetFilters}
                  className="btn btn-sm btn-outline-light rounded-pill px-2.5 py-0.5 font-montserrat"
                  style={{ fontSize: '0.72rem' }}
                >
                  Reset
                </button>
                <button 
                  className="btn btn-link text-white p-0"
                  onClick={() => setMobileFilterOpen(false)}
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Drawer Scrollable Filter Body */}
            <div className="p-3 overflow-y-auto flex-grow-1">
              
              {/* Categories Filter */}
              <div className="mb-4">
                <h6 className="font-serif fw-bold text-maroon mb-2 d-flex align-items-center justify-content-between">
                  <span>Silk Categories</span>
                  <span className="badge bg-gold text-white font-montserrat" style={{ fontSize: '0.65rem' }}>{categoriesList.length}</span>
                </h6>
                <div className="d-flex flex-column gap-2">
                  {(categoriesList || []).map(cat => (
                    <label key={cat} className="d-flex align-items-center justify-content-between cursor-pointer p-2 rounded hover-bg-light border border-light">
                      <div className="d-flex align-items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedCategories.includes(cat)} 
                          onChange={() => toggleSelection(cat, selectedCategories, setSelectedCategories)}
                          className="form-check-input text-maroon"
                        />
                        <span className="font-montserrat text-dark" style={{ fontSize: '0.85rem' }}>{cat}</span>
                      </div>
                      <span className="badge bg-light text-muted font-montserrat" style={{ fontSize: '0.7rem' }}>
                        {getCategorySareeCount(cat)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Theme Collections Filter */}
              <div className="mb-4">
                <h6 className="font-serif fw-bold text-maroon mb-2">Theme Collections</h6>
                <div className="d-flex flex-wrap gap-1.5">
                  {(themeCollectionsList || []).map(theme => (
                    <button
                      key={theme}
                      onClick={() => toggleSelection(theme, selectedCollections, setSelectedCollections)}
                      className={`btn btn-sm rounded-pill font-montserrat transition-all ${
                        selectedCollections.includes(theme)
                          ? 'btn-maroon text-white shadow-sm'
                          : 'btn-outline-gold text-dark'
                      }`}
                      style={{ fontSize: '0.78rem', padding: '0.3rem 0.8rem' }}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Ranges Filter */}
              <div className="mb-4">
                <h6 className="font-serif fw-bold text-maroon mb-2">Price Ranges</h6>
                <div className="d-flex flex-column gap-2">
                  {(PRICE_RANGES || []).map(price => (
                    <label key={price.id} className="d-flex align-items-center gap-2 cursor-pointer p-2 rounded hover-bg-light border border-light">
                      <input 
                        type="checkbox" 
                        checked={selectedPriceRanges.includes(price.id) || selectedPriceRanges.includes(price.label)} 
                        onChange={() => toggleSelection(price.id, selectedPriceRanges, setSelectedPriceRanges)}
                        className="form-check-input text-maroon"
                      />
                      <span className="font-montserrat text-dark" style={{ fontSize: '0.85rem' }}>{price.label}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Drawer Bottom Sticky Action Bar */}
            <div className="p-3 bg-light border-top border-gold d-flex gap-2">
              <button 
                onClick={resetFilters}
                className="btn btn-outline-secondary rounded-pill font-montserrat fw-semibold flex-grow-1"
                style={{ fontSize: '0.85rem' }}
              >
                Clear All
              </button>
              <button 
                onClick={() => setMobileFilterOpen(false)}
                className="btn btn-maroon rounded-pill font-montserrat fw-bold flex-grow-2"
                style={{ fontSize: '0.88rem' }}
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
        />
      )}

    </div>
  );
};

export default Sarees;
