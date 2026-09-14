import React, { useState, useEffect, useCallback } from 'react';
import { fetchAllUsersApi, updateUserStatusApi, fetchAllReviewsApi, API_BASE_URL } from '../../lib/apiClient';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { 
  FiLock, FiLogOut, FiPlus, FiEdit2, FiTrash2, FiSave, FiCheck, 
  FiSearch, FiRefreshCw, FiShoppingBag, FiKey, FiShield, FiUpload, 
  FiLink, FiImage, FiEye, FiEyeOff, FiX, FiCheckCircle, FiZoomIn, FiZoomOut, 
  FiMaximize2, FiStar, FiArrowLeft, FiGrid, FiFolder, FiMessageSquare, FiPhoneCall,
  FiUsers, FiUserCheck, FiUserX, FiSlash
} from 'react-icons/fi';
import { GiCrown, GiRibbonMedal } from 'react-icons/gi';
import { getProductImageUrl } from '../../lib/imageHelper';

// Image compression helper to optimize high-res local camera uploads into clean Data URLs
const compressImageFile = (file, maxWidth = 1200, quality = 0.82) => {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    if (!file.type || !file.type.startsWith('image/')) {
      alert('Please select a valid photo / image file.');
      return resolve(null);
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(event.target.result);
      img.src = event.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

const fabricsList = ["Pure Silk", "Soft Silk", "Organza Silk", "Chanderi Silk", "Pure Cotton", "Linen Silk", "Gadwal Silk"];

const Admin = () => {
  const { 
    products, 
    categories, 
    themeCollections,
    addProduct, 
    editProduct: updateProduct, 
    deleteProduct, 
    addCategory, 
    editCategory: updateCategory,
    deleteCategory, 
    addThemeCollection,
    editThemeCollection: updateThemeCollection,
    deleteThemeCollection,
    getCategorySareeCount, 
    isAdminLoggedIn, 
    loginAdmin, 
    logoutAdmin, 
    ownerUsername,
    changeOwnerCredentials,
  } = useProducts();


  const { orderHistory, isOrdersLoading, ordersError, updateOrderStatus, updateVerificationStatus, inquiries, updateInquiryStatus, deleteInquiry, loadDatabaseOrders, loadDatabaseEnquiries } = useCart();

  // ── Local Admin Reviews State (fetched directly — no shared context) ──
  const [adminReviews, setAdminReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const fetchAdminReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const data = await fetchAllReviewsApi();
      setAdminReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading reviews:', e);
      setAdminReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  const deleteReview = useCallback((id) => {
    setAdminReviews(prev => prev.filter(r => r.id !== id));
    // TODO: call delete API when backend endpoint is available
  }, []);

  // Fetch reviews on mount
  useEffect(() => {
    fetchAdminReviews();
  }, [fetchAdminReviews]);

  // Login form state (Blank by default - no auto-fill)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard Tab state: 'collection-wise', 'orders', 'categories', 'security', 'users'
  const [activeTab, setActiveTab] = useState('collection-wise');
  const [selectedCollection, setSelectedCollection] = useState(null); // Selected Category Name e.g. 'Kanchipuram Silk'
  const [searchQuery, setSearchQuery] = useState('');

  // Saree editing state
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editOriginalPrice, setEditOriginalPrice] = useState('');
  const [editStock, setEditStock] = useState('1');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Dashboard counts for superfast simultaneous loading
  const [dashboardCounts, setDashboardCounts] = useState(null);

  // Load admin-only data when admin logs in
  useEffect(() => {
    if (isAdminLoggedIn) {
      loadDatabaseOrders();
      loadDatabaseEnquiries();
      
      // Load superfast counts simultaneously via Java proxy
      const token = localStorage.getItem('sree_padmavathi_jwt_token');
      const cachedCounts = localStorage.getItem('sree_padmavathi_admin_counts');
      if (cachedCounts) {
        try { setDashboardCounts(JSON.parse(cachedCounts)); } catch(e){}
      }
      
      if (token) {
        fetch('/api/admin-counts', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(res => {
            if (res.success) {
              setDashboardCounts(res.data);
              localStorage.setItem('sree_padmavathi_admin_counts', JSON.stringify(res.data));
            }
          })
          .catch(console.error);
      }
    }
  }, [isAdminLoggedIn, loadDatabaseOrders, loadDatabaseEnquiries]);

  // Collection / Category Catalog Cover Modal state
  const [editingCategoryCover, setEditingCategoryCover] = useState(null);
  const [categoryCoverUrl, setCategoryCoverUrl] = useState('');

  // Image Lightbox & Zoom Modal State
  const [zoomImageModal, setZoomImageModal] = useState(null); // { url: string, zoomLevel: number, title: string }

  // Saree Photos Editor Modal State
  const [editingSareePhotosModal, setEditingSareePhotosModal] = useState(null); // { sareeId, sareeName, images }

  // Screenshot Zoom Modal State (for Order Payments - Direct Image Zoom)
  const [viewScreenshotModal, setViewScreenshotModal] = useState(null);
  const [screenshotZoomed, setScreenshotZoomed] = useState(false);
  const [screenshotOrigin, setScreenshotOrigin] = useState('center center');

  const handleScreenshotMouseMove = (e) => {
    if (!screenshotZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setScreenshotOrigin(`${x}% ${y}%`);
  };

  // Credentials Change State
  const [newUsername, setNewUsername] = useState(ownerUsername || 'owner');
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [showCurrPass, setShowCurrPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Users Management State
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [usersSearchQuery, setUsersSearchQuery] = useState('');
  const [usersRoleFilter, setUsersRoleFilter] = useState('ALL');
  const [userActionLoading, setUserActionLoading] = useState(null); // userId currently being acted on

  React.useEffect(() => {
    if (ownerUsername) {
      setNewUsername(ownerUsername);
    }
  }, [ownerUsername]);

  // Fetch all users when Users tab is active
  const loadAllUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const res = await fetchAllUsersApi();
      if (res && res.success && Array.isArray(res.data)) {
        setAllUsers(res.data);
      } else if (Array.isArray(res)) {
        setAllUsers(res);
      } else {
        setUsersError(res?.message || 'Failed to fetch users.');
      }
    } catch (err) {
      setUsersError(err?.message || 'Could not connect to server to fetch users.');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && isAdminLoggedIn) {
      loadAllUsers();
    }
  }, [activeTab, isAdminLoggedIn]);

  useEffect(() => {
    if (activeTab === 'orders' && isAdminLoggedIn) {
      loadDatabaseOrders();
    }
  }, [activeTab, isAdminLoggedIn, loadDatabaseOrders]);

  useEffect(() => {
    if (activeTab === 'inquiries' && isAdminLoggedIn) {
      loadDatabaseEnquiries();
    }
  }, [activeTab, isAdminLoggedIn, loadDatabaseEnquiries]);

  // Handle Block/Unblock User
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    setUserActionLoading(userId);
    try {
      const res = await updateUserStatusApi(userId, newStatus);
      if (res && (res.success || res.status === 200)) {
        setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        setSaveSuccessMsg(`User status updated to ${newStatus} successfully!`);
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      } else {
        alert(res?.message || 'Failed to update user status.');
      }
    } catch (err) {
      alert(err?.message || 'Error updating user status.');
    } finally {
      setUserActionLoading(null);
    }
  };

  // Handle Role Change
  const handleChangeUserRole = async (userId, newRole) => {
    setUserActionLoading(userId);
    try {
      const res = await updateUserStatusApi(userId, undefined, newRole);
      if (res && (res.success || res.status === 200)) {
        setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setSaveSuccessMsg(`User role changed to ${newRole} successfully!`);
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      } else {
        alert(res?.message || 'Failed to change user role.');
      }
    } catch (err) {
      alert(err?.message || 'Error changing user role.');
    } finally {
      setUserActionLoading(null);
    }
  };

  // Filter users by search and role
  const getFilteredUsers = () => {
    let filtered = allUsers;
    if (usersRoleFilter !== 'ALL') {
      filtered = filtered.filter(u => u.role === usersRoleFilter);
    }
    if (usersSearchQuery.trim()) {
      const q = usersSearchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        (u.username || '').toLowerCase().includes(q) ||
        (u.fullName || u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  // Add Saree Modal / Form state
  const [isAddSareeOpen, setIsAddSareeOpen] = useState(false);
  const [uploadedSareeImages, setUploadedSareeImages] = useState([]); // Start empty, no pre-inserted images!
  const [newSaree, setNewSaree] = useState({
    name: '',
    category: 'Kanchipuram Silk',
    collections: ['Bridal Collection'],
    fabric: 'Pure Silk',
    price: '',
    originalPrice: '',
    stock: 1,
    colors: ['Crimson Red', 'Gold'],
    colorHex: '#7B112C',
    occasion: 'Bridal / Muhurtham',
    shortDescription: '',
    description: '',
    washCare: 'Dry Clean Only. Store wrapped in pure muslin cloth.'
  });

  const toggleThemeCollection = (colName) => {
    setNewSaree((prev) => {
      const current = prev.collections || [];
      const updated = current.includes(colName)
        ? current.filter(c => c !== colName)
        : [...current, colName];
      return { ...prev, collections: updated };
    });
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to completely delete this Fabric Category?")) {
      try {
        await deleteCategory(id);
        showSuccess("Category deleted successfully!");
      } catch (err) {
        console.error("Failed to delete category:", err);
      }
    }
  };

  const openAddSareeModal = (categoryName) => {
    const cat = categoryName || selectedCollection || 'Kanchipuram Silk';
    setSelectedCollection(cat);
    setUploadedSareeImages([]); // Clean slate! No pre-inserted sample images

    let defaultTheme = 'Bridal Collection';
    const lower = (cat || '').toLowerCase();
    if (lower.includes('temple') || lower.includes('gadwal') || lower.includes('pochampally')) defaultTheme = 'Temple Collection';
    else if (lower.includes('wedding') || lower.includes('banarasi') || lower.includes('uppada')) defaultTheme = 'Wedding Silks';
    else if (lower.includes('festive') || lower.includes('soft silk') || lower.includes('chanderi')) defaultTheme = 'Festive Collection';
    else if (lower.includes('daily') || lower.includes('linen') || lower.includes('cotton')) defaultTheme = 'Daily Wear & Linen';
    else if (lower.includes('celebrity') || lower.includes('organza')) defaultTheme = 'Celebrity Picks';

    setNewSaree({
      name: '',
      category: cat,
      collections: [defaultTheme],
      fabric: 'Pure Silk',
      price: '',
      originalPrice: '',
      stock: 1,
      colors: ['Crimson Red', 'Gold'],
      colorHex: '#7B112C',
      occasion: 'Bridal / Muhurtham',
      shortDescription: '',
      description: '',
      washCare: 'Dry Clean Only. Store wrapped in pure muslin cloth.'
    });
    setIsAddSareeOpen(true);
  };

  // Category Manager Form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatTag, setNewCatTag] = useState('Handloom Silk');
  const [newCatImage, setNewCatImage] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Theme Collections Manager Form state
  const [newThemeTitle, setNewThemeTitle] = useState('');
  const [newThemeSubtitle, setNewThemeSubtitle] = useState('');
  const [newThemeBadge, setNewThemeBadge] = useState('');
  const [newThemeImage, setNewThemeImage] = useState('');
  const [newThemeDesc, setNewThemeDesc] = useState('');
  const [newThemeCategoryType, setNewThemeCategoryType] = useState('');
  const [editingThemeId, setEditingThemeId] = useState(null);
  const [editingThemeData, setEditingThemeData] = useState({ name: '', badge: '', subtitle: '', image: '', categoryType: '' });

  // Login handler with Spring Boot 3 REST JWT Authentication (Strict DB Validation)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginAdmin(username, password);
      if (res && res.success) {
        setLoginError('');
      } else {
        setLoginError(res?.message || 'Unauthorized Access. Invalid username or password in database.');
      }
    } catch (err) {
      setLoginError(err?.message || 'Authentication error. Could not connect to database server.');
    }
  };

  // Single File Upload Handler for Covers (Category / Theme Collection)
  // Single cover upload: compress to a Data URL in the browser and keep it
  // in the database (no server disk involved, survives restarts/redeploys).
  const handleSingleFileUpload = async (e, setImageState) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file);
      if (dataUrl) {
        setImageState(dataUrl);
      } else {
        alert('Could not read that image. Please try another file.');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to process image. Please try again.');
    }
  };

  // Multiple File Upload Handler for Sarees (same Data URL approach)
  const handleMultipleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        const dataUrl = await compressImageFile(file);
        if (dataUrl) {
          setUploadedSareeImages((prev) => [...prev, dataUrl]);
        }
      } catch (err) {
        console.error('Failed to upload a saree image:', err);
      }
    }
  };

  // Add Single Image URL
  const handleAddImageUrl = (url) => {
    if (!url || !url.trim()) return;
    setUploadedSareeImages((prev) => [...prev, url.trim()]);
  };

  // Set Primary Catalog Cover Image (moves image to index 0)
  const setAsPrimaryCover = (index) => {
    setUploadedSareeImages((prev) => {
      const updated = [...prev];
      const selected = updated.splice(index, 1)[0];
      return [selected, ...updated];
    });
  };

  // Remove Saree Image
  const removeSareeImage = (index) => {
    setUploadedSareeImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Create New Saree Submit
  const handleCreateSareeSubmit = async (e) => {
    e.preventDefault();
    if (!newSaree.name || !newSaree.price) {
      alert('Please fill in Saree Name and Price.');
      return;
    }

    if (uploadedSareeImages.length === 0) {
      alert('Please upload at least 1 image for the saree.');
      return;
    }

    const selCollections = newSaree.collections && newSaree.collections.length > 0 ? newSaree.collections : ['Bridal Collection'];

    const categoryObj = categories.find(c => c.fabricName === (newSaree.category || selectedCollection)) || categories[0];
    const collectionIds = (selCollections || []).map(cName => {
        const found = themeCollections.find(c => c.collectionName === cName);
        return found ? found.id : null;
    }).filter(id => id !== null);
    if (collectionIds.length === 0 && themeCollections.length > 0) {
        collectionIds.push(themeCollections[0].id);
    }

    const res = await addProduct({
      sareeName: newSaree.name,
      actualPrice: newSaree.originalPrice ? Number(newSaree.originalPrice) : Number(newSaree.price),
      discountedPrice: Number(newSaree.price),
      stockAvailable: Number(newSaree.stock || 1),
      inStock: Number(newSaree.stock || 1) > 0,
      description: newSaree.shortDescription || newSaree.description || 'Premium handloom silk saree.',
      imageUrl: uploadedSareeImages.length > 0 ? uploadedSareeImages.join('|') : '',
      fabricTypeId: categoryObj ? categoryObj.id : null,
      collectionIds: collectionIds,
      isNew: true,
      isBestSeller: false
    });

    if (res && res.success) {
      const createdSaree = res.data || {};
      setSaveSuccessMsg(`Saree "${createdSaree.name || newSaree.name}" added to ${selCollections.length} collections (${selCollections.join(', ')}) successfully!`);
      setIsAddSareeOpen(false);
      setNewSaree({
        name: '',
        category: selectedCollection || 'Kanchipuram Silk',
        collections: ['Bridal Collection'],
        fabric: 'Pure Silk',
        price: '',
        originalPrice: '',
        stock: 1,
        colors: ['Crimson Red', 'Gold'],
        colorHex: '#7B112C',
        occasion: 'Bridal / Muhurtham',
        shortDescription: '',
        description: '',
        washCare: 'Dry Clean Only. Store wrapped in pure muslin cloth.'
      });
      setUploadedSareeImages([]);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } else {
      alert(res?.message || 'Failed to add Saree');
    }
  };

  // Update Collection / Category Catalog Picture Cover
  const handleSaveCategoryCover = (catId) => {
    if (!categoryCoverUrl.trim()) return;
    const cat = categories.find(c => c.id === catId);
    updateCategory(catId, { 
      fabricName: cat.fabricName,
      description: cat.description,
      imageUrl: categoryCoverUrl.trim() 
    });
    setEditingCategoryCover(null);
    setCategoryCoverUrl('');
    setSaveSuccessMsg('Catalog collection cover picture updated successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Remove Category Catalog Picture
  const handleRemoveCategoryCover = (catId) => {
    if (window.confirm('Reset catalog cover picture to default weave image?')) {
      const cat = categories.find(c => c.id === catId);
      updateCategory(catId, { 
        fabricName: cat.fabricName,
        description: cat.description,
        imageUrl: '' 
      });
      setSaveSuccessMsg('Catalog collection cover picture reset.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }
  };

  // Owner Credentials (Username & Password) Change Submit
  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    setPassError('');
    if (newPass !== confirmPass) {
      setPassError('New passwords do not match.');
      return;
    }

    const res = changeOwnerCredentials(currPass, newUsername, newPass);
    if (res.success) {
      setSaveSuccessMsg('Owner Username & Secret Password updated successfully! Please use your new credentials for future logins.');
      setCurrPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => setSaveSuccessMsg(''), 6000);
    } else {
      setPassError(res.message);
    }
  };

  // Unauthenticated Owner Login View
  if (!isAdminLoggedIn) {
    return (
      <div className="admin-login-page py-5 min-vh-80 d-flex align-items-center justify-content-center bg-ivory">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-5">
              <div 
                className="card border-0 rounded-5 p-4 p-md-5 shadow-2xl text-center"
                style={{ background: '#FFFDF8', border: '2px solid #C8A54B' }}
              >
                <div 
                  className="rounded-circle d-inline-flex p-3 mb-3 bg-maroon text-gold shadow-sm"
                  style={{ width: '70px', height: '70px', alignItems: 'center', justifyContent: 'center' }}
                >
                  <GiCrown size={38} />
                </div>

                <span className="font-montserrat text-gold text-uppercase fw-bold" style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>
                  Exclusive Owner Portal
                </span>
                <h2 className="font-serif fw-bold text-maroon mb-2">Sree Padmavathi Silks</h2>
                
                <div className="p-2.5 rounded-3 bg-light-gold mb-4 border-gold text-start font-poppins" style={{ backgroundColor: 'rgba(200, 165, 75, 0.1)', fontSize: '0.8rem' }}>
                  <div className="d-flex align-items-center gap-2 text-maroon fw-bold mb-1">
                    <FiShield className="text-gold" size={16} />
                    <span>Single Owner Security Restricted</span>
                  </div>
                  <span className="text-muted">
                    Only the verified Owner of Sree Padmavathi Silks can log in.
                  </span>
                </div>

                {loginError && (
                  <div className="alert alert-danger font-poppins p-2 text-start mb-3" style={{ fontSize: '0.82rem' }}>
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} autoComplete="off" className="text-start font-poppins d-flex flex-column gap-3">
                  <div>
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                      Owner Username
                    </label>
                    <input 
                      type="text" 
                      required 
                      autoComplete="off"
                      placeholder="Enter owner username"
                      className="form-control border-gold rounded-pill px-3 py-2"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                      Owner Password
                    </label>
                    <div className="position-relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required 
                        autoComplete="new-password"
                        placeholder="Enter secret owner password"
                        className="form-control border-gold rounded-pill px-3 py-2 pe-5"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="position-absolute end-0 top-50 translate-middle-y btn border-0 bg-transparent text-maroon me-2"
                        style={{ zIndex: 10 }}
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-maroon w-100 py-3 rounded-pill font-montserrat fw-bold shadow mt-2">
                    <FiLock className="me-2" /> Login as Verified Owner
                  </button>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Dashboard
  return (
    <div className="admin-dashboard-page py-4 bg-ivory font-poppins">
      <div className="container py-3">
        
        {/* Top Executive Banner */}
        <div className="card border-0 rounded-4 p-4 mb-4 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #7B112C 0%, #580B1F 100%)', border: '1.5px solid #C8A54B' }}>
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle p-2.5 bg-gold text-maroon shadow-sm d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px' }}>
                <GiCrown size={32} />
              </div>
              <div>
                <span className="badge bg-gold text-white font-montserrat px-2.5 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                  SINGLE OWNER DASHBOARD
                </span>
                <h2 className="font-serif fw-bold text-white mb-0" style={{ fontSize: '1.8rem' }}>
                  Collection-Wise Store Management
                </h2>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">


              <button 
                onClick={logoutAdmin} 
                className="btn btn-gold btn-sm rounded-pill font-montserrat fw-semibold"
              >
                <FiLogOut size={14} className="me-1" /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Global Success Notification */}
        {saveSuccessMsg && (
          <div className="alert alert-success border-gold rounded-4 font-montserrat fw-bold d-flex align-items-center gap-2 mb-4 animate__animated animate__fadeIn">
            <FiCheck className="text-success" size={20} />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="d-flex flex-wrap gap-2 mb-4 justify-content-center justify-content-lg-start">
          <button 
            onClick={() => { setActiveTab('collection-wise'); setSelectedCollection(null); }}
            className={`btn rounded-pill font-montserrat fw-bold px-4 py-2 ${activeTab === 'collection-wise' ? 'btn-maroon text-white' : 'btn-outline-gold'}`}
          >
            <FiFolder className="me-1.5" /> Sarees Catalog ({dashboardCounts?.sarees ?? products.length})
          </button>
          <button 
            onClick={() => setActiveTab('theme-collections')}
            className={`btn rounded-pill font-montserrat fw-bold px-4 py-2 ${activeTab === 'theme-collections' ? 'btn-maroon text-white' : 'btn-outline-gold'}`}
          >
            <GiCrown className="me-1.5" size={18} /> Theme Collections ({dashboardCounts?.themes ?? (themeCollections || []).length})
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`btn rounded-pill font-montserrat fw-bold px-4 py-2 ${activeTab === 'categories' ? 'btn-maroon text-white' : 'btn-outline-gold'}`}
          >
            <FiImage className="me-1.5" /> Fabric Categories ({dashboardCounts?.categories ?? categories.length})
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`btn rounded-pill font-montserrat fw-bold px-4 py-2 ${activeTab === 'orders' ? 'btn-maroon text-white' : 'btn-outline-gold'}`}
          >
            <FiShoppingBag className="me-1.5" /> Customer Orders ({dashboardCounts?.orders ?? orderHistory.length})
          </button>
          <button 
            onClick={() => setActiveTab('inquiries')}
            className={`btn rounded-pill font-montserrat fw-bold px-4 py-2 ${activeTab === 'inquiries' ? 'btn-maroon text-white' : 'btn-outline-gold'}`}
          >
            <FiMessageSquare className="me-1.5" /> Customer Queries ({dashboardCounts?.queries ?? (inquiries || []).length})
          </button>
          <button 
            onClick={() => { setActiveTab('reviews-moderation'); fetchAdminReviews(); }}
            className={`btn rounded-pill font-montserrat fw-bold px-4 py-2 ${activeTab === 'reviews-moderation' ? 'btn-maroon text-white' : 'btn-outline-gold'}`}
          >
            <FiStar className="me-1.5" /> Customer Reviews ({dashboardCounts?.reviews ?? adminReviews.length})
          </button>
          {/* <button 
            onClick={() => setActiveTab('users')}
            className={`btn rounded-pill font-montserrat fw-bold px-4 py-2 ${activeTab === 'users' ? 'btn-maroon text-white' : 'btn-outline-gold'}`}
          >
            <FiUsers className="me-1.5" /> Users Management
          </button> */}
          <button 
            onClick={() => setActiveTab('security')}
            className={`btn rounded-pill font-montserrat fw-bold px-4 py-2 ${activeTab === 'security' ? 'btn-maroon text-white' : 'btn-outline-gold'}`}
          >
            <FiKey className="me-1.5" /> Owner Security
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: COLLECTION-WISE SAREE OPERATIONS (Requirement 1) */}
        {/* ========================================================================= */}
        {activeTab === 'collection-wise' && (
          <div>
            {!selectedCollection ? (
              /* Step 1: Select a Collection Card to manage inside */
              <div>
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div>
                    <h4 className="font-serif fw-bold text-maroon mb-1">Select a Collection / Category to Manage</h4>
                    <p className="text-muted" style={{ fontSize: '0.88rem' }}>
                      Click on any Saree Collection below to add, edit, or remove sarees strictly within that specific collection.
                    </p>
                  </div>
                </div>

                <div className="row g-4">
                  {(categories || []).map((cat) => {
                    const exactCount = getCategorySareeCount(cat.fabricName);
                    const collectionSarees = products.filter(p => p.category && p.category.toLowerCase().includes(cat.fabricName.toLowerCase()));
                    return (
                      <div key={cat.id || cat.fabricName} className="col-md-6 col-lg-4">
                        <div 
                          className="card border-0 rounded-4 overflow-hidden shadow-sm border-gold cursor-pointer transition-all hover-lift"
                          onClick={() => setSelectedCollection(cat.fabricName)}
                          style={{ cursor: 'pointer', background: '#FFFDF8', border: '1.5px solid rgba(200, 165, 75, 0.4)' }}
                        >
                          <div className="position-relative" style={{ height: '180px' }}>
                            <img 
                              src={cat.imageUrl} 
                              alt={cat.fabricName} 
                              className="w-100 h-100 object-fit-cover"
                             onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
                            <div className="position-absolute top-0 start-0 w-100 h-100 p-3 d-flex flex-column justify-content-between" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(123, 17, 44, 0.85) 100%)' }}>
                              <span className="badge bg-gold text-white font-montserrat align-self-start px-2.5 py-1 rounded-pill" style={{ fontSize: '0.68rem' }}>
                                {cat.tag || 'Handloom'}
                              </span>
                              <div>
                                <h4 className="font-serif fw-bold text-white mb-0">{cat.fabricName}</h4>
                                <span className={`badge font-montserrat mt-1 ${exactCount > 0 ? 'bg-gold text-white' : 'bg-warning text-dark'}`} style={{ fontSize: '0.72rem' }}>
                                  {exactCount > 0 ? `${exactCount} Sarees Available` : 'OUT OF STOCK'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="card-body p-3 d-flex align-items-center justify-content-between bg-white">
                            <span className="font-montserrat fw-semibold text-maroon" style={{ fontSize: '0.85rem' }}>
                              Open Collection Workspace
                            </span>
                            <span className="btn btn-sm btn-outline-maroon rounded-pill px-3 font-montserrat fw-bold" style={{ fontSize: '0.75rem' }}>
                              Manage ({collectionSarees.length}) →
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Step 2: Inside Specific Selected Collection Workspace */
              <div className="card border-0 rounded-4 p-4 bg-white shadow-sm border-gold">
                
                {/* Collection Workspace Navigation Header */}
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 pb-3 border-bottom border-gold">
                  <div className="d-flex align-items-center gap-3">
                    <button 
                      onClick={() => setSelectedCollection(null)}
                      className="btn btn-outline-maroon btn-sm rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: '38px', height: '38px' }}
                      title="Back to All Collections"
                    >
                      <FiArrowLeft size={18} />
                    </button>
                    <div>
                      <span className="badge bg-gold text-white font-montserrat px-2.5 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                        ACTIVE COLLECTION WORKSPACE
                      </span>
                      <h3 className="font-serif fw-bold text-maroon mb-0">
                        {selectedCollection} Collection
                      </h3>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button 
                      onClick={() => openAddSareeModal(selectedCollection)}
                      className="btn btn-maroon rounded-pill font-montserrat fw-bold px-3 py-2 shadow-sm d-flex align-items-center gap-2"
                      style={{ fontSize: '0.85rem' }}
                    >
                      <FiPlus size={16} />
                      <span>Add Saree to {selectedCollection}</span>
                    </button>
                  </div>
                </div>

                {/* Sarees inside this Collection */}
                {(() => {
                  const collectionSarees = products.filter(p => p.category && p.category.toLowerCase().includes(selectedCollection.toLowerCase()));
                  const filteredSarees = collectionSarees.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

                  return (
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="position-relative flex-grow-1 max-w-400">
                          <input 
                            type="text"
                            className="form-control border-gold rounded-pill ps-5 pe-3"
                            placeholder={`Search inside ${selectedCollection}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ fontSize: '0.88rem' }}
                          />
                          <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                        </div>
                        <span className="font-montserrat fw-semibold text-muted" style={{ fontSize: '0.82rem' }}>
                          Showing {filteredSarees.length} of {collectionSarees.length} Sarees
                        </span>
                      </div>

                      {filteredSarees.length === 0 ? (
                        <div className="text-center py-5 bg-light rounded-4 border-gold">
                          <p className="text-muted font-serif fs-5 mb-3">No sarees found in "{selectedCollection}".</p>
                          <button 
                            onClick={() => openAddSareeModal(selectedCollection)}
                            className="btn btn-gold rounded-pill px-4 font-montserrat fw-bold"
                          >
                            <FiPlus className="me-1" /> Add First Saree to {selectedCollection}
                          </button>
                        </div>
                      ) : (
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4 font-poppins">
                          {(filteredSarees || []).map((saree) => {
                            const isEditing = editingId === saree.id;
                            const currentStock = saree.stockAvailable !== undefined ? saree.stockAvailable : (saree.stock || 0);
                            const isOut = currentStock <= 0;

                            return (
                              <div className="col" key={saree.id}>
                                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative hover-lift" style={{ border: '1.5px solid rgba(200, 165, 75, 0.4)' }}>
                                  
                                  {/* Stock Badge Overlay */}
                                  <div className="position-absolute top-0 start-0 m-2 z-1">
                                    {isEditing ? (
                                      <div className="d-flex align-items-center bg-white rounded-pill shadow-sm border border-gold overflow-hidden px-1" style={{ width: '110px' }}>
                                        <span className="font-montserrat fw-bold text-maroon ps-2 pe-1" style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>Stock:</span>
                                        <input 
                                          type="number"
                                          className="form-control form-control-sm border-0 bg-transparent px-1 py-1 font-montserrat fw-bold text-center"
                                          style={{ fontSize: '0.8rem', boxShadow: 'none' }}
                                          value={editStock}
                                          onChange={(e) => setEditStock(e.target.value)}
                                          title="Stock count"
                                        />
                                      </div>
                                    ) : (
                                      <span className={`badge font-montserrat px-2 py-1 shadow-sm ${isOut ? 'bg-danger text-white' : 'bg-success text-white'}`} style={{ fontSize: '0.75rem' }}>
                                        {isOut ? 'Out of Stock' : `${currentStock} In Stock`}
                                      </span>
                                    )}
                                  </div>

                                  {/* Image Area */}
                                  <div 
                                    className="position-relative cursor-pointer bg-light d-flex align-items-center justify-content-center" 
                                    onClick={() => setZoomImageModal({ url: getProductImageUrl(saree.images && saree.images[0]), title: saree.sareeName || saree.name, zoomLevel: 1 })}
                                    style={{ height: '220px', overflow: 'hidden' }}
                                  >
                                    <img 
                                      src={getProductImageUrl(saree.images && saree.images[0])} 
                                      alt={saree.sareeName || saree.name}
                                      className="w-100 h-100 object-fit-cover transition-all"
                                      onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} 
                                    />
                                    <span className="position-absolute bottom-0 end-0 m-2 bg-gold text-white p-1 rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '13px' }}>
                                      <FiZoomIn />
                                    </span>
                                  </div>

                                  {/* Content Area */}
                                  <div className="card-body d-flex flex-column p-3 bg-white">
                                    <h6 className="fw-bold text-maroon mb-1 font-serif text-truncate" title={saree.sareeName || saree.name} style={{ fontSize: '1.05rem' }}>
                                      {saree.sareeName || saree.name}
                                    </h6>
                                    <span className="text-muted font-poppins d-block mb-3 text-truncate" style={{ fontSize: '0.82rem' }}>
                                      {saree.fabricType?.fabricName || saree.fabric || 'Pure Silk'}
                                    </span>

                                    <div className="d-flex align-items-center justify-content-between mb-3 mt-auto bg-light-gold rounded-3 p-2 border-gold" style={{ backgroundColor: 'rgba(200, 165, 75, 0.08)' }}>
                                      <div className="d-flex flex-column">
                                        <small className="text-muted font-montserrat fw-semibold" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>Selling Price</small>
                                        {isEditing ? (
                                          <input 
                                            type="number"
                                            className="form-control form-control-sm border-gold rounded-pill mt-1 font-montserrat fw-bold text-maroon"
                                            style={{ width: '90px', fontSize: '0.85rem' }}
                                            value={editPrice}
                                            onChange={(e) => setEditPrice(e.target.value)}
                                          />
                                        ) : (
                                          <span className="fw-bold text-maroon font-montserrat mt-1" style={{ fontSize: '1rem' }}>
                                            ₹{(saree.discountedPrice || saree.price || 0).toLocaleString('en-IN')}
                                          </span>
                                        )}
                                      </div>
                                      <div className="d-flex flex-column text-end">
                                        <small className="text-muted font-montserrat fw-semibold" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>Original</small>
                                        {isEditing ? (
                                          <input 
                                            type="number"
                                            className="form-control form-control-sm border-gold rounded-pill mt-1 font-montserrat text-end text-muted"
                                            style={{ width: '80px', fontSize: '0.85rem' }}
                                            value={editOriginalPrice}
                                            onChange={(e) => setEditOriginalPrice(e.target.value)}
                                          />
                                        ) : (
                                          <span className="text-muted text-decoration-line-through font-montserrat mt-1" style={{ fontSize: '0.85rem' }}>
                                            ₹{(saree.actualPrice || saree.originalPrice || saree.discountedPrice || saree.price || 0).toLocaleString('en-IN')}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="d-flex gap-2 justify-content-center">
                                      {isEditing ? (
                                        <button 
                                          onClick={() => {
                                            updateProduct(saree.id, {
                                              sareeName: saree.sareeName || saree.name,
                                              description: saree.description || 'Premium handloom silk saree.',
                                              imageUrl: saree.imageUrl || (saree.images && saree.images.join('|')) || '',
                                              fabricTypeId: saree.fabricTypeId || 1,
                                              collectionIds: saree.collectionIds || [saree.collectionId || 1],
                                              discountedPrice: Number(editPrice),
                                              actualPrice: Number(editOriginalPrice),
                                              stockAvailable: Number(editStock),
                                              inStock: Number(editStock) > 0,
                                              isNew: saree.isNew || true,
                                              isBestSeller: saree.isBestSeller || false
                                            });
                                            setEditingId(null);
                                            setSaveSuccessMsg(`Price & stock for "${saree.name}" updated!`);
                                            setTimeout(() => setSaveSuccessMsg(''), 4000);
                                          }}
                                          className="btn btn-sm btn-success rounded-pill px-4 w-100 fw-bold font-montserrat shadow-sm"
                                        >
                                          <FiSave size={14} className="me-1" /> Save
                                        </button>
                                      ) : (
                                        <>
                                          <button 
                                            onClick={() => setEditingSareePhotosModal({
                                              sareeId: saree.id,
                                              sareeName: saree.name,
                                              images: Array.isArray(saree.images) ? [...saree.images] : [saree.images]
                                            })}
                                            className="btn btn-sm btn-maroon text-white rounded-pill flex-grow-1 d-flex align-items-center justify-content-center gap-1 shadow-sm"
                                            title="Upload Photos"
                                            style={{ fontSize: '0.75rem' }}
                                          >
                                            <FiImage size={13} /> <span className="d-none d-xl-inline">Photos</span>
                                          </button>
                                          <button 
                                            onClick={() => {
                                              setEditingId(saree.id);
                                              setEditPrice(saree.discountedPrice || saree.price);
                                              setEditOriginalPrice(saree.actualPrice || saree.originalPrice || saree.discountedPrice || saree.price);
                                              setEditStock(saree.stockAvailable !== undefined ? saree.stockAvailable : (saree.stock !== undefined ? saree.stock : 1));
                                            }}
                                            className="btn btn-sm btn-outline-maroon rounded-pill flex-grow-1 d-flex align-items-center justify-content-center gap-1 shadow-sm"
                                            title="Edit price & stock"
                                            style={{ fontSize: '0.75rem' }}
                                          >
                                            <FiEdit2 size={13} /> <span className="d-none d-xl-inline">Edit</span>
                                          </button>
                                          <button 
                                            onClick={() => setZoomImageModal({ url: getProductImageUrl(saree.images && saree.images[0]), title: saree.sareeName || saree.name, zoomLevel: 1 })}
                                            className="btn btn-sm btn-outline-gold rounded-pill flex-grow-1 d-flex align-items-center justify-content-center gap-1 shadow-sm"
                                            title="Preview & Zoom Images"
                                            style={{ fontSize: '0.75rem' }}
                                          >
                                            <FiEye size={13} /> <span className="d-none d-xl-inline">Zoom</span>
                                          </button>
                                          <button 
                                            onClick={() => {
                                              if (window.confirm(`Delete saree "${saree.name}" from ${selectedCollection}?`)) {
                                                deleteProduct(saree.id);
                                                setSaveSuccessMsg(`Saree "${saree.name}" removed.`);
                                                setTimeout(() => setSaveSuccessMsg(''), 4000);
                                              }
                                            }}
                                            className="btn btn-sm btn-outline-danger rounded-pill shadow-sm px-2.5"
                                            title="Delete Saree"
                                          >
                                            <FiTrash2 size={14} />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DEDICATED THEME COLLECTIONS CONTROL PANEL (Create/Update/Delete) */}
        {/* ========================================================================= */}
        {activeTab === 'theme-collections' && (
          <div className="card border-0 rounded-4 p-4 bg-white shadow-sm border-gold font-poppins">
            
            {/* Header & Guide */}
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 pb-3 border-bottom border-gold gap-3">
              <div>
                <span className="badge bg-gold text-white font-montserrat px-3 py-1 rounded-pill mb-2" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>
                  👑 OCCASION & LIFESTYLE CURATIONS
                </span>
                <h4 className="font-serif fw-bold text-maroon mb-0">
                  Theme Collections Manager ({(themeCollections || []).length})
                </h4>
                <p className="text-muted mb-0" style={{ fontSize: '0.88rem' }}>
                  Create, update, edit, and delete theme-based saree collections displayed on the website catalog.
                </p>
              </div>
            </div>

            {/* Add New Theme Collection Form */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newThemeTitle.trim()) return;
              const res = await addThemeCollection({
                collectionName: newThemeTitle.trim(),
                subtitle: newThemeSubtitle.trim() || 'Hand-curated luxury silks',
                badge: newThemeBadge.trim() || 'Curated',
                categoryType: newThemeCategoryType || '',
                imageUrl: newThemeImage.trim(),
                description: newThemeDesc.trim() || 'Theme curation tailored for special occasions.'
              });
              
              if (res && (res.success || res.status === 200 || res.id)) {
                setNewThemeTitle('');
                setNewThemeSubtitle('');
                setNewThemeBadge('');
                setNewThemeCategoryType('');
                setNewThemeDesc('');
                setNewThemeImage('');
                setSaveSuccessMsg(`Theme Collection "${newThemeTitle}" created successfully!`);
                setTimeout(() => setSaveSuccessMsg(''), 4000);
              } else {
                alert(res?.message || 'Failed to create collection.');
              }
            }} className="p-4 bg-light-gold rounded-4 border-gold mb-5">
              <h5 className="font-serif fw-bold text-maroon mb-3 d-flex align-items-center gap-2">
                <FiPlus className="text-gold" />
                <span>Create New Theme Collection</span>
              </h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: '0.8rem' }}>Collection Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Royal Reception Edit" 
                    className="form-control border-gold rounded-pill"
                    required 
                    value={newThemeTitle}
                    onChange={(e) => setNewThemeTitle(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: '0.8rem' }}>Badge Tag</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Reception Special" 
                    className="form-control border-gold rounded-pill"
                    value={newThemeBadge}
                    onChange={(e) => setNewThemeBadge(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: '0.8rem' }}>Subtitle</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dual-Tone Brocades" 
                    className="form-control border-gold rounded-pill"
                    value={newThemeSubtitle}
                    onChange={(e) => setNewThemeSubtitle(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold text-maroon" style={{ fontSize: '0.8rem' }}>
                    Collection Cover Photo (Upload File or Enter URL)
                  </label>
                  <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
                    
                    {/* File Upload Button */}
                    <div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="themeCoverFileInput" 
                        className="d-none"
                        onChange={(e) => handleSingleFileUpload(e, setNewThemeImage)} 
                      />
                      <label 
                        htmlFor="themeCoverFileInput" 
                        className="btn btn-outline-maroon rounded-pill font-montserrat fw-bold btn-sm px-3 py-2 d-flex align-items-center gap-1.5 cursor-pointer shadow-sm"
                        style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        <FiUpload size={14} /> Upload Device Image
                      </label>
                    </div>

                    {/* Or URL input */}
                    <div className="flex-grow-1">
                      <input 
                        type="text" 
                        placeholder="Or enter Image Web URL..." 
                        className="form-control border-gold rounded-pill font-poppins"
                        value={newThemeImage}
                        onChange={(e) => setNewThemeImage(e.target.value)}
                      />
                    </div>

                    {/* Live Preview Box & Zoom Button */}
                    {newThemeImage && (
                      <div className="d-flex align-items-center gap-2 bg-white p-1.5 rounded-3 border-gold shadow-sm">
                        <div className="position-relative" style={{ width: '54px', height: '54px' }}>
                          <img 
                            src={newThemeImage} 
                            alt="Cover Preview" 
                            className="w-100 h-100 rounded-2 object-fit-cover border border-gold" 
                           onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
                        </div>
                        <button
                          type="button"
                          onClick={() => setZoomImageModal({ url: newThemeImage, title: newThemeTitle || 'Collection Cover Preview', zoomLevel: 1 })}
                          className="btn btn-sm btn-gold text-white rounded-pill px-2.5 font-montserrat fw-semibold d-flex align-items-center gap-1 shadow-sm"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <FiEye size={13} /> Preview
                        </button>
                      </div>
                    )}

                    <div>
                      <button type="submit" className="btn btn-maroon rounded-pill font-montserrat fw-bold shadow-sm px-4 py-2">
                        <FiPlus className="me-1" /> Save Collection
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Existing Theme Collections List */}
            <h5 className="font-serif fw-bold text-maroon mb-3">Active Theme Collections</h5>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4 font-poppins">
              {(themeCollections || []).map((col) => {
                const isEditing = editingThemeId === col.id;
                const assignedSareesCount = products.filter(p => p.collections?.includes(col.collectionName || col.name)).length;

                return (
                  <div className="col" key={col.id || col.collectionName}>
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative hover-lift" style={{ border: '1.5px solid rgba(200, 165, 75, 0.4)' }}>
                      
                      {/* Image Area */}
                      <div 
                        className="position-relative bg-light d-flex align-items-center justify-content-center cursor-pointer" 
                        onClick={() => !isEditing && setZoomImageModal({ url: col.imageUrl, title: col.collectionName, zoomLevel: 1 })}
                        style={{ height: '180px', overflow: 'hidden' }}
                      >
                        <img 
                          src={isEditing ? editingThemeData.imageUrl : col.imageUrl} 
                          alt={col.collectionName} 
                          className="w-100 h-100 object-fit-cover transition-all"
                          onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} 
                        />
                        {!isEditing && (
                          <span className="position-absolute bottom-0 end-0 m-2 bg-gold text-white p-1 rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '13px' }}>
                            <FiZoomIn />
                          </span>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="card-body d-flex flex-column p-3 bg-white">
                        {isEditing ? (
                          <div className="d-flex flex-column gap-2 mb-3">
                            <input 
                              type="text"
                              className="form-control form-control-sm border-gold rounded-pill fw-bold text-maroon"
                              placeholder="Collection Title"
                              value={editingThemeData.collectionName}
                              onChange={(e) => setEditingThemeData({ ...editingThemeData, collectionName: e.target.value })}
                            />
                            <input 
                              type="text"
                              className="form-control form-control-sm border-gold rounded-pill"
                              placeholder="Badge Tag"
                              value={editingThemeData.badge}
                              onChange={(e) => setEditingThemeData({ ...editingThemeData, badge: e.target.value })}
                            />
                            <textarea 
                              className="form-control form-control-sm border-gold rounded-3 mt-1"
                              placeholder="Description"
                              rows="2"
                              value={editingThemeData.description}
                              onChange={(e) => setEditingThemeData({ ...editingThemeData, description: e.target.value })}
                            />
                            
                            <div className="d-flex align-items-center gap-2 mt-1">
                              <label className="btn btn-sm btn-maroon rounded-pill font-montserrat fw-semibold px-2 py-1 mb-0 cursor-pointer shadow-sm text-nowrap flex-grow-1 text-center" style={{ fontSize: '0.75rem' }}>
                                <FiUpload className="me-1" /> Upload Cover
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="d-none" 
                                  onChange={(e) => {
                                    e.persist && e.persist();
                                    handleSingleFileUpload(e, (url) => setEditingThemeData(prev => ({ ...prev, imageUrl: url })));
                                  }}
                                />
                              </label>
                            </div>
                            <input 
                              type="text"
                              className="form-control form-control-sm border-gold rounded-pill"
                              placeholder="Or paste Image URL..."
                              value={editingThemeData.imageUrl || ''}
                              onChange={(e) => setEditingThemeData({ ...editingThemeData, imageUrl: e.target.value })}
                              style={{ fontSize: '0.75rem' }}
                            />
                          </div>
                        ) : (
                          <>
                            <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                              <span className="badge bg-maroon text-gold font-montserrat shadow-sm" style={{ fontSize: '0.7rem' }}>
                                {assignedSareesCount} Sarees
                              </span>
                              <span className="badge bg-gold text-white font-montserrat shadow-sm text-truncate" style={{ fontSize: '0.7rem', maxWidth: '140px' }} title={col.badge || 'Curated'}>
                                {col.badge || 'Curated'}
                              </span>
                            </div>
                            <h5 className="fw-bold text-maroon mb-1 font-serif text-truncate" title={col.collectionName}>
                              {col.collectionName}
                            </h5>
                            <p className="text-muted font-poppins mb-3" style={{ fontSize: '0.85rem', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={col.description}>
                              {col.description}
                            </p>
                          </>
                        )}

                        {/* Actions */}
                        <div className="d-flex gap-2 justify-content-center mt-auto border-top border-gold pt-3">
                          {isEditing ? (
                            <>
                              <button 
                                onClick={() => {
                                  updateThemeCollection(col.id, editingThemeData);
                                  setEditingThemeId(null);
                                  setSaveSuccessMsg(`Theme Collection "${editingThemeData.collectionName}" updated successfully!`);
                                  setTimeout(() => setSaveSuccessMsg(''), 4000);
                                }} 
                                className="btn btn-sm btn-success rounded-pill flex-grow-1 fw-bold shadow-sm"
                              >
                                <FiSave size={14} className="me-1" /> Save
                              </button>
                              <button 
                                onClick={() => setEditingThemeId(null)} 
                                className="btn btn-sm btn-outline-secondary rounded-pill px-3 shadow-sm"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => {
                                  setEditingThemeId(col.id);
                                  setEditingThemeData({ collectionName: col.collectionName, badge: col.badge, description: col.description, imageUrl: col.imageUrl, categoryType: col.categoryType || '' });
                                }}
                                className="btn btn-sm btn-outline-maroon rounded-pill flex-grow-1 d-flex align-items-center justify-content-center gap-1 shadow-sm"
                                title="Edit Collection Details"
                              >
                                <FiEdit2 size={13} /> <span className="d-none d-sm-inline">Edit</span>
                              </button>
                              <button 
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete theme collection "${col.collectionName}"?`)) {
                                    deleteThemeCollection(col.id);
                                    setSaveSuccessMsg(`Theme Collection "${col.collectionName}" deleted.`);
                                    setTimeout(() => setSaveSuccessMsg(''), 4000);
                                  }
                                }}
                                className="btn btn-sm btn-outline-danger rounded-pill shadow-sm px-3"
                                title="Delete Collection"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: FABRIC CATEGORIES & CATALOG COVERS */}
        {/* ========================================================================= */}
        {activeTab === 'categories' && (
          <div className="card border-0 rounded-4 p-4 bg-white shadow-sm border-gold">
            <h4 className="font-serif fw-bold text-maroon mb-3 pb-2 border-bottom border-gold d-flex align-items-center justify-content-between">
              <span>Catalog Cover Pictures & Category Manager ({categories.length})</span>
            </h4>

            {/* Owner Guide: Category vs Collection */}
            <div className="p-3 mb-4 rounded-3 border-gold font-poppins" style={{ backgroundColor: 'rgba(200, 165, 75, 0.12)' }}>
              <div className="d-flex align-items-center gap-2 fw-bold text-maroon mb-1">
                <GiCrown className="text-gold" size={20} />
                <span>Owner Guide: Difference Between Categories & Collections</span>
              </div>
              <div className="row g-2 mt-1">
                <div className="col-md-6">
                  <div className="p-2.5 bg-white rounded-3 border-gold h-100 shadow-sm">
                    <span className="badge bg-maroon text-gold font-montserrat mb-1" style={{ fontSize: '0.72rem' }}>🧵 CATEGORIES (Weaves & Fabrics)</span>
                    <p className="mb-0 text-muted" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                      Classifies sarees by <strong>pure fabric & traditional handloom technique</strong> (e.g. <em>Kanchipuram Silk</em>, <em>Banarasi Brocade</em>, <em>Gadwal</em>, <em>Linen</em>).
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-2.5 bg-white rounded-3 border-gold h-100 shadow-sm">
                    <span className="badge bg-gold text-white font-montserrat mb-1" style={{ fontSize: '0.72rem' }}>👑 COLLECTIONS (Themes & Events)</span>
                    <p className="mb-0 text-muted" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                      Curates sarees by <strong>occasion, event & lifestyle themes</strong> (e.g. <em>Bridal Edit</em>, <em>Temple Heritage</em>, <em>Wedding Silks</em>, <em>Festive Edition</em>).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Category Form */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newCatName.trim()) return;
              const res = await addCategory({
                fabricName: newCatName.trim(),
                description: newCatTag.trim() || 'Authentic handwoven sarees.',
                imageUrl: newCatImage.trim()
              });
              
              if (res && (res.success || res.status === 200 || res.id)) {
                setNewCatName('');
                setNewCatDesc('');
                setSaveSuccessMsg(`Fabric Category "${newCatName}" added to catalog!`);
                setTimeout(() => setSaveSuccessMsg(''), 4000);
              } else {
                alert(res?.message || 'Failed to create category.');
              }
            }} className="p-4 bg-light rounded-4 border-gold mb-4 font-poppins">
              <h6 className="font-montserrat fw-bold text-maroon mb-3">➕ Add New Fabric Category</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-muted" style={{ fontSize: '0.78rem' }}>Category Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Paithani Silk" 
                    className="form-control border-gold rounded-pill"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted" style={{ fontSize: '0.78rem' }}>Description</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Royal Heritage" 
                    className="form-control border-gold rounded-pill"
                    value={newCatTag}
                    onChange={(e) => setNewCatTag(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold text-maroon" style={{ fontSize: '0.8rem' }}>
                    Category Cover Photo (Upload File or Enter URL)
                  </label>
                  <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
                    
                    {/* File Upload Button */}
                    <div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="catCoverFileInput" 
                        className="d-none"
                        onChange={(e) => handleSingleFileUpload(e, setNewCatImage)} 
                      />
                      <label 
                        htmlFor="catCoverFileInput" 
                        className="btn btn-outline-maroon rounded-pill font-montserrat fw-bold btn-sm px-3 py-2 d-flex align-items-center gap-1.5 cursor-pointer shadow-sm"
                        style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        <FiUpload size={14} /> Upload Device Image
                      </label>
                    </div>

                    {/* Or URL input */}
                    <div className="flex-grow-1">
                      <input 
                        type="text" 
                        placeholder="Or enter Image Web URL..." 
                        className="form-control border-gold rounded-pill font-poppins"
                        value={newCatImage}
                        onChange={(e) => setNewCatImage(e.target.value)}
                      />
                    </div>

                    {/* Live Preview Box & Zoom Button */}
                    {newCatImage && (
                      <div className="d-flex align-items-center gap-2 bg-white p-1.5 rounded-3 border-gold shadow-sm">
                        <div className="position-relative" style={{ width: '54px', height: '54px' }}>
                          <img 
                            src={newCatImage} 
                            alt="Cover Preview" 
                            className="w-100 h-100 rounded-2 object-fit-cover border border-gold" 
                           onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
                        </div>
                        <button
                          type="button"
                          onClick={() => setZoomImageModal({ url: newCatImage, title: newCatName || 'Category Cover Preview', zoomLevel: 1 })}
                          className="btn btn-sm btn-gold text-white rounded-pill px-2.5 font-montserrat fw-semibold d-flex align-items-center gap-1 shadow-sm"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <FiEye size={13} /> Preview
                        </button>
                      </div>
                    )}

                    <div>
                      <button type="submit" className="btn btn-gold text-white rounded-pill font-montserrat fw-bold shadow-sm px-4 py-2">
                        <FiPlus className="me-1" /> Save Category
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </form>

            {/* Categories Table List */}
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4 font-poppins">
              {(categories || []).map((cat) => {
                const exactCount = getCategorySareeCount(cat.fabricName);
                const isEditingCover = editingCategoryCover === cat.id;

                return (
                  <div className="col" key={cat.id || cat.fabricName}>
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative hover-lift" style={{ border: '1.5px solid rgba(200, 165, 75, 0.4)' }}>
                      
                      {/* Image Area */}
                      <div 
                        className="position-relative bg-light d-flex align-items-center justify-content-center cursor-pointer" 
                        onClick={() => !isEditingCover && setZoomImageModal({ url: cat.imageUrl, title: `${cat.fabricName} Cover Picture`, zoomLevel: 1 })}
                        style={{ height: '200px', overflow: 'hidden' }}
                      >
                        <img 
                          src={cat.imageUrl} 
                          alt={cat.fabricName} 
                          className="w-100 h-100 object-fit-cover transition-all"
                          onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} 
                        />
                        {!isEditingCover && (
                          <span className="position-absolute bottom-0 end-0 m-2 bg-gold text-white p-1 rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '13px' }}>
                            <FiZoomIn />
                          </span>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="card-body d-flex flex-column p-3 bg-white">
                        <div className="d-flex justify-content-center mb-2">
                          <span className={`badge font-montserrat shadow-sm ${exactCount > 0 ? 'bg-maroon text-gold' : 'bg-warning text-dark'}`} style={{ fontSize: '0.7rem' }}>
                            {exactCount > 0 ? `${exactCount} Sarees` : 'OUT OF STOCK'}
                          </span>
                        </div>
                        <h5 className="fw-bold text-maroon mb-2 font-serif text-center" title={cat.fabricName}>
                          {cat.fabricName}
                        </h5>
                        <p className="text-muted text-center font-poppins mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                          {cat.description || 'Premium Handloom Fabric'}
                        </p>

                        {/* Actions */}
                        <div className="d-flex flex-column mt-auto border-top border-gold pt-3 mt-3">
                          {isEditingCover ? (
                            <div className="d-flex flex-column gap-2 bg-light-gold rounded-3 border-gold p-2" style={{ backgroundColor: 'rgba(200, 165, 75, 0.08)' }}>
                              <div className="d-flex align-items-center gap-2">
                                {categoryCoverUrl && (
                                  <img 
                                    src={categoryCoverUrl} 
                                    alt="Preview" 
                                    className="rounded border border-gold object-fit-cover shadow-sm" 
                                    style={{ width: '36px', height: '36px' }} 
                                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} 
                                  />
                                )}
                                <label className="btn btn-sm btn-maroon rounded-pill font-montserrat fw-semibold px-2 py-1 mb-0 cursor-pointer shadow-sm text-nowrap flex-grow-1 text-center" style={{ fontSize: '0.75rem' }}>
                                  <FiUpload className="me-1" /> Upload Image
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="d-none" 
                                    onChange={(e) => handleSingleFileUpload(e, setCategoryCoverUrl)}
                                  />
                                </label>
                              </div>
                              <input 
                                type="text"
                                className="form-control form-control-sm border-gold rounded-pill"
                                placeholder="Or paste Image Web URL..."
                                value={categoryCoverUrl}
                                onChange={(e) => setCategoryCoverUrl(e.target.value)}
                                style={{ fontSize: '0.75rem' }}
                              />
                              <div className="d-flex gap-2 mt-1">
                                <button onClick={() => handleSaveCategoryCover(cat.id)} className="btn btn-sm btn-success rounded-pill px-2 fw-bold flex-grow-1 shadow-sm" style={{ fontSize: '0.75rem' }}>
                                  <FiSave className="me-1"/> Save
                                </button>
                                <button onClick={() => setEditingCategoryCover(null)} className="btn btn-sm btn-outline-secondary rounded-pill px-3 shadow-sm" style={{ fontSize: '0.75rem' }}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="d-flex gap-2 justify-content-center">
                              <button 
                                onClick={() => {
                                  setEditingCategoryCover(cat.id);
                                  setCategoryCoverUrl(cat.imageUrl);
                                }}
                                className="btn btn-sm btn-outline-maroon rounded-pill flex-grow-1 d-flex align-items-center justify-content-center gap-1 shadow-sm"
                                title="Update Catalog Cover Picture"
                                style={{ fontSize: '0.75rem' }}
                              >
                                <FiUpload size={13} /> <span className="d-none d-sm-inline">Cover</span>
                              </button>
                              <button 
                                onClick={() => setZoomImageModal({ url: cat.imageUrl, title: `${cat.fabricName} Cover Picture`, zoomLevel: 1 })}
                                className="btn btn-sm btn-outline-gold rounded-pill flex-grow-1 d-flex align-items-center justify-content-center gap-1 shadow-sm"
                                title="Preview & Zoom Cover"
                                style={{ fontSize: '0.75rem' }}
                              >
                                <FiEye size={13} /> <span className="d-none d-sm-inline">Zoom</span>
                              </button>
                              <button 
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="btn btn-sm btn-outline-danger rounded-pill shadow-sm px-2.5"
                                title="Delete Category"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>



          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CUSTOMER ORDERS (Verification & Payment Screenshot Zoom) */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="card border-0 rounded-4 p-4 bg-white shadow-sm border-gold">
            <h4 className="font-serif fw-bold text-maroon mb-3 pb-2 border-bottom border-gold d-flex align-items-center justify-content-between">
              <span>Customer Orders ({orderHistory.length})</span>
            </h4>

            {isOrdersLoading ? (
              <div className="text-center py-5 bg-light rounded-4 border-gold">
                <div className="spinner-border text-gold mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted font-serif fs-5 mb-0">Loading customer orders securely...</p>
              </div>
            ) : ordersError ? (
              <div className="text-center py-5 bg-light rounded-4 border-danger">
                <p className="text-danger font-serif fs-5 mb-0">Error loading orders: {ordersError}</p>
                <button className="btn btn-outline-maroon mt-3" onClick={loadDatabaseOrders}>Retry Loading</button>
              </div>
            ) : orderHistory.length === 0 ? (
              <div className="text-center py-5 bg-light rounded-4 border-gold">
                <p className="text-muted font-serif fs-5 mb-0">No customer orders recorded yet.</p>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 font-poppins">
                {(orderHistory || []).map((ord) => (
                  <div className="col" key={ord.id || ord.orderCode}>
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative hover-lift" style={{ border: '1.5px solid rgba(200, 165, 75, 0.4)' }}>
                      
                      {/* Card Header */}
                      <div className="card-header bg-light-gold border-bottom border-gold p-3 d-flex justify-content-between align-items-start" style={{ backgroundColor: 'rgba(200, 165, 75, 0.08)' }}>
                        <div>
                          <h6 className="fw-bold text-maroon mb-1 font-montserrat">Order #{ord.orderCode || ord.id}</h6>
                          <small className="text-muted d-block" style={{ fontSize: '0.8rem' }}>
                            {ord.orderedAt || ord.date ? new Date(ord.orderedAt || ord.date).toLocaleString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            }) : 'N/A'}
                          </small>
                        </div>
                        <h6 className="fw-bold text-maroon font-montserrat mb-0">₹{(ord.orderTotal || ord.grandTotal || 0).toLocaleString('en-IN')}</h6>
                      </div>

                      {/* Card Body */}
                      <div className="card-body p-3 d-flex flex-column gap-3 bg-white">
                        
                        {/* Customer Details */}
                        <div>
                          <small className="text-muted text-uppercase fw-bold font-montserrat d-block mb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>Customer Details</small>
                          <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{ord.customerName}</div>
                          <div className="text-muted" style={{ fontSize: '0.85rem' }}>{ord.customerPhone}</div>
                          <div className="text-muted" style={{ fontSize: '0.82rem', lineHeight: '1.2' }}>{ord.shippingAddress}</div>
                        </div>

                        {/* Items Ordered */}
                        <div>
                          <small className="text-muted text-uppercase fw-bold font-montserrat d-block mb-2" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>Items Ordered</small>
                          <div className="d-flex flex-wrap gap-1">
                            {ord.items?.map((it, idx) => (
                              <span key={idx} className="badge bg-light text-dark border border-gold" style={{ fontSize: '0.75rem' }}>
                                {it.sareeName || it.productName} (x{it.quantity})
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Actions & Status */}
                        <div className="mt-auto pt-3 border-top border-gold">
                          <small className="text-muted text-uppercase fw-bold font-montserrat d-block mb-2" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>Payment & Status</small>
                          
                          <div className="d-flex gap-2 align-items-center mb-2">
                            <select 
                              className={`form-select form-select-sm rounded-pill fw-semibold flex-grow-1 shadow-sm ${
                                ord.verificationStatus === 'VERIFIED' ? 'bg-success text-white border-success' : 
                                ord.verificationStatus === 'FAILED' ? 'bg-danger text-white border-danger' : 
                                'bg-warning text-dark border-warning'
                              }`}
                              value={ord.verificationStatus || 'PENDING'}
                              onChange={(e) => updateVerificationStatus(ord.id || ord.orderCode, e.target.value)}
                              style={{ fontSize: '0.78rem' }}
                            >
                              <option value="PENDING" className="bg-white text-dark">Paymt: Pending</option>
                              <option value="VERIFIED" className="bg-white text-dark">Paymt: Verified</option>
                              <option value="FAILED" className="bg-white text-dark">Paymt: Rejected</option>
                            </select>

                            {ord.paymentScreenshotUrl || ord.paymentScreenshot ? (
                              <button 
                                onClick={() => setViewScreenshotModal(ord.paymentScreenshotUrl || ord.paymentScreenshot)}
                                className="btn btn-sm btn-gold text-white rounded-pill px-3 font-montserrat fw-semibold d-flex align-items-center justify-content-center gap-1 shadow-sm"
                                style={{ fontSize: '0.78rem' }}
                                title="View Payment Screenshot"
                              >
                                <FiEye size={13} /> <span className="d-none d-sm-inline">Proof</span>
                              </button>
                            ) : null}
                          </div>

                          {(ord.upiId || ord.utrNumber) && (
                            <div className="bg-light p-2 rounded-3 border border-light mb-2 d-flex gap-3">
                              {ord.upiId && <div style={{ fontSize: '0.75rem' }} className="text-muted"><strong>UPI:</strong> {ord.upiId}</div>}
                              {ord.utrNumber && <div style={{ fontSize: '0.75rem' }} className="text-muted"><strong>UTR:</strong> {ord.utrNumber}</div>}
                            </div>
                          )}
                          
                          <select 
                            className={`form-select form-select-sm rounded-pill fw-semibold shadow-sm w-100 ${
                              (ord.orderStatus || ord.status) === 'DELIVERED' ? 'bg-success text-white border-success' :
                              (ord.orderStatus || ord.status) === 'CANCELLED' ? 'bg-danger text-white border-danger' :
                              (ord.orderStatus || ord.status) === 'SHIPPED' ? 'bg-primary text-white border-primary' :
                              (ord.orderStatus || ord.status) === 'CONFIRMED' ? 'bg-info text-dark border-info' :
                              'bg-warning text-dark border-warning'
                            }`}
                            value={ord.orderStatus || ord.status || 'PENDING'}
                            onChange={(e) => updateOrderStatus(ord.id || ord.orderCode, e.target.value)}
                            style={{ fontSize: '0.78rem' }}
                          >
                            <option value="PENDING" className="bg-white text-dark">Ord: Pending</option>
                            <option value="CONFIRMED" className="bg-white text-dark">Ord: Confirmed</option>
                            <option value="SHIPPED" className="bg-white text-dark">Ord: Shipped</option>
                            <option value="DELIVERED" className="bg-white text-dark">Ord: Delivered</option>
                            <option value="CANCELLED" className="bg-white text-dark">Ord: Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CUSTOMER INQUIRIES & MESSAGES */}
        {/* ========================================================================= */}
        {activeTab === 'inquiries' && (
          <div className="card border-0 rounded-4 p-4 bg-white shadow-sm border-gold">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3 pb-2 border-bottom border-gold">
              <div>
                <h4 className="font-serif fw-bold text-maroon mb-0">Customer Inquiries & Custom Weave Requests ({(inquiries || []).length})</h4>
                <p className="text-muted font-poppins mb-0" style={{ fontSize: '0.88rem' }}>
                  Direct customer messages submitted through your online store's contact concierge.
                </p>
              </div>
            </div>

            {(!inquiries || inquiries.length === 0) ? (
              <div className="text-center py-5 bg-light rounded-4 border-gold">
                <p className="text-muted font-serif fs-5 mb-0">No customer queries recorded yet.</p>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 font-poppins">
                {(inquiries || []).map((inq) => {
                  const cleanPhone = inq.phone.replace(/[^0-9]/g, '');
                  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(inq.name)},%20this%20is%20the%20owner%20of%20Sree%20Padmavathi%20Silks.%20Regarding%20your%20Order%20${encodeURIComponent(inq.orderId || 'N/A')}:`;

                  return (
                    <div className="col" key={inq.id || inq.enquiryCode}>
                      <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative hover-lift" style={{ border: '1.5px solid rgba(200, 165, 75, 0.4)' }}>
                        
                        <div className="card-header bg-light-gold border-bottom border-gold p-3 d-flex justify-content-between align-items-start" style={{ backgroundColor: 'rgba(200, 165, 75, 0.08)' }}>
                          <div>
                            <h6 className="fw-bold text-maroon mb-1 font-montserrat">{inq.enquiryCode || inq.id}</h6>
                            <small className="text-muted d-block" style={{ fontSize: '0.78rem' }}>{inq.date}</small>
                          </div>
                          <span className="badge font-montserrat fw-extrabold px-2.5 py-1 rounded-pill" style={{ backgroundColor: 'rgba(123, 17, 44, 0.1)', color: '#7B112C', fontSize: '0.75rem', border: '1px solid rgba(123, 17, 44, 0.3)' }}>
                            Ord: {inq.orderId || 'N/A'}
                          </span>
                        </div>

                        <div className="card-body p-3 d-flex flex-column gap-3 bg-white">
                          
                          {/* Customer Details */}
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-muted text-uppercase fw-bold font-montserrat" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>Customer</small>
                              <span className="badge bg-gold text-white font-montserrat px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                                {inq.sareeInterest || 'General Inquiry'}
                              </span>
                            </div>
                            <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{inq.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>{inq.phone}</div>
                            <div className="text-muted" style={{ fontSize: '0.82rem' }}>{inq.email}</div>
                          </div>

                          {/* Message */}
                          <div>
                            <small className="text-muted text-uppercase fw-bold font-montserrat d-block mb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>Message / Requirement</small>
                            <div className="p-2.5 bg-light rounded-3 border-gold" style={{ fontSize: '0.84rem', lineHeight: '1.5' }}>
                              "{inq.message}"
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="mt-auto pt-3 border-top border-gold">
                            <select 
                              className={`form-select form-select-sm rounded-pill fw-semibold mb-3 shadow-sm ${
                                inq.status === 'Resolved' || inq.status === 'Replied' ? 'bg-success text-white border-success' : 
                                inq.status === 'Closed' || inq.status === 'Dismissed' ? 'bg-secondary text-white border-secondary' : 
                                'bg-warning text-dark border-warning'
                              }`}
                              value={inq.status}
                              onChange={(e) => updateInquiryStatus(inq.id, e.target.value)}
                              style={{ fontSize: '0.8rem' }}
                            >
                              <option value="Pending" className="bg-white text-dark">Status: New / Pending</option>
                              <option value="Replied" className="bg-white text-dark">Status: Replied</option>
                              <option value="Resolved" className="bg-white text-dark">Status: Resolved</option>
                              <option value="Closed" className="bg-white text-dark">Status: Closed</option>
                            </select>

                            <div className="d-flex flex-wrap gap-2">
                              <a 
                                href={whatsappUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-success rounded-pill font-montserrat fw-semibold d-flex align-items-center justify-content-center gap-1 text-white py-1 px-2.5 shadow-sm flex-grow-1"
                                style={{ fontSize: '0.75rem' }}
                              >
                                <FiMessageSquare size={13} />
                                <span>WhatsApp</span>
                              </a>

                              <a 
                                href={`tel:${cleanPhone}`}
                                className="btn btn-sm btn-outline-maroon rounded-pill font-montserrat fw-semibold d-flex align-items-center justify-content-center gap-1 py-1 px-2.5 shadow-sm flex-grow-1"
                                style={{ fontSize: '0.75rem' }}
                              >
                                <FiPhoneCall size={13} />
                                <span>Call</span>
                              </a>

                              <button 
                                onClick={() => {
                                  if (window.confirm(`Delete query "${inq.id}" from ${inq.name}?`)) {
                                    deleteInquiry(inq.id);
                                    setSaveSuccessMsg(`Query ${inq.id} deleted.`);
                                    setTimeout(() => setSaveSuccessMsg(''), 4000);
                                  }
                                }}
                                className="btn btn-sm btn-outline-danger rounded-pill shadow-sm px-2.5"
                                title="Delete Query"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* DEDICATED TAB: CUSTOMER REVIEWS MODERATION */}
        {/* ========================================================================= */}
        {activeTab === 'reviews-moderation' && (
          <div className="card border-0 rounded-4 p-4 bg-white shadow-sm border-gold font-poppins">
            <h4 className="font-serif fw-bold text-maroon mb-3 pb-2 border-bottom border-gold d-flex align-items-center justify-content-between">
              <span>Customer Reviews & Ratings Moderation ({adminReviews.length})</span>
            </h4>

            {reviewsLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-maroon" role="status" />
                <p className="text-muted mt-2 font-poppins">Loading reviews...</p>
              </div>
            ) : adminReviews.length === 0 ? (
              <div className="text-center py-5 bg-light rounded-4 border-gold">
                <p className="text-muted font-serif fs-5 mb-0">No customer reviews submitted yet.</p>
                <small className="text-muted">Real reviews written by verified buyers will appear here for store owner moderation.</small>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                {adminReviews.map((rev) => {
                  const prod = products.find(p => p.id === (rev.sareeId || rev.productId));
                  return (
                    <div className="col" key={rev.id}>
                      <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative hover-lift" style={{ border: '1.5px solid rgba(200, 165, 75, 0.4)' }}>
                        
                        <div className="card-header bg-light-gold border-bottom border-gold p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: 'rgba(200, 165, 75, 0.08)' }}>
                          <div>
                            <h6 className="fw-bold text-maroon mb-1 font-montserrat">{prod ? prod.name : (rev.sareeId || rev.productId)}</h6>
                            <small className="text-muted d-block" style={{ fontSize: '0.78rem' }}>{prod ? prod.category : ''}</small>
                          </div>
                          <span className="badge bg-gold text-white font-montserrat fw-bold py-1 px-2 rounded-pill shadow-sm">
                            ★ {rev.rating} / 5
                          </span>
                        </div>

                        <div className="card-body p-3 d-flex flex-column gap-3 bg-white">
                          
                          {/* Review Details */}
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-muted text-uppercase fw-bold font-montserrat" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>Reviewer</small>
                              <small className="text-muted" style={{ fontSize: '0.75rem' }}>{rev.reviewDate ? new Date(rev.reviewDate).toLocaleDateString('en-IN') : rev.date}</small>
                            </div>
                            <div className="fw-bold text-dark mb-2" style={{ fontSize: '0.9rem' }}>{rev.customerName || rev.name}</div>
                          </div>

                          {/* Review Content */}
                          <div>
                            <small className="text-muted text-uppercase fw-bold font-montserrat d-block mb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>Feedback</small>
                            <div className="fw-bold mb-1" style={{ fontSize: '0.85rem' }}>{rev.title}</div>
                            <div className="p-2.5 bg-light rounded-3 border-gold text-muted" style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                              "{rev.comment}"
                            </div>
                          </div>

                          {/* Actions & Photo */}
                          <div className="mt-auto pt-3 border-top border-gold d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              {rev.hasPhoto ? (
                                <img 
                                  src={`${API_BASE_URL}/reviews/${rev.id}/photo`} 
                                  alt="Review photo" 
                                  className="rounded-3 border border-gold cursor-pointer shadow-sm"
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  onClick={() => setZoomImageModal({ url: `${API_BASE_URL}/reviews/${rev.id}/photo`, title: `Review photo by ${rev.customerName}`, zoomLevel: 1 })}
                                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }}
                                  title="Click to zoom"
                                />
                              ) : (
                                <span className="badge bg-light text-muted border border-gold rounded-pill" style={{ fontSize: '0.7rem' }}>No Photo</span>
                              )}
                            </div>
                            
                            <button 
                              onClick={() => {
                                if (window.confirm(`Delete review by ${rev.name}?`)) {
                                  deleteReview(rev.id);
                                  setSaveSuccessMsg(`Review by ${rev.name} deleted.`);
                                  setTimeout(() => setSaveSuccessMsg(''), 4000);
                                }
                              }}
                              className="btn btn-sm btn-outline-danger rounded-pill px-3 font-montserrat shadow-sm"
                              title="Delete Review"
                            >
                              <FiTrash2 size={13} className="me-1" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: USERS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="card border-0 rounded-4 p-4 bg-white shadow-sm border-gold font-poppins">
            
            {/* Header */}
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 pb-3 border-bottom border-gold">
              <div>
                <span className="badge bg-gold text-white font-montserrat px-3 py-1 rounded-pill mb-2" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>
                  👥 REGISTERED USERS MANAGEMENT
                </span>
                <h4 className="font-serif fw-bold text-maroon mb-0">
                  Users Directory ({allUsers.length} Total)
                </h4>
                <p className="text-muted mb-0" style={{ fontSize: '0.88rem' }}>
                  View, search, block/unblock, and manage roles of all registered users.
                </p>
              </div>
              <button 
                onClick={loadAllUsers}
                className="btn btn-outline-maroon rounded-pill font-montserrat fw-bold px-3 py-2 d-flex align-items-center gap-2 shadow-sm"
                style={{ fontSize: '0.85rem' }}
                disabled={usersLoading}
              >
                <FiRefreshCw size={14} className={usersLoading ? 'spin-animation' : ''} /> Refresh Users
              </button>
            </div>

            {/* User Count Summary Cards */}
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-3">
                <div className="p-3 bg-light rounded-4 border-gold text-center shadow-sm">
                  <div className="font-montserrat fw-bold text-maroon" style={{ fontSize: '1.6rem' }}>{allUsers.length}</div>
                  <small className="text-muted font-montserrat fw-semibold" style={{ fontSize: '0.75rem' }}>Total Users</small>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 bg-light rounded-4 border-gold text-center shadow-sm">
                  <div className="font-montserrat fw-bold" style={{ fontSize: '1.6rem', color: '#198754' }}>{allUsers.filter(u => u.status === 'ACTIVE').length}</div>
                  <small className="text-muted font-montserrat fw-semibold" style={{ fontSize: '0.75rem' }}>Active</small>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 bg-light rounded-4 border-gold text-center shadow-sm">
                  <div className="font-montserrat fw-bold" style={{ fontSize: '1.6rem', color: '#ffc107' }}>{allUsers.filter(u => u.status === 'INACTIVE').length}</div>
                  <small className="text-muted font-montserrat fw-semibold" style={{ fontSize: '0.75rem' }}>Inactive</small>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 bg-light rounded-4 border-gold text-center shadow-sm">
                  <div className="font-montserrat fw-bold" style={{ fontSize: '1.6rem', color: '#dc3545' }}>{allUsers.filter(u => u.status === 'BLOCKED').length}</div>
                  <small className="text-muted font-montserrat fw-semibold" style={{ fontSize: '0.75rem' }}>Blocked</small>
                </div>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="d-flex flex-column flex-md-row align-items-md-center gap-3 mb-4">
              <div className="position-relative flex-grow-1">
                <input 
                  type="text"
                  className="form-control border-gold rounded-pill ps-4 pe-3"
                  placeholder="Search by username, name, email, or phone..."
                  value={usersSearchQuery}
                  onChange={(e) => setUsersSearchQuery(e.target.value)}
                  style={{ fontSize: '0.88rem' }}
                />
                <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="font-montserrat fw-semibold text-muted text-nowrap" style={{ fontSize: '0.82rem' }}>
                  Showing {getFilteredUsers().length} of {allUsers.length}
                </span>
              </div>
            </div>

            {/* Error State */}
            {usersError && (
              <div className="alert alert-danger rounded-4 font-poppins d-flex align-items-center gap-2 mb-4" style={{ fontSize: '0.88rem' }}>
                <FiX className="text-danger" size={18} />
                <span>{usersError}</span>
              </div>
            )}

            {/* Loading State */}
            {usersLoading ? (
              <div className="text-center py-5 bg-light rounded-4 border-gold">
                <div className="spinner-border text-maroon mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted font-serif fs-5 mb-0">Loading registered users...</p>
              </div>
            ) : getFilteredUsers().length === 0 ? (
              <div className="text-center py-5 bg-light rounded-4 border-gold">
                <FiUsers size={40} className="text-gold mb-3" />
                <p className="text-muted font-serif fs-5 mb-1">
                  {allUsers.length === 0 ? 'No registered users found.' : 'No users match your search criteria.'}
                </p>
                <small className="text-muted font-poppins">Try adjusting your search or role filter.</small>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                {getFilteredUsers().map((user) => {
                  const isActing = userActionLoading === user.id;
                  const statusColor = user.status === 'ACTIVE' ? 'bg-success'
                    : user.status === 'INACTIVE' ? 'bg-warning text-dark' 
                    : user.status === 'BLOCKED' ? 'bg-danger' 
                    : 'bg-secondary';

                  return (
                    <div className="col" key={user.id}>
                      <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative hover-lift" style={{ border: '1.5px solid rgba(200, 165, 75, 0.4)', opacity: isActing ? 0.6 : 1 }}>
                        
                        <div className="card-header bg-light-gold border-bottom border-gold p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: 'rgba(200, 165, 75, 0.08)' }}>
                          <div>
                            <h6 className="fw-bold text-maroon mb-0 font-montserrat">{user.username}</h6>
                          </div>
                          <span className={`badge ${statusColor} font-montserrat fw-semibold px-2.5 py-1 rounded-pill text-white shadow-sm`} style={{ fontSize: '0.74rem' }}>
                            {user.status || 'UNKNOWN'}
                          </span>
                        </div>

                        <div className="card-body p-3 d-flex flex-column gap-2 bg-white">
                          
                          {/* User Details */}
                          <div>
                            <small className="text-muted text-uppercase fw-bold font-montserrat d-block mb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>Full Name</small>
                            <div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>{user.fullName || user.name || '—'}</div>
                          </div>

                          <div className="d-flex justify-content-between">
                            <div>
                              <small className="text-muted text-uppercase fw-bold font-montserrat d-block mb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>Email</small>
                              <div className="text-muted text-truncate" style={{ fontSize: '0.84rem', maxWidth: '140px' }} title={user.email}>{user.email || '—'}</div>
                            </div>
                            <div className="text-end">
                              <small className="text-muted text-uppercase fw-bold font-montserrat d-block mb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>Phone</small>
                              <div className="text-muted" style={{ fontSize: '0.84rem' }}>{user.phone || '—'}</div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="mt-auto pt-3 border-top border-gold">
                            <button 
                              onClick={() => handleToggleUserStatus(user.id, user.status)}
                              disabled={isActing}
                              className={`btn w-100 rounded-pill font-montserrat fw-semibold d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm ${
                                user.status === 'BLOCKED' 
                                  ? 'btn-outline-success' 
                                  : 'btn-outline-danger'
                              }`}
                              style={{ fontSize: '0.8rem' }}
                              title={user.status === 'BLOCKED' ? 'Unblock this user' : 'Block this user'}
                            >
                              {user.status === 'BLOCKED' ? (
                                <><FiUserCheck size={14} /> Unblock User</>
                              ) : (
                                <><FiSlash size={14} /> Block User</>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: OWNER SECURITY & CREDENTIALS */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div className="card border-0 rounded-4 p-4 bg-white shadow-sm border-gold max-w-600">
            <h4 className="font-serif fw-bold text-maroon mb-3 pb-2 border-bottom border-gold">
              Owner Credentials & Security Management
            </h4>

            {passError && (
              <div className="alert alert-danger p-2.5 font-poppins mb-3" style={{ fontSize: '0.85rem' }}>
                {passError}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="font-poppins d-flex flex-column gap-3">
              <div>
                <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: '0.85rem' }}>
                  Current Owner Password *
                </label>
                <div className="position-relative">
                  <input 
                    type={showCurrPass ? "text" : "password"}
                    required
                    placeholder="Enter current password to authorize change"
                    className="form-control border-gold rounded-pill px-3 py-2 pe-5"
                    value={currPass}
                    onChange={(e) => setCurrPass(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrPass(!showCurrPass)}
                    className="position-absolute end-0 top-50 translate-middle-y btn border-0 bg-transparent text-maroon me-2"
                    style={{ zIndex: 10 }}
                  >
                    {showCurrPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: '0.85rem' }}>
                  New Owner Username *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. padmavathi_owner or admin"
                  className="form-control border-gold rounded-pill px-3 py-2"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
                <small className="text-muted font-poppins mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                  Current active username: <strong>{ownerUsername}</strong>
                </small>
              </div>

              <div>
                <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: '0.85rem' }}>
                  New Secret Owner Password *
                </label>
                <div className="position-relative">
                  <input 
                    type={showNewPass ? "text" : "password"}
                    required
                    placeholder="At least 4 characters"
                    className="form-control border-gold rounded-pill px-3 py-2 pe-5"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="position-absolute end-0 top-50 translate-middle-y btn border-0 bg-transparent text-maroon me-2"
                    style={{ zIndex: 10 }}
                  >
                    {showNewPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: '0.85rem' }}>
                  Confirm New Password *
                </label>
                <div className="position-relative">
                  <input 
                    type={showConfirmPass ? "text" : "password"}
                    required
                    placeholder="Re-enter new secret password"
                    className="form-control border-gold rounded-pill px-3 py-2 pe-5"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="position-absolute end-0 top-50 translate-middle-y btn border-0 bg-transparent text-maroon me-2"
                    style={{ zIndex: 10 }}
                  >
                    {showConfirmPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-maroon py-2.5 rounded-pill font-montserrat fw-bold px-5 shadow mt-2">
                Update Owner Username & Password
              </button>
            </form>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* ADD SAREE MODAL (WITH MULTIPLE IMAGE UPLOADS & COVER PREVIEW - Req 2 & 4) */}
      {/* ========================================================================= */}
      {isAddSareeOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center p-3"
          style={{ zIndex: 3000, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}
        >
          <div className="card w-100 shadow-2xl border-0 rounded-4 overflow-hidden max-w-850" style={{ background: '#FFFDF8', border: '2px solid #C8A54B', maxHeight: '90vh' }}>
            <div className="card-header bg-maroon text-white p-3 d-flex align-items-center justify-content-between">
              <h5 className="font-serif fw-bold mb-0 text-gold">
                ➕ Add New Saree to {selectedCollection || 'Store Catalog'}
              </h5>
              <button onClick={() => setIsAddSareeOpen(false)} className="btn btn-outline-gold text-white btn-sm rounded-circle">
                <FiX size={18} />
              </button>
            </div>

            <div className="card-body p-4 overflow-auto font-poppins">
              <form onSubmit={handleCreateSareeSubmit} className="row g-3">
                
                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Saree Title / Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Royal Maroon Kanchipuram Pure Zari Silk Saree"
                    className="form-control border-gold rounded-3"
                    value={newSaree.name}
                    onChange={(e) => setNewSaree({ ...newSaree, name: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Weave / Fabric Category *</label>
                  <select 
                    className="form-select border-gold rounded-3"
                    value={newSaree.category}
                    onChange={(e) => setNewSaree({ ...newSaree, category: e.target.value })}
                  >
                    {(categories || []).map((c) => (
                      <option key={c.id || c.fabricName} value={c.fabricName}>{c.fabricName}</option>
                    ))}
                  </select>
                </div>

                {/* MULTI-SELECT THEME COLLECTIONS */}
                <div className="col-12 p-3 bg-light-gold rounded-4 border-gold">
                  <label className="form-label fw-bold text-maroon d-flex align-items-center justify-content-between mb-2">
                    <span>👑 Target Theme Collections (Select Multiple) *</span>
                    <small className="text-muted font-poppins fw-normal" style={{ fontSize: '0.75rem' }}>Click to select all collections for this saree</small>
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {(themeCollections || []).length > 0 ? (themeCollections || []).map((colObj) => {
                      const isSelected = (newSaree.collections || []).includes(colObj.collectionName);
                      return (
                        <button
                          key={colObj.id || colObj.collectionName}
                          type="button"
                          onClick={() => toggleThemeCollection(colObj.collectionName)}
                          className={`btn btn-sm rounded-pill font-montserrat fw-semibold transition-all px-3 py-1.5 ${isSelected ? 'btn-maroon text-white shadow-sm ring-gold' : 'btn-outline-secondary bg-white text-dark'}`}
                          style={{ fontSize: '0.82rem' }}
                        >
                          {isSelected ? `✓ 👑 ${colObj.collectionName}` : `👑 ${colObj.collectionName}`}
                        </button>
                      );
                    }) : (
                      <span className="text-muted" style={{ fontSize: '0.82rem' }}>No theme collections available yet. Add one in the Theme Collections tab!</span>
                    )}
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Selling Price (₹) *</label>
                  <input 
                    type="number" 
                    required
                    placeholder="e.g. 24500"
                    className="form-control border-gold rounded-3"
                    value={newSaree.price}
                    onChange={(e) => setNewSaree({ ...newSaree, price: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Original MRP Price (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 32000"
                    className="form-control border-gold rounded-3"
                    value={newSaree.originalPrice}
                    onChange={(e) => setNewSaree({ ...newSaree, originalPrice: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Initial Stock Quantity</label>
                  <input 
                    type="number" 
                    min="0"
                    className="form-control border-gold rounded-3"
                    value={newSaree.stock}
                    onChange={(e) => setNewSaree({ ...newSaree, stock: Number(e.target.value) })}
                  />
                </div>

                {/* MULTIPLE SAREE IMAGE UPLOADS & CATALOG COVER MANAGEMENT (Req 2 & 4) */}
                <div className="col-12 p-3 bg-light rounded-4 border-gold">
                  <label className="form-label fw-bold text-maroon d-flex align-items-center gap-2 mb-2">
                    <FiImage className="text-gold" size={20} />
                    <span>Upload Multiple Saree Images & Set Catalog Cover</span>
                  </label>
                  
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <label className="btn btn-maroon btn-sm rounded-pill font-montserrat fw-semibold px-3 py-2 cursor-pointer shadow-sm">
                      <FiUpload className="me-1" /> Choose Multiple Files
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="d-none" 
                        onChange={handleMultipleFileUpload}
                      />
                    </label>

                    <button 
                      type="button" 
                      onClick={() => {
                        const url = prompt('Enter Image Web URL:');
                        if (url) handleAddImageUrl(url);
                      }}
                      className="btn btn-outline-gold btn-sm rounded-pill font-montserrat fw-semibold px-3 py-2"
                    >
                      <FiLink className="me-1" /> Add Image URL
                    </button>
                  </div>

                  {/* Image Thumbnails & Cover Selection Gallery */}
                  {uploadedSareeImages.length === 0 ? (
                    <div className="text-center py-4 px-3 bg-white rounded-3 border-gold border-dashed">
                      <FiImage size={32} className="text-gold mb-2" />
                      <h6 className="font-serif fw-bold text-maroon mb-1">No Images Uploaded Yet</h6>
                      <small className="text-muted font-poppins d-block">
                        Click <strong>Choose Multiple Files</strong> or <strong>Add Image URL</strong> above to upload your own saree photos.
                      </small>
                    </div>
                  ) : (
                    <div className="row g-2">
                      {(uploadedSareeImages || []).map((imgUrl, idx) => (
                        <div key={idx} className="col-6 col-md-3">
                          <div className={`card border-0 rounded-3 overflow-hidden shadow-sm position-relative ${idx === 0 ? 'ring-gold border border-gold border-2' : ''}`}>
                            <img 
                              src={imgUrl} 
                              alt={`Saree image ${idx + 1}`} 
                              className="w-100 object-fit-cover"
                              style={{ height: '110px' }}
                             onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
                            {idx === 0 && (
                              <span className="position-absolute top-0 start-0 m-1 badge bg-gold text-white font-montserrat shadow-sm" style={{ fontSize: '0.65rem' }}>
                                ⭐ Catalog Cover
                              </span>
                            )}

                            <div className="p-1.5 bg-white d-flex justify-content-between align-items-center gap-1">
                              {idx !== 0 && (
                                <button 
                                  type="button" 
                                  onClick={() => setAsPrimaryCover(idx)} 
                                  className="btn btn-xs btn-outline-gold p-1 font-montserrat"
                                  title="Set as Catalog Cover"
                                  style={{ fontSize: '0.65rem' }}
                                >
                                  Set Cover
                                </button>
                              )}

                              <button 
                                type="button" 
                                onClick={() => setZoomImageModal({ url: imgUrl, title: `Saree Image ${idx + 1}`, zoomLevel: 1 })} 
                                className="btn btn-xs btn-outline-maroon p-1"
                                title="Preview Image"
                                style={{ fontSize: '0.65rem' }}
                              >
                                👁️ Preview
                              </button>

                              <button 
                                type="button" 
                                onClick={() => removeSareeImage(idx)} 
                                className="btn btn-xs btn-outline-danger p-1"
                                title="Remove"
                                style={{ fontSize: '0.65rem' }}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Short Description</label>
                  <input 
                    type="text" 
                    placeholder="Brief highlight (e.g. Pure zari woven Kanchipuram bridal saree with grand contrasting brocade pallu)"
                    className="form-control border-gold rounded-3"
                    value={newSaree.shortDescription}
                    onChange={(e) => setNewSaree({ ...newSaree, shortDescription: e.target.value })}
                  />
                </div>

                <div className="col-12 text-end pt-3">
                  <button type="button" onClick={() => setIsAddSareeOpen(false)} className="btn btn-outline-secondary rounded-pill me-2 px-4">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-gold rounded-pill px-5 font-montserrat fw-bold shadow-sm">
                    Save Saree to Collection
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SAREE PHOTOS MODAL (Upload Local Device Photos or Web URLs for Existing Saree) */}
      {/* ========================================================================= */}
      {editingSareePhotosModal && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center p-3"
          style={{ zIndex: 3500, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
        >
          <div className="card w-100 shadow-2xl border-0 rounded-4 overflow-hidden max-w-750" style={{ background: '#FFFDF8', border: '2px solid #C8A54B', maxHeight: '90vh' }}>
            <div className="card-header bg-maroon text-white p-3 d-flex align-items-center justify-content-between">
              <h5 className="font-serif fw-bold mb-0 text-gold d-flex align-items-center gap-2">
                <FiImage size={20} />
                <span>Manage Photos for: {editingSareePhotosModal.sareeName}</span>
              </h5>
              <button onClick={() => setEditingSareePhotosModal(null)} className="btn btn-outline-gold text-white btn-sm rounded-circle">
                <FiX size={18} />
              </button>
            </div>

            <div className="card-body p-4 overflow-auto font-poppins">
              <div className="d-flex flex-wrap gap-2 mb-3">
                <label className="btn btn-maroon btn-sm rounded-pill font-montserrat fw-semibold px-3 py-2 cursor-pointer shadow-sm">
                  <FiUpload className="me-1" /> Choose Local Device Photos
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="d-none" 
                    onChange={async (e) => {
                      const files = Array.from(e.target.files);
                      if (files.length === 0) return;
                      const compressedList = await Promise.all(files.map(f => compressImageFile(f)));
                      const valid = compressedList.filter(Boolean);
                      if (valid.length > 0) {
                        setEditingSareePhotosModal(prev => ({
                          ...prev,
                          images: [...prev.images, ...valid]
                        }));
                      }
                    }}
                  />
                </label>

                <button 
                  type="button" 
                  onClick={() => {
                    const url = prompt('Enter Image Web URL:');
                    if (url && url.trim()) {
                      setEditingSareePhotosModal(prev => ({
                        ...prev,
                        images: [...prev.images, url.trim()]
                      }));
                    }
                  }}
                  className="btn btn-outline-gold btn-sm rounded-pill font-montserrat fw-semibold px-3 py-2"
                >
                  <FiLink className="me-1" /> Add Image URL
                </button>
              </div>

              {editingSareePhotosModal.images.length === 0 ? (
                <div className="text-center py-4 px-3 bg-light rounded-3 border-gold border-dashed">
                  <FiImage size={32} className="text-gold mb-2" />
                  <h6 className="font-serif fw-bold text-maroon mb-1">No Photos Remaining</h6>
                  <small className="text-muted font-poppins">Please upload at least 1 photo for this saree.</small>
                </div>
              ) : (
                <div className="row g-2 mb-3">
                  {(editingSareePhotosModal.images || []).map((imgUrl, idx) => (
                    <div key={idx} className="col-6 col-md-3">
                      <div className={`card border-0 rounded-3 overflow-hidden shadow-sm position-relative ${idx === 0 ? 'ring-gold border border-gold border-2' : ''}`}>
                        <img 
                          src={imgUrl} 
                          alt={`Saree photo ${idx + 1}`} 
                          className="w-100 object-fit-cover"
                          style={{ height: '110px' }}
                         onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
                        {idx === 0 && (
                          <span className="position-absolute top-0 start-0 m-1 badge bg-gold text-white font-montserrat shadow-sm" style={{ fontSize: '0.65rem' }}>
                            ⭐ Main Cover
                          </span>
                        )}

                        <div className="p-1.5 bg-white d-flex justify-content-between align-items-center gap-1">
                          {idx !== 0 ? (
                            <button 
                              type="button" 
                              onClick={() => {
                                setEditingSareePhotosModal(prev => {
                                  const updated = [...prev.images];
                                  const sel = updated.splice(idx, 1)[0];
                                  return { ...prev, images: [sel, ...updated] };
                                });
                              }}
                              className="btn btn-sm btn-outline-maroon p-1 font-montserrat"
                              style={{ fontSize: '0.68rem' }}
                              title="Set as Main Cover Photo"
                            >
                              Set Cover
                            </button>
                          ) : (
                            <span className="text-gold fw-bold" style={{ fontSize: '0.68rem' }}>Main</span>
                          )}

                          <button 
                            type="button" 
                            onClick={() => {
                              setEditingSareePhotosModal(prev => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== idx)
                              }));
                            }}
                            className="btn btn-sm btn-outline-danger p-1"
                            title="Remove Photo"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="d-flex justify-content-end gap-2 border-top border-gold pt-3">
                <button 
                  type="button" 
                  onClick={() => setEditingSareePhotosModal(null)} 
                  className="btn btn-outline-secondary rounded-pill font-montserrat fw-semibold px-4"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (editingSareePhotosModal.images.length === 0) {
                      alert('Please upload at least 1 image for the saree.');
                      return;
                    }
                    const fullSaree = products.find(s => s.id === editingSareePhotosModal.sareeId) || {};
                    updateProduct(editingSareePhotosModal.sareeId, {
                      sareeName: fullSaree.sareeName || fullSaree.name,
                      description: fullSaree.description || 'Premium handloom silk saree.',
                      imageUrl: editingSareePhotosModal.images.join('|'),
                      fabricTypeId: fullSaree.fabricTypeId || 1,
                      collectionIds: fullSaree.collectionIds || [fullSaree.collectionId || 1],
                      discountedPrice: fullSaree.discountedPrice || fullSaree.price || 0,
                      actualPrice: fullSaree.actualPrice || fullSaree.originalPrice || fullSaree.price || 0,
                      stockAvailable: fullSaree.stockAvailable || fullSaree.stock || 1,
                      inStock: (fullSaree.stockAvailable || fullSaree.stock || 1) > 0,
                      isNew: fullSaree.isNew || true,
                      isBestSeller: fullSaree.isBestSeller || false
                    });
                    setEditingSareePhotosModal(null);
                    setSaveSuccessMsg(`Photos for "${editingSareePhotosModal.sareeName}" updated successfully!`);
                    setTimeout(() => setSaveSuccessMsg(''), 4000);
                  }} 
                  className="btn btn-success rounded-pill font-montserrat fw-bold px-4 shadow-sm"
                >
                  <FiSave className="me-1" /> Save All Photos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IMAGE PREVIEW LIGHTBOX MODAL (WITH INTERACTIVE DIRECT TOUCH/HOVER ZOOM) */}
      {/* ========================================================================= */}
      {zoomImageModal && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 4000, backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}
          onClick={() => {
            setZoomImageModal(null);
            setScreenshotZoomed(false);
          }}
        >
          <div className="position-relative bg-dark rounded-4 p-3 shadow-2xl text-center max-w-800 w-100" onClick={(e) => e.stopPropagation()}>
            
            {/* Clean Header Toolbar (No Zoom In / Zoom Out buttons) */}
            <div className="d-flex align-items-center justify-content-between mb-3 text-white px-2">
              <span className="font-serif fw-bold text-gold fs-5">
                <FiEye className="me-2 text-gold" />
                {zoomImageModal.title || 'Image Preview'}
              </span>
              <button 
                onClick={() => {
                  setZoomImageModal(null);
                  setScreenshotZoomed(false);
                }}
                className="btn btn-outline-danger btn-sm rounded-circle ms-2"
                title="Close Preview"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Viewport with Direct Click/Hover Zoom Features */}
            <div 
              className="overflow-hidden rounded-3 bg-black p-2 d-flex align-items-center justify-content-center position-relative" 
              style={{ maxHeight: '72vh', minHeight: '380px' }}
            >
              <img 
                src={zoomImageModal.url} 
                alt="Image Preview" 
                className="img-fluid rounded-3 transition-all"
                onClick={() => setScreenshotZoomed(!screenshotZoomed)} onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }}
                onMouseMove={handleScreenshotMouseMove}
                style={{
                  cursor: screenshotZoomed ? 'zoom-out' : 'zoom-in',
                  transform: screenshotZoomed ? 'scale(2.2)' : 'scale(1)',
                  transformOrigin: screenshotOrigin,
                  transition: screenshotZoomed ? 'transform 0.1s ease-out' : 'transform 0.3s ease',
                  maxHeight: '65vh',
                  objectFit: 'contain'
                }}
              />
            </div>

            <div className="text-white-50 font-poppins mt-2 d-flex align-items-center justify-content-center gap-2" style={{ fontSize: '0.82rem' }}>
              <span>🔍 Click or tap photo to zoom into details • Move cursor to pan weave texture</span>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAYMENT SCREENSHOT PREVIEW MODAL (WITH DIRECT IMAGE-BASED ZOOM - NO BUTTONS) */}
      {/* ========================================================================= */}
      {viewScreenshotModal && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 3500, backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}
          onClick={() => { setViewScreenshotModal(null); setScreenshotZoomed(false); }}
        >
          <div 
            className="position-relative bg-white p-4 rounded-4 shadow-2xl overflow-hidden" 
            style={{ maxWidth: '780px', width: '100%', border: '2px solid #C8A54B' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => { setViewScreenshotModal(null); setScreenshotZoomed(false); }}
              className="btn btn-outline-danger btn-sm rounded-circle position-absolute top-0 end-0 m-3 z-3 bg-white shadow-sm"
              style={{ width: '36px', height: '36px' }}
            >
              <FiX size={20} />
            </button>

            <div className="text-center mb-2">
              <h5 className="font-serif fw-bold text-maroon mb-1">Customer UPI Payment Screenshot Preview</h5>
              <div className="badge bg-gold-subtle text-maroon font-montserrat fw-semibold px-3 py-1 rounded-pill" style={{ backgroundColor: 'rgba(200, 165, 75, 0.15)', fontSize: '0.78rem' }}>
                💡 Click directly on the image to toggle 2.5x detail zoom & move mouse to pan details
              </div>
            </div>

            {/* Direct Image Interactive Zoom Viewport (No Buttons Needed) */}
            <div 
              className="overflow-hidden rounded-3 border border-gold bg-dark d-flex align-items-center justify-content-center position-relative mt-3"
              style={{
                maxHeight: '68vh',
                minHeight: '380px',
                cursor: screenshotZoomed ? 'zoom-out' : 'zoom-in'
              }}
              onClick={() => setScreenshotZoomed(!screenshotZoomed)}
              onMouseMove={handleScreenshotMouseMove}
            >
              <img 
                src={viewScreenshotModal} 
                alt="Customer Payment Screenshot" 
                className="img-fluid rounded-3 transition-all"
                style={{
                  maxHeight: '65vh',
                  objectFit: 'contain',
                  transform: screenshotZoomed ? 'scale(2.5)' : 'scale(1)',
                  transformOrigin: screenshotOrigin,
                  transition: screenshotZoomed ? 'transform 0.1s ease-out' : 'transform 0.25s ease'
                }}
               onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3 font-poppins text-muted" style={{ fontSize: '0.8rem' }}>
              <span>{screenshotZoomed ? '🔍 2.5x Detail Zoom Active (Move mouse to pan screenshot)' : '🔎 Click image for 2.5x detail zoom'}</span>
              <button 
                onClick={() => { setViewScreenshotModal(null); setScreenshotZoomed(false); }}
                className="btn btn-sm btn-gold rounded-pill px-4 font-montserrat fw-bold shadow-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
