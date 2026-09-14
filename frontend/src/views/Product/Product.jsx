'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiStar, FiShoppingBag, FiHeart, FiShield, FiTruck, FiRotateCcw, FiCheckCircle, FiShare2, FiPlus, FiThumbsUp, FiUpload, FiEye, FiX, FiBookOpen } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useProducts } from '../../context/ProductContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import QuickViewModal from '../../components/QuickViewModal/QuickViewModal';
import { getProductImageUrl } from '../../lib/imageHelper';

const Product = () => {
  const { id } = useParams();
  const { products, getProductRatingInfo, addReview, markReviewHelpful, loadProductReviews, loading } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();

  const product = products.find((p) => String(p.id) === String(id)) || products[0];

  const [selectedImage, setSelectedImage] = useState(product?.images?.[0] || '');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs', 'wash', 'reviews'
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  
  // Write Review Modal / Form State
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhoto, setReviewPhoto] = useState('');
  const [reviewPhone, setReviewPhone] = useState('');
  const [reviewOrderCode, setReviewOrderCode] = useState('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [zoomReviewPhoto, setZoomReviewPhoto] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(product?.images?.[0] || '');
    }
    window.scrollTo(0, 0);
  }, [id, product]);

  useEffect(() => {
    if (product && product.id) {
      loadProductReviews(product.id);
    }
  }, [product?.id, loadProductReviews]);

  if (!product && loading) {
    return (
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="skeleton" style={{ width: '100%', aspectRatio: '3/4', borderRadius: '16px' }} />
          </div>
          <div className="col-lg-6">
            <div className="skeleton" style={{ height: '28px', width: '50%', marginBottom: '12px' }} />
            <div className="skeleton" style={{ height: '40px', width: '80%', marginBottom: '16px' }} />
            <div className="skeleton" style={{ height: '20px', width: '30%', marginBottom: '24px' }} />
            <div className="skeleton" style={{ height: '100px', width: '100%', marginBottom: '16px' }} />
            <div className="skeleton" style={{ height: '48px', width: '60%', borderRadius: '24px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h4>Saree not found</h4>
        <Link href="/sarees" className="btn btn-maroon rounded-pill mt-3">Back to Sarees</Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);
  const isOutOfStock = product.stock !== undefined ? product.stock <= 0 : (product.inStock === false);
  const ratingInfo = getProductRatingInfo(product.id);

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedQuantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedQuantity);
    router.push('/checkout');
  };

  // Handle Photo File Upload for Review
  const handleReviewPhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert(`File "${file.name}" exceeds 8MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setReviewPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle Review Submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim() || !reviewPhone.trim() || !reviewOrderCode.trim()) return;

    setIsSubmittingReview(true);
    try {
      await addReview(product.id, {
        name: reviewName,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        photoUrl: reviewPhoto,
        phone: reviewPhone,
        orderCode: reviewOrderCode
      });

      setReviewName('');
      setReviewTitle('');
      setReviewComment('');
      setReviewPhoto('');
      setReviewPhone('');
      setReviewOrderCode('');
      setReviewRating(5);
      setIsWriteReviewOpen(false);

      setReviewSuccessMsg('Thank you! Your customer review & rating has been published.');
      setActiveTab('reviews');
      setTimeout(() => setReviewSuccessMsg(''), 5000);
    } catch (err) {
      alert(err.message || 'Failed to submit review. Please ensure your Order Code and Phone Number match a delivered order.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="product-details-page py-5 bg-ivory font-poppins">
      <div className="container py-3">
        
        {/* Breadcrumb */}
        <div className="mb-4 font-poppins" style={{ fontSize: '0.85rem' }}>
          <Link href="/" className="text-muted text-decoration-none">Home</Link>
          <span className="mx-2 text-gold">/</span>
          <Link href="/sarees" className="text-muted text-decoration-none">Sarees</Link>
          <span className="mx-2 text-gold">/</span>
          <Link href={`/sarees?category=${encodeURIComponent(product.category)}`} className="text-muted text-decoration-none">{product.category}</Link>
          <span className="mx-2 text-gold">/</span>
          <span className="text-maroon fw-semibold">{product.name}</span>
        </div>

        {/* Product Details Row */}
        <div className="row g-5">
          
          {/* Column 1: Image Gallery Zoom */}
          <div className="col-lg-6">
            <div className="card border-0 rounded-4 overflow-hidden shadow-md bg-white p-3 border-gold">
              <div className="position-relative text-center mb-3">
                <img 
                  src={getProductImageUrl(selectedImage)} 
                  alt={product.name}
                  className="img-fluid rounded-3 object-fit-cover w-100"
                  style={{ maxHeight: '520px', minHeight: '400px' }}
                 onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
                {isOutOfStock ? (
                  <span className="position-absolute top-0 start-0 m-3 badge bg-danger font-montserrat px-3 py-2 fs-6 shadow text-uppercase fw-bold">
                    Out of Stock
                  </span>
                ) : (
                  product.originalPrice && product.originalPrice > product.price && (
                    <span className="position-absolute top-0 start-0 m-3 badge bg-maroon font-montserrat px-3 py-2 fs-6 shadow">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  )
                )}
              </div>

              {/* Thumbnails Swapper */}
              <div className="d-flex gap-2 justify-content-center">
                {(product.images || []).map((img, idx) => (
                  <img 
                    key={idx}
                    src={getProductImageUrl(img)} 
                    alt="Gallery thumbnail" 
                    onClick={() => setSelectedImage(img)} onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }}
                    className={`rounded-3 cursor-pointer border ${selectedImage === img ? 'border-maroon border-3' : 'border-light'}`}
                    style={{ width: '70px', height: '85px', objectFit: 'cover', cursor: 'pointer' }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Information & Purchase Controls */}
          <div className="col-lg-6">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-gold text-white font-montserrat px-3 py-1 rounded-pill" style={{ fontSize: '0.78rem' }}>
                {product.category}
              </span>
              <span className="badge bg-maroon-subtle text-maroon font-montserrat px-3 py-1 rounded-pill" style={{ fontSize: '0.78rem' }}>
                Silk Mark Certified
              </span>
            </div>

            <h1 className="font-serif fw-bold text-maroon mb-2" style={{ fontSize: '2rem' }}>
              {product.name}
            </h1>

            {/* Real Customer Rating Indicator */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="d-flex text-warning">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar 
                    key={star} 
                    size={18} 
                    style={{ 
                      fill: star <= Math.round(ratingInfo.avgRating) && ratingInfo.reviewsCount > 0 ? '#C8A54B' : 'none', 
                      color: '#C8A54B' 
                    }}
                  />
                ))}
              </div>
              <span className="fw-bold font-montserrat text-dark">
                {ratingInfo.reviewsCount > 0 ? ratingInfo.avgRating : ''}
              </span>
              <button 
                onClick={() => setActiveTab('reviews')}
                className="btn btn-link text-maroon font-poppins p-0 text-decoration-underline" 
                style={{ fontSize: '0.88rem' }}
              >
                {ratingInfo.reviewsCount > 0 ? `(${ratingInfo.reviewsCount} customer reviews)` : '(No reviews yet — be the first to review!)'}
              </button>
            </div>

            {/* Price Display */}
            <div className="d-flex align-items-baseline gap-3 mb-4 p-3 bg-white rounded-3 border-gold">
              <span className="font-montserrat fw-bold text-maroon display-6">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-muted text-decoration-line-through font-montserrat fs-5">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-success font-montserrat fw-semibold" style={{ fontSize: '0.88rem' }}>
                Inclusive of all taxes
              </span>
            </div>

            {/* Short Description */}
            <p className="text-muted font-poppins mb-4" style={{ fontSize: '0.92rem', lineHeight: '1.6' }}>
              {product.shortDescription || product.description}
            </p>

            {/* Success Message Banner */}
            {reviewSuccessMsg && (
              <div className="alert alert-success rounded-pill font-poppins text-center py-2 mb-4" style={{ fontSize: '0.88rem' }}>
                <FiCheckCircle className="me-1" /> {reviewSuccessMsg}
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            {isOutOfStock ? (
              <div className="alert alert-danger rounded-4 p-3.5 mb-4 border-2 border-danger font-poppins d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 shadow-sm bg-danger-subtle">
                <div>
                  <h5 className="font-serif fw-bold text-danger mb-1">Currently Out of Stock</h5>
                  <p className="text-dark mb-0" style={{ fontSize: '0.86rem' }}>
                    This saree is sold out. Check back soon or contact us on WhatsApp for restock updates.
                  </p>
                </div>
                <button 
                  disabled 
                  className="btn btn-secondary btn-lg rounded-pill font-montserrat fw-bold text-uppercase px-4 shadow-sm"
                  style={{ cursor: 'not-allowed', backgroundColor: '#6c757d' }}
                >
                  Out of Stock
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="input-group" style={{ width: '120px' }}>
                  <button 
                    onClick={() => setSelectedQuantity(prev => Math.max(1, prev - 1))}
                    className="btn btn-outline-maroon font-montserrat fw-bold"
                  >
                    -
                  </button>
                  <input 
                    type="text" 
                    readOnly 
                    value={selectedQuantity} 
                    className="form-control text-center font-montserrat fw-bold border-maroon"
                  />
                  <button 
                    onClick={() => setSelectedQuantity(prev => prev + 1)}
                    className="btn btn-outline-maroon font-montserrat fw-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="btn btn-gold btn-lg flex-grow-1 rounded-pill font-montserrat fw-bold shadow"
                >
                  Add to Bag
                </button>

                <button
                  onClick={handleBuyNow}
                  className="btn btn-maroon btn-lg rounded-pill font-montserrat fw-bold"
                >
                  Buy Now
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`btn btn-lg p-3 rounded-circle border-gold ${isSaved ? 'btn-danger text-white' : 'btn-outline-gold'}`}
                  title="Save to Wishlist"
                >
                  <FiHeart size={20} style={{ fill: isSaved ? '#FFFFFF' : 'none' }} />
                </button>
              </div>
            )}

            {/* Trust Assurances Bar */}
            <div className="p-3 bg-white rounded-4 border-gold d-flex flex-column gap-2 font-poppins" style={{ fontSize: '0.85rem' }}>
              <div className="d-flex align-items-center gap-2">
                <FiShield className="text-gold" size={18} />
                <span><strong>Silk Mark Certified:</strong> Guaranteeing 100% pure Mulberry silk yarn.</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <FiTruck className="text-gold" size={18} />
                <span><strong>Free Express Shipping:</strong> Dispatched in protective silk box within 24 hours.</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <FiRotateCcw className="text-gold" size={18} />
                <span><strong>7-Day Easy Exchange:</strong> Hassle-free returns & video consultation available.</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <FiBookOpen className="text-gold" size={18} />
                <span><strong>Pure Pattu Care Guide:</strong> <Link href="/care-guide" className="text-gold fw-bold text-decoration-underline">View Wash & Storage Instructions →</Link></span>
              </div>
            </div>

          </div>
        </div>

        {/* Specifications, Care & Customer Reviews Section */}
        <div className="mt-5 bg-white p-4 rounded-4 border-gold">
          <div className="d-flex flex-wrap gap-3 border-bottom border-gold pb-3 mb-4">
            <button 
              onClick={() => setActiveTab('specs')}
              className={`btn font-montserrat fw-bold px-4 rounded-pill ${activeTab === 'specs' ? 'btn-maroon text-white' : 'btn-outline-gold'}`}
            >
              Saree Specifications
            </button>
            <button 
              onClick={() => setActiveTab('wash')}
              className={`btn font-montserrat fw-bold px-4 rounded-pill ${activeTab === 'wash' ? 'btn-maroon text-white' : 'btn-outline-gold'}`}
            >
              Wash & Silk Care
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`btn font-montserrat fw-bold px-4 rounded-pill ${activeTab === 'reviews' ? 'btn-maroon text-white' : 'btn-outline-gold'}`}
            >
              ⭐ Customer Reviews ({ratingInfo.reviewsCount})
            </button>
          </div>

          {activeTab === 'specs' && (
            <div className="row g-3 font-poppins">
              {Object.entries(product.specifications || {
                "Saree Length": "5.5 meters",
                "Blouse Piece": "0.8 meters (Included in contrast gold zari finish)",
                "Zari Type": "Pure Tested Gold Zari",
                "Weave Region": "Kanchipuram, Tamil Nadu",
                "Certification": "Certified Silk Mark"
              }).map(([key, val]) => (
                <div key={key} className="col-md-6 border-bottom py-2">
                  <span className="fw-bold text-maroon">{key}: </span>
                  <span className="text-muted">{val}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'wash' && (
            <div className="font-poppins text-muted">
              <p>• <strong>Dry Clean Only:</strong> We recommend professional dry cleaning for pure silk sarees to preserve zari shimmer.</p>
              <p>• <strong>Storage:</strong> Wrap saree in unbleached pure cotton or muslin cloth. Never store in plastic covers.</p>
              <p>• <strong>Ironing:</strong> Iron on low silk setting with a clean cotton cloth placed over the saree.</p>
            </div>
          )}

          {/* Real Customer Reviews & Ratings Ecosystem */}
          {activeTab === 'reviews' && (
            <div className="font-poppins">
              
              {/* Scorecard Header */}
              <div className="p-4 bg-light-gold rounded-4 border-gold mb-4">
                <div className="row align-items-center g-4">
                  <div className="col-md-4 text-center border-end-md border-gold">
                    <h1 className="font-serif fw-bold text-maroon display-4 mb-0">
                      {ratingInfo.reviewsCount > 0 ? ratingInfo.avgRating : '0.0'}
                    </h1>
                    <div className="d-flex justify-content-center text-warning mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar 
                          key={star} 
                          size={20} 
                          style={{ fill: star <= Math.round(ratingInfo.avgRating) && ratingInfo.reviewsCount > 0 ? '#C8A54B' : 'none', color: '#C8A54B' }}
                        />
                      ))}
                    </div>
                    <span className="text-muted font-montserrat fw-semibold" style={{ fontSize: '0.85rem' }}>
                      Based on {ratingInfo.reviewsCount} customer reviews
                    </span>
                  </div>

                  <div className="col-md-8 text-center text-md-start">
                    <h5 className="font-serif fw-bold text-maroon mb-1">Have you bought this saree?</h5>
                    <p className="text-muted mb-3" style={{ fontSize: '0.88rem' }}>
                      Share your experience, weave feedback, and saree photos to help fellow buyers!
                    </p>
                    <button 
                      onClick={() => setIsWriteReviewOpen(true)}
                      className="btn btn-maroon rounded-pill font-montserrat fw-bold px-4 py-2 shadow-sm"
                    >
                      <FiPlus className="me-1.5" /> Write a Review & Rate Saree
                    </button>
                  </div>
                </div>
              </div>

              {/* Write Review Form Drawer / Box */}
              {isWriteReviewOpen && (
                <div className="card border-0 rounded-4 p-4 mb-4 bg-white shadow border-gold">
                  <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-gold">
                    <h5 className="font-serif fw-bold text-maroon mb-0">✍️ Share Your Customer Review</h5>
                    <button onClick={() => setIsWriteReviewOpen(false)} className="btn btn-sm btn-outline-danger rounded-circle">
                      <FiX size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleReviewSubmit} className="row g-3">
                    
                    {/* Star Rating Picker */}
                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted" style={{ fontSize: '0.8rem' }}>Your Rating *</label>
                      <div className="d-flex gap-2 text-warning cursor-pointer">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar 
                            key={star} 
                            size={28}
                            onClick={() => setReviewRating(star)}
                            style={{ 
                              fill: star <= reviewRating ? '#C8A54B' : 'none', 
                              color: '#C8A54B',
                              cursor: 'pointer'
                            }}
                          />
                        ))}
                        <span className="ms-2 font-montserrat fw-bold text-dark fs-5 align-self-center">
                          {reviewRating} / 5 Stars
                        </span>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted" style={{ fontSize: '0.8rem' }}>Your Name *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Radhika Sharma" 
                        className="form-control border-gold rounded-pill"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted" style={{ fontSize: '0.8rem' }}>Review Headline</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Breathtaking Pure Silk & Fast Shipping!" 
                        className="form-control border-gold rounded-pill"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted" style={{ fontSize: '0.8rem' }}>Phone Number *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="10-digit number used for order" 
                        className="form-control border-gold rounded-pill"
                        value={reviewPhone}
                        onChange={(e) => setReviewPhone(e.target.value)}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted" style={{ fontSize: '0.8rem' }}>Order Code *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. ORD-12345" 
                        className="form-control border-gold rounded-pill"
                        value={reviewOrderCode}
                        onChange={(e) => setReviewOrderCode(e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted" style={{ fontSize: '0.8rem' }}>Your Detailed Feedback *</label>
                      <textarea 
                        required
                        rows="3"
                        placeholder="Tell us about the fabric feel, color accuracy, zari shine, and stitching..."
                        className="form-control border-gold rounded-3"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold text-maroon" style={{ fontSize: '0.8rem' }}>
                        Upload Saree Photo (Optional)
                      </label>
                      <div className="d-flex align-items-center gap-3">
                        <input 
                          type="file" 
                          accept="image/*" 
                          id="reviewPhotoInput" 
                          className="d-none"
                          onChange={handleReviewPhotoUpload} 
                        />
                        <label 
                          htmlFor="reviewPhotoInput" 
                          className="btn btn-outline-maroon rounded-pill font-montserrat fw-bold btn-sm px-3 py-2 cursor-pointer shadow-sm"
                          style={{ cursor: 'pointer' }}
                        >
                          <FiUpload className="me-1" /> Choose Device Photo
                        </label>
                        
                        <input 
                          type="text" 
                          placeholder="Or paste image URL..." 
                          className="form-control border-gold rounded-pill"
                          value={reviewPhoto}
                          onChange={(e) => setReviewPhoto(e.target.value)}
                        />

                        {reviewPhoto && (
                          <img src={reviewPhoto} alt="Review upload" className="rounded-3 border border-gold" style={{ width: '50px', height: '50px', objectFit: 'cover' }}  onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
                        )}
                      </div>
                    </div>

                    <div className="col-12 text-end pt-2">
                      <button type="button" onClick={() => setIsWriteReviewOpen(false)} className="btn btn-outline-secondary rounded-pill me-2 px-4">
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-gold text-white rounded-pill px-5 font-montserrat fw-bold shadow" disabled={isSubmittingReview}>
                        {isSubmittingReview ? <><span className="spinner-border spinner-border-sm me-2"></span> Submitting...</> : 'Submit Review'}
                      </button>
                    </div>

                  </form>
                </div>
              )}

              {/* Reviews List */}
              {ratingInfo.reviews.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-4 border-gold">
                  <p className="text-muted font-serif fs-5 mb-1">No customer reviews published for this saree yet.</p>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Be the first customer to rate & review this handloom weave!</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {(ratingInfo.reviews || []).map((rev) => (
                    <div key={rev.id} className="card border-0 rounded-4 p-3 bg-white shadow-sm border-gold">
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold text-maroon font-serif">{rev.customerName || rev.name}</span>
                          {(rev.isVerifiedPurchase !== false) && (
                            <span className="badge bg-success text-white font-montserrat" style={{ fontSize: '0.68rem' }}>
                              <FiCheckCircle size={10} className="me-1" /> Verified Buyer
                            </span>
                          )}
                        </div>
                        <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                          {rev.reviewDate ? new Date(rev.reviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : rev.date}
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="d-flex text-warning">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FiStar 
                              key={star} 
                              size={14} 
                              style={{ fill: star <= rev.rating ? '#C8A54B' : 'none', color: '#C8A54B' }}
                            />
                          ))}
                        </div>
                        <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.9rem' }}>{rev.title}</h6>
                      </div>

                      <p className="text-muted mb-2" style={{ fontSize: '0.88rem', lineHeight: '1.5' }}>
                        {rev.comment}
                      </p>

                      {rev.photoUrl && (
                        <div className="mb-2">
                          <img 
                            src={rev.photoUrl} 
                            alt="Customer Saree Photo" 
                            className="rounded-3 border border-gold cursor-pointer"
                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                            onClick={() => setZoomReviewPhoto(rev.photoUrl)} onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }}
                          />
                        </div>
                      )}

                      <div className="d-flex align-items-center justify-content-between pt-2 border-top border-light">
                        <button 
                          onClick={() => markReviewHelpful(rev.id)}
                          className="btn btn-sm btn-outline-gold rounded-pill px-3 font-montserrat"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <FiThumbsUp size={12} className="me-1" /> Helpful ({rev.helpfulCount || 0})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-5">
            <div className="section-title-wrap text-center mb-4">
              <span className="section-subtitle">Complementary Weaves</span>
              <h3 className="section-title">Related Sarees You May Love</h3>
            </div>
            <div className="row g-4">
              {(relatedProducts || []).map((rel) => (
                <div key={rel.id} className="col-6 col-md-3">
                  <ProductCard product={rel} onQuickView={setQuickViewProduct} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
        />
      )}

      {/* Photo Zoom Modal */}
      {zoomReviewPhoto && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 4000, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
          onClick={() => setZoomReviewPhoto(null)}
        >
          <div className="position-relative bg-dark rounded-4 p-3 max-w-600 w-100 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center text-white mb-2">
              <span className="font-serif fw-bold text-gold">Customer Photo</span>
              <button onClick={() => setZoomReviewPhoto(null)} className="btn btn-outline-danger btn-sm rounded-circle">
                <FiX size={18} />
              </button>
            </div>
            <img src={zoomReviewPhoto} alt="Zoom Customer Photo" className="img-fluid rounded-3" style={{ maxHeight: '70vh', objectFit: 'contain' }}  onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
          </div>
        </div>
      )}

    </div>
  );
};

export default Product;
