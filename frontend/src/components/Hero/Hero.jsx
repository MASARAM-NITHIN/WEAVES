'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import { FiArrowRight, FiStar, FiShield } from 'react-icons/fi';
import { useProducts } from '../../context/ProductContext';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const fallbackSlides = [
  {
    id: 'f1',
    title: "Celebrate Every Occasion with Timeless Silks",
    subtitle: "Authentic handwoven sarees crafted for generations by South India's master weavers.",
    gradient: "linear-gradient(135deg, #580B1F 0%, #7B112C 60%, #2A0510 100%)",
    badge: "Royal Handloom Heritage",
    ctaPrimary: "Shop Latest Collection",
    ctaPrimaryLink: "/sarees",
    ctaSecondary: "Explore New Arrivals",
    ctaSecondaryLink: "/sarees?filter=new"
  }
];

const gradients = [
  "linear-gradient(135deg, #580B1F 0%, #7B112C 60%, #2A0510 100%)",
  "linear-gradient(135deg, #093f30 0%, #0F6A50 60%, #041f17 100%)",
  "linear-gradient(135deg, #7c6224 0%, #9E7D29 60%, #3e310d 100%)",
  "linear-gradient(135deg, #4A154B 0%, #6B1D6D 60%, #2E0B2F 100%)",
  "linear-gradient(135deg, #1C2B4D 0%, #2A4073 60%, #0E1629 100%)"
];

const Hero = () => {
  const { categories, themeCollections, loading } = useProducts();

  const heroSlides = useMemo(() => {
    if (loading) return fallbackSlides;

    const dynamicSlides = [];
    let slideCounter = 0;

    if (themeCollections && themeCollections.length > 0) {
      themeCollections.slice(0, 2).forEach((col, idx) => {
        dynamicSlides.push({
          id: `col-${col.id || idx}`,
          title: col.name,
          subtitle: col.description || `Discover our exclusive ${col.name} collection woven with tradition and heritage.`,
          gradient: gradients[slideCounter % gradients.length],
          badge: "Featured Collection",
          ctaPrimary: `Explore ${col.name}`,
          ctaPrimaryLink: `/collections?theme=${encodeURIComponent(col.name)}`,
          ctaSecondary: "View All Collections",
          ctaSecondaryLink: "/collections"
        });
        slideCounter++;
      });
    }

    if (categories && categories.length > 0) {
      categories.slice(0, 2).forEach((cat, idx) => {
        dynamicSlides.push({
          id: `cat-${cat.id || idx}`,
          title: `Pure ${cat.name} Masterpieces`,
          subtitle: cat.description || `Experience the royal luxury and authentic weave of our ${cat.name} sarees.`,
          gradient: gradients[slideCounter % gradients.length],
          badge: "Authentic Silk Mark",
          ctaPrimary: `Shop ${cat.name}`,
          ctaPrimaryLink: `/sarees?category=${encodeURIComponent(cat.name)}`,
          ctaSecondary: "All Weaves",
          ctaSecondaryLink: "/sarees"
        });
        slideCounter++;
      });
    }

    if (dynamicSlides.length === 0) {
      return fallbackSlides;
    }
    
    return dynamicSlides;
  }, [categories, themeCollections, loading]);

  return (
    <section className="hero-section position-relative overflow-hidden">
      <Swiper
        key={heroSlides.length}
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        effect="fade"
        speed={1200}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        loop={heroSlides.length > 1}
        className="hero-swiper"
        style={{ minHeight: 'clamp(500px, 75vh, 850px)' }}
      >
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div 
              className="hero-slide-bg position-relative d-flex align-items-center"
              style={{
                background: slide.gradient,
                minHeight: 'clamp(500px, 75vh, 850px)',
                transition: 'background 0.5s ease'
              }}
            >
              <div 
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.1) 100%)'
                }}
              />
              <div className="container position-relative z-2 py-5">
                <div className="row">
                  <div className="col-lg-8 col-xl-7 text-white">
                    <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-3" style={{ background: 'rgba(200, 165, 75, 0.25)', border: '1px solid #C8A54B', backdropFilter: 'blur(4px)' }}>
                      <FiStar className="text-gold" />
                      <span className="font-montserrat fw-semibold text-gold text-uppercase" style={{ fontSize: '0.78rem', letterSpacing: '1.5px' }}>
                        {slide.badge}
                      </span>
                    </div>
                    <h1 
                      className="font-serif fw-bold text-white mb-3 text-shadow" 
                      style={{ fontSize: 'calc(2rem + 2vw)', lineHeight: '1.15', textShadow: '0 4px 15px rgba(0,0,0,0.5)' }}
                    >
                      {slide.title}
                    </h1>
                    <p 
                      className="font-poppins text-light-gold mb-4 text-white-90" 
                      style={{ fontSize: '1.15rem', maxWidth: '620px', color: '#FFFDF8', lineHeight: '1.6' }}
                    >
                      {slide.subtitle}
                    </p>
                    <div className="d-flex flex-wrap gap-3 pt-2">
                      <Link href={slide.ctaPrimaryLink} className="btn btn-gold btn-lg rounded-pill font-montserrat fw-bold shadow-lg">
                        <span>{slide.ctaPrimary}</span>
                        <FiArrowRight size={18} />
                      </Link>
                      <Link href={slide.ctaSecondaryLink} className="btn btn-outline-gold btn-lg rounded-pill font-montserrat text-white">
                        <span>{slide.ctaSecondary}</span>
                      </Link>
                    </div>
                    <div className="d-flex align-items-center gap-4 mt-5 pt-3 border-top border-gold-subtle">
                      <div className="d-flex align-items-center gap-2">
                        <FiShield className="text-gold" size={20} />
                        <span className="font-poppins" style={{ fontSize: '0.82rem' }}>Pure Silk Mark Certified</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-gold fw-bold">100%</span>
                        <span className="font-poppins" style={{ fontSize: '0.82rem' }}>Handloom Weave Guarantee</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Hero;
