'use client';
import React from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { FiStar, FiCheckCircle } from 'react-icons/fi';
import { FaQuoteLeft } from 'react-icons/fa';
import { useProducts } from '../../context/ProductContext';
import { getProductImageUrl } from '../../lib/imageHelper';

import 'swiper/css';
import 'swiper/css/pagination';

const Testimonials = () => {
  const { reviews, products, loading } = useProducts();

  const displayReviews = (reviews || []).slice(0, 12);

  if (!loading && displayReviews.length === 0) return null;

  return (
    <section className="testimonials-section py-5 position-relative" style={{ background: 'linear-gradient(180deg, #FFFDF8 0%, rgba(200, 165, 75, 0.08) 50%, #FFFDF8 100%)' }}>
      <div className="container py-4">
        
        {/* Section Header */}
        <div className="section-title-wrap text-center mb-5">
          <span className="section-subtitle">Real Patron Experiences</span>
          <h2 className="section-title">Verified Customer Reviews & Handloom Ratings</h2>
          <p className="text-muted font-poppins mt-2" style={{ fontSize: '0.9rem' }}>
            Read authentic reviews from patrons who bought our pure handwoven silk sarees.
          </p>
          <div className="gold-divider">
            <span className="gold-diamond"></span>
          </div>
        </div>

        {/* Swiper Slider */}
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={25}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop={displayReviews.length > 3}
          className="testimonials-swiper pb-5"
        >
          {(displayReviews || []).map((item) => {
            const prod = products.find(p => p.id === item.productId);
            
            return (
              <SwiperSlide key={item.id}>
                <div 
                  className="card h-100 border-0 rounded-4 p-4 luxury-card shadow-sm d-flex flex-column justify-content-between position-relative bg-white"
                  style={{ border: '1px solid rgba(200, 165, 75, 0.3)' }}
                >
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <FaQuoteLeft size={26} className="text-gold opacity-40" />
                      <span className="badge bg-success-subtle text-success font-montserrat px-2.5 py-1 rounded-pill" style={{ fontSize: '0.72rem' }}>
                        <FiCheckCircle size={10} className="me-1" /> Verified Buyer
                      </span>
                    </div>

                    {/* 5 Rating Stars */}
                    <div className="d-flex text-warning mb-2" style={{ gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar key={star} size={15} style={{ fill: star <= item.rating ? '#C8A54B' : 'none', color: '#C8A54B' }} />
                      ))}
                    </div>

                    <h6 className="font-serif fw-bold text-maroon mb-2" style={{ fontSize: '0.98rem' }}>
                      {item.title}
                    </h6>

                    <p className="font-poppins text-dark line-clamp-3 mb-3" style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
                      "{item.comment}"
                    </p>

                    {/* Customer Uploaded Photo */}
                    {item.photoUrl && (
                      <div className="mb-3">
                        <img 
                          src={item.photoUrl} 
                          alt="Customer review photo" 
                          className="rounded-3 border border-gold object-fit-cover w-100" 
                          style={{ height: '140px' }}
                         onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
                      </div>
                    )}
                  </div>

                  <div>
                    {/* Attached Saree Product Tag */}
                    {prod && (
                      <Link 
                        href={`/product/${prod.id}`} 
                        className="p-2 rounded-3 bg-light-gold d-flex align-items-center gap-2 mb-3 text-decoration-none text-maroon border border-gold hover-lift"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <img src={getProductImageUrl(prod.images && prod.images[0])} alt={prod.name} className="rounded-2" style={{ width: '36px', height: '42px', objectFit: 'cover' }}  onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
                        <div className="overflow-hidden">
                          <div className="font-serif fw-bold text-truncate">{prod.name}</div>
                          <div className="text-muted font-montserrat" style={{ fontSize: '0.7rem' }}>₹{(prod.price || 0).toLocaleString('en-IN')}</div>
                        </div>
                      </Link>
                    )}

                    <div className="d-flex align-items-center justify-content-between pt-2 border-top border-gold-subtle font-poppins" style={{ fontSize: '0.8rem' }}>
                      <span className="fw-bold text-maroon font-serif">{item.name}</span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{item.date}</span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>



      </div>
    </section>
  );
};

export default Testimonials;
