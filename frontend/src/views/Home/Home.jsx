import React, { useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { FiArrowRight, FiShield, FiTruck, FiAward } from 'react-icons/fi';
import { GiCrown, GiRibbonMedal } from 'react-icons/gi';
import { useProducts } from '../../context/ProductContext';

import Hero from '../../components/Hero/Hero';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import CollectionCard from '../../components/CollectionCard/CollectionCard';
import ProductCard from '../../components/ProductCard/ProductCard';
import Testimonials from '../../components/Testimonials/Testimonials';
import InstagramGallery from '../../components/InstagramGallery/InstagramGallery';
import Newsletter from '../../components/Newsletter/Newsletter';
import QuickViewModal from '../../components/QuickViewModal/QuickViewModal';



import 'swiper/css';
import 'swiper/css/navigation';

const whyChooseUs = [
  { icon: <FiAward size={32} className="text-gold" />, title: "100% Handwoven Silks", desc: "Crafted on traditional pit looms by heritage artisan families in Kanchipuram & Varanasi." },
  { icon: <FiAward size={32} className="text-gold" />, title: "Authentic Silk Mark", desc: "Every saree comes with official Silk Mark Organisation of India certification." },
  { icon: <GiCrown size={32} className="text-gold" />, title: "Pure Gold Zari Weave", desc: "Woven with pure tested 24K gold and silver zari threads for generations of luster." },
  { icon: <FiShield size={32} className="text-gold" />, title: "Secure Luxury Shopping", desc: "256-bit encrypted checkout with insured worldwide courier dispatch." },
  { icon: <FiTruck size={32} className="text-gold" />, title: "Fast Worldwide Delivery", desc: "Complimentary shipping across India and 3-5 day express international dispatch." },
  { icon: <GiRibbonMedal size={32} className="text-gold" />, title: "Trusted 40+ Yr Heritage", desc: "Celebrating four decades of weaving royal bridal memories for over 100,000 families." }
];

const Home = () => {
  const { products, categories, themeCollections, loading } = useProducts();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const displayCollections = themeCollections || [];
  const newArrivals = products.filter((p) => p.isNew).slice(0, 8);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 8);

  return (
    <div className="home-page">
      {/* 1. Hero Banner */}
      <Hero />

      {/* 2. Shop by Category (Dynamic Live Categories & Exact Item Counts) */}
      <section className="py-4 py-lg-5 bg-white position-relative">
        <div className="container py-3">
          <div className="section-title-wrap text-center mb-4">
            <span className="section-subtitle">Heritage Weaves</span>
            <h2 className="section-title">Shop by Saree Category</h2>
            <p className="text-muted font-poppins mb-2" style={{ fontSize: '0.9rem' }}>
              Explore authentic handloom weaving clusters with live saree catalog counts.
            </p>
            <div className="gold-divider">
              <span className="gold-diamond"></span>
            </div>
          </div>

          <div className="row g-3 g-md-4">
            {loading && categories.length === 0 ? (
              [1,2,3,4].map(i => (
                <div key={i} className="col-6 col-md-4 col-lg-3">
                  <div className="skeleton-card shadow-sm">
                    <div className="skeleton skeleton-img" />
                    <div className="skeleton skeleton-text medium" />
                    <div className="skeleton skeleton-text short" />
                  </div>
                </div>
              ))
            ) : (categories || []).map((category) => (
              <div key={category.id || category.name} className="col-6 col-md-4 col-lg-3">
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Collections & CTA */}
      <section className="py-4 py-lg-5" style={{ background: 'linear-gradient(180deg, #FFFDF8 0%, rgba(123, 17, 44, 0.04) 100%)' }}>
        <div className="container py-3">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between mb-4">
            <div>
              <span className="section-subtitle">Curated Showcases</span>
              <h2 className="section-title mb-0">Featured Royal Collections</h2>
            </div>
            <Link href="/collections" className="btn btn-gold rounded-pill px-4 py-2 mt-3 mt-md-0 font-montserrat fw-bold shadow-sm d-flex align-items-center gap-2">
              <span>View All Collections</span>
              <FiArrowRight />
            </Link>
          </div>

          <div className="row g-3 g-md-4">
            {(displayCollections || []).map((collection) => (
              <div key={collection.id} className="col-md-6 col-lg-4">
                <CollectionCard collection={collection} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. New Arrivals Horizontal Slider */}
      <section className="py-4 py-lg-5 bg-white position-relative">
        <div className="container py-3">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between mb-4">
            <div>
              <span className="section-subtitle">Fresh Off the Loom</span>
              <h2 className="section-title mb-0">New Arrivals</h2>
            </div>
            <Link href="/sarees?filter=new" className="btn btn-outline-gold rounded-pill mt-3 mt-md-0 font-montserrat px-3 py-1.5" style={{ fontSize: '0.85rem' }}>
              View All New Sarees <FiArrowRight className="ms-1" />
            </Link>
          </div>

          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={16}
            slidesPerView={1}
            breakpoints={{
              576: { slidesPerView: 2 },
              992: { slidesPerView: 3 },
              1200: { slidesPerView: 4 }
            }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            navigation={true}
            className="products-swiper py-2"
          >
            {(newArrivals || []).map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} onQuickView={setQuickViewProduct} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Offer Banner Spotlight */}
      <section className="py-4 py-lg-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7B112C 0%, #580B1F 100%)', color: '#FFFDF8' }}>
        <div className="container py-3">
          <div className="row align-items-center">
            <div className="col-lg-7 mb-4 mb-lg-0 text-white">
              <span className="badge bg-gold text-white font-montserrat px-3 py-1.5 rounded-pill mb-3" style={{ fontSize: '0.78rem' }}>
                BRIDAL SEASON SPECIAL
              </span>
              <h2 className="font-serif display-5 fw-bold text-white mb-3">
                Exclusive Royal Handloom Silk Heritage
              </h2>
              <p className="font-poppins text-white opacity-90 mb-4" style={{ fontSize: '0.98rem', maxWidth: '560px' }}>
                Enjoy exclusive discounts up to 40% OFF on certified 100% pure silk mark handwoven sarees directly from our artisan master weavers in Hindupur.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link href="/sarees" className="btn btn-gold btn-lg rounded-pill font-montserrat fw-bold px-4">
                  Shop Royal Offer Sarees
                </Link>
                <Link href="/collections" className="btn btn-outline-gold btn-lg rounded-pill font-montserrat px-4 text-white">
                  Explore Collections
                </Link>
              </div>
            </div>
            <div className="col-lg-5 text-center">
              <div 
                className="d-flex flex-column align-items-center justify-content-center rounded-4 shadow-lg p-5"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(200, 165, 75, 0.15) 0%, rgba(123, 17, 44, 0.3) 100%)',
                  border: '2px solid #C8A54B',
                  minHeight: '320px'
                }}
              >
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center mb-4 shadow"
                  style={{ width: '80px', height: '80px', background: '#C8A54B', color: '#7B112C' }}
                >
                  <GiCrown size={45} className="text-maroon" />
                </div>
                <h3 className="font-serif fw-bold text-gold mb-2" style={{ letterSpacing: '1px' }}>Sree Padmavathi</h3>
                <span className="font-montserrat fw-semibold text-uppercase text-white" style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>
                  Handloom Heritage
                </span>
                <div className="gold-divider mt-3">
                  <span className="gold-diamond"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-4 py-lg-5 bg-white">
        <div className="container py-3">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between mb-4">
            <div>
              <span className="section-subtitle">Patron Favorites</span>
              <h2 className="section-title mb-0">Best Selling Sarees</h2>
            </div>
            <Link href="/sarees?filter=bestseller" className="btn btn-outline-gold rounded-pill mt-3 mt-md-0 font-montserrat px-3 py-1.5" style={{ fontSize: '0.85rem' }}>
              View All Best Sellers <FiArrowRight className="ms-1" />
            </Link>
          </div>

          <div className="row g-3 g-md-4">
            {loading && bestSellers.length === 0 ? (
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
            ) : (bestSellers || []).map((product) => (
              <div key={product.id} className="col-6 col-md-4 col-lg-3">
                <ProductCard product={product} onQuickView={setQuickViewProduct} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Grid */}
      <section className="py-4 py-lg-5" style={{ background: '#FFFDF8', borderTop: '1px solid rgba(200, 165, 75, 0.2)' }}>
        <div className="container py-3">
          <div className="section-title-wrap text-center mb-5">
            <span className="section-subtitle">The Padmavathi Promise</span>
            <h2 className="section-title">Why Patrons Trust Our Handlooms</h2>
            <div className="gold-divider">
              <span className="gold-diamond"></span>
            </div>
          </div>

          <div className="row g-4">
            {(whyChooseUs || []).map((item, idx) => (
              <div key={idx} className="col-md-6 col-lg-4">
                <div className="p-4 rounded-4 bg-white border border-gold h-100 shadow-sm transition-all hover-lift">
                  <div className="mb-3">{item.icon}</div>
                  <h5 className="font-serif fw-bold text-maroon mb-2">{item.title}</h5>
                  <p className="text-muted font-poppins mb-0" style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <Testimonials />

      {/* Instagram Gallery */}
      <InstagramGallery />

      {/* Newsletter Signup (Hidden per request) */}
      {/* <Newsletter /> */}

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

export default Home;
