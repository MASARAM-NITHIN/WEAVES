'use client';
import React from 'react';
import Link from 'next/link';
import { FiCheckCircle, FiAlertTriangle, FiSun, FiWind, FiShield, FiHeart, FiHelpCircle, FiArrowRight, FiDroplet } from 'react-icons/fi';
import { GiCrown, GiSparkles } from 'react-icons/gi';

const careSteps = [
  {
    icon: <FiDroplet size={36} className="text-gold" />,
    title: "1. Washing & Cleaning",
    tag: "First 3-4 Washes: Dry Clean Only",
    points: [
      "Dry Clean Recommended: Always dry clean pure Kanchipuram, Banarasi, and Gadwal Pattu sarees for the first 3 to 4 washes to set natural silk dyes.",
      "Gentle Hand Wash (Later): Use cold water with mild silk liquid detergent or baby shampoo. Never use harsh detergent powders or bleach.",
      "Never Soak Long: Do not soak Pattu sarees in water for more than 5 minutes. Wash quickly without wringing.",
      "Separate Washing: Wash each Pattu saree individually to prevent color bleeding onto light zari borders."
    ]
  },
  {
    icon: <FiWind size={36} className="text-gold" />,
    title: "2. Drying & Ventilation",
    tag: "Dry Indoors in Shade",
    points: [
      "Avoid Direct Sunlight: Line dry your Pattu saree in indirect shade or indoors. Direct harsh sunlight fades natural silk luster and damages pure zari.",
      "Towel Roll Method: Gently roll the wet saree in a dry cotton towel to absorb excess water. Never wring or twist heavy bridal silk.",
      "Padded Hangers: Air-dry on padded wooden hangers in a well-ventilated room until completely moisture-free."
    ]
  },
  {
    icon: <GiSparkles size={36} className="text-gold" />,
    title: "3. Ironing & Zari Care",
    tag: "Iron Reverse Side on Silk Setting",
    points: [
      "Silk Heat Setting: Set your iron to 'Silk' mode (low heat, warm temperature).",
      "Iron Reverse Side: Always press on the back (inner) side of the saree. Never touch a hot iron directly to gold zari borders or pallu.",
      "Protective Cotton Sheet: Place a thin white cotton fabric over gold zari before pressing to prevent heat tarnishing.",
      "No Direct Water Spray: Avoid spraying water directly onto silk while ironing to prevent water spots."
    ]
  },
  {
    icon: <GiCrown size={36} className="text-gold" />,
    title: "4. Storage & Preservation",
    tag: "Wrap in Muslin / Pure Cotton Cloth",
    points: [
      "Cotton / Muslin Wraps: Wrap pure Pattu sarees in clean white cotton or muslin fabric. Never store in plastic bags, as silk needs air to breathe.",
      "Refold Every 3 Months: Unfold and change fold lines every 2-3 months to prevent permanent creasing or fiber breakage along folds.",
      "Store Flat: Heavy bridal Kanchipuram sarees should be stored flat in saree trunks rather than hung on hangers for long periods.",
      "Natural Repellents: Place dried neem leaves or cloves in storage drawers. Never place mothballs or naphthalene directly on zari."
    ]
  }
];

const dosAndDonts = {
  dos: [
    "Do dry clean pure bridal silk sarees for long preservation.",
    "Do wrap sarees in breathable muslin or pure cotton sheets.",
    "Do refold stored silk sarees every 90 days.",
    "Do iron on reverse side under a protective cotton cloth.",
    "Do spray perfume on your skin before draping the saree (never directly on zari)."
  ],
  donts: [
    "Don't wring, twist, or scrub silk sarees while washing.",
    "Don't dry silk sarees under direct hot sunlight.",
    "Don't use plastic covers or poly-bags for long term silk storage.",
    "Don't place naphthalene balls in direct contact with gold zari.",
    "Don't spray water or starch directly onto pure silk fibers."
  ]
};

