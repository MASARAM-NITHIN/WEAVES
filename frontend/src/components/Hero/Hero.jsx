'use client';
import React from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import { FiArrowRight, FiStar, FiShield } from 'react-icons/fi';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const heroSlides = [
  {
    id: 1,
    title: "Celebrate Every Occasion with Timeless Silks",
    subtitle: "Authentic handwoven sarees crafted for generations by South India's master weavers.",
    gradient: "linear-gradient(135deg, #580B1F 0%, #7B112C 60%, #2A0510 100%)",
    badge: "Royal Kanchipuram Heritage",
    ctaPrimary: "Shop Bridal Collection",
    ctaPrimaryLink: "/sarees?category=Kanchipuram%20Silk",
    ctaSecondary: "Explore New Arrivals",
    ctaSecondaryLink: "/sarees?filter=new"
  },
  {
    id: 2,
    title: "Pure Gold Zari Grandeur & Varanasi Brocades",
    subtitle: "Experience royal luxury woven with 24K pure gold tested zari and silver brocade weaves.",
    gradient: "linear-gradient(135deg, #093f30 0%, #0F6A50 60%, #041f17 100%)",
    badge: "Authentic Silk Mark Certified",
    ctaPrimary: "View Banarasi Silks",
    ctaPrimaryLink: "/sarees?category=Banarasi",
    ctaSecondary: "Wedding Trousseau",
    ctaSecondaryLink: "/collections?theme=wedding"
  },
  {
    id: 3,
    title: "Whisper-Light Organza & Chanderi Tissue Weaves",
    subtitle: "Contemporary haute couture crafted for daytime receptions, celebrations, and festive galas.",
    gradient: "linear-gradient(135deg, #7c6224 0%, #9E7D29 60%, #3e310d 100%)",
    badge: "Celebrity Designer Edit",
    ctaPrimary: "Shop Organza Silks",
    ctaPrimaryLink: "/sarees?category=Organza",
    ctaSecondary: "Explore Collections",
    ctaSecondaryLink: "/collections"
  }
];

const Hero = () => {
  return (
    <section className="hero-section position-relative overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        effect="fade"
        speed={1200}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        loop={true}
        className="hero-swiper"
        style={{ minHeight: 'clamp(500px, 75vh, 850px)' }}
      >
        {(heroSlides || []).map((slide) => (
          <SwiperSlide key={slide.id}>
            <div 
              className="hero-slide-bg position-relative d-flex align-items-center"
              style={{
                background: slide.gradient,
                minHeight: 'clamp(500px, 75vh, 850px)'
              }}
            >
              {/* Gradient Luxury Overlay */}
              <div 
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.1) 100%)'
                }}
              />

              <div className="container position-relative z-2 py-5">
                <div className="row">
                  <div className="col-lg-8 col-xl-7 text-white">
                    {/* Badge */}
                    <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-3" style={{ background: 'rgba(200, 165, 75, 0.25)', border: '1px solid #C8A54B', backdropFilter: 'blur(4px)' }}>
                      <FiStar className="text-gold" />
                      <span className="font-montserrat fw-semibold text-gold text-uppercase" style={{ fontSize: '0.78rem', letterSpacing: '1.5px' }}>
                        {slide.badge}
                      </span>
                    </div>

                    {/* Main Title */}
                    <h1 
                      className="font-serif fw-bold text-white mb-3 text-shadow" 
                      style={{ fontSize: 'calc(2rem + 2vw)', lineHeight: '1.15', textShadow: '0 4px 15px rgba(0,0,0,0.5)' }}
                    >
                      {slide.title}
                    </h1>

                    {/* Subheading */}
                    <p 
                      className="font-poppins text-light-gold mb-4 text-white-90" 
                      style={{ fontSize: '1.15rem', maxWidth: '620px', color: '#FFFDF8', lineHeight: '1.6' }}
                    >
                      {slide.subtitle}
                    </p>

                    {/* CTA Buttons */}
                    <div className="d-flex flex-wrap gap-3 pt-2">
                      <Link href={slide.ctaPrimaryLink} className="btn btn-gold btn-lg rounded-pill font-montserrat fw-bold shadow-lg">
                        <span>{slide.ctaPrimary}</span>
                        <FiArrowRight size={18} />
                      </Link>

                      <Link href={slide.ctaSecondaryLink} className="btn btn-outline-gold btn-lg rounded-pill font-montserrat text-white">
                        <span>{slide.ctaSecondary}</span>
                      </Link>
                    </div>

                    {/* Trust Indicators */}
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