const CareGuide = () => {
  return (
    <div className="care-guide-page py-5 bg-ivory font-poppins min-vh-80">
      <div className="container py-3">
        
        {/* Page Header */}
        <div className="section-title-wrap text-center mb-5">
          <span className="section-subtitle">Heritage Handloom Preservation</span>
          <h2 className="section-title text-maroon font-serif fw-bold">Pure Pattu Saree Wash & Care Guide</h2>
          <p className="text-muted font-poppins mt-2" style={{ maxWidth: '720px', margin: '0 auto', fontSize: '0.95rem' }}>
            Follow master artisan instructions to maintain the royal sheen, 24K gold zari luster, and soft drape of your Sree Padmavathi Silks for generations.
          </p>
          <div className="gold-divider">
            <span className="gold-diamond"></span>
          </div>
        </div>

        {/* Master Care Steps Grid */}
        <div className="row g-4 mb-5">
          {(careSteps || []).map((step, idx) => (
            <div key={idx} className="col-md-6">
              <div className="card h-100 border-0 rounded-4 p-4 luxury-card shadow-sm bg-white border-gold position-relative">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-3 bg-light-gold rounded-circle border border-gold">
                    {step.icon}
                  </div>
                  <div>
                    <h5 className="font-serif fw-bold text-maroon mb-1">{step.title}</h5>
                    <span className="badge bg-gold text-white font-montserrat" style={{ fontSize: '0.72rem' }}>
                      {step.tag}
                    </span>
                  </div>
                </div>

                <ul className="list-unstyled font-poppins d-flex flex-column gap-2 mb-0" style={{ fontSize: '0.88rem' }}>
                  {(step.points || []).map((pt, pIdx) => (
                    <li key={pIdx} className="d-flex align-items-start gap-2">
                      <FiCheckCircle className="text-gold mt-1 flex-shrink-0" size={16} />
                      <span className="text-dark">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Do's & Don'ts Comparison Table */}
        <div className="row justify-content-center mb-5">
          <div className="col-lg-10">
            <div className="card border-0 rounded-4 bg-white border-gold shadow-md overflow-hidden">
              <div className="p-4 bg-maroon text-white text-center border-bottom border-gold">
                <h4 className="font-serif fw-bold text-gold mb-1">Golden Rules for Pattu Saree Maintenance</h4>
                <p className="mb-0 font-montserrat" style={{ fontSize: '0.85rem' }}>Essential Do's & Don'ts for Kanchipuram, Banarasi & Gadwal Silks</p>
              </div>

              <div className="p-4">
                <div className="row g-4">
                  
                  {/* DO's */}
                  <div className="col-md-6 border-end-md border-gold">
                    <div className="d-flex align-items-center gap-2 mb-3 text-success font-serif fw-bold fs-5">
                      <FiCheckCircle size={24} />
                      <span>ALWAYS DO:</span>
                    </div>
                    <ul className="list-unstyled font-poppins d-flex flex-column gap-2.5" style={{ fontSize: '0.88rem' }}>
                      {(dosAndDonts.dos || []).map((item, dIdx) => (
                        <li key={dIdx} className="d-flex align-items-start gap-2">
                          <span className="text-success fw-bold">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* DONT's */}
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-2 mb-3 text-danger font-serif fw-bold fs-5">
                      <FiAlertTriangle size={24} />
                      <span>NEVER DO:</span>
                    </div>
                    <ul className="list-unstyled font-poppins d-flex flex-column gap-2.5" style={{ fontSize: '0.88rem' }}>
                      {(dosAndDonts.donts || []).map((item, dIdx) => (
                        <li key={dIdx} className="d-flex align-items-start gap-2">
                          <span className="text-danger fw-bold">✗</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Stain Care Banner */}
        <div className="p-4 p-md-5 rounded-4 bg-light-gold border border-gold mb-5 shadow-sm text-center">
          <GiSparkles className="text-gold mb-2" size={38} />
          <h4 className="font-serif fw-bold text-maroon mb-2">Accidental Stain Emergency?</h4>
          <p className="font-poppins text-dark mb-3" style={{ maxWidth: '650px', margin: '0 auto', fontSize: '0.92rem' }}>
            If grease or oil spills on your Pattu saree, sprinkle talcum powder immediately over the stain to absorb oil. Do not rub! Take it to an authorized professional silk dry cleaner as soon as possible.
          </p>
          <Link href="/sarees" className="btn btn-maroon rounded-pill px-5 font-montserrat fw-bold shadow-sm">
            Explore Handwoven Sarees Catalog <FiArrowRight className="ms-1" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default CareGuide;
