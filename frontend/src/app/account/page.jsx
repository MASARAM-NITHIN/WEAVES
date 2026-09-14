'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAddressesApi, addAddressApi, updateAddressApi, deleteAddressApi, fetchWishlistApi, removeFromWishlistApi, fetchCustomerProfileApi, updateCustomerProfileApi } from '../../lib/apiClient';

/* ─── Theme Tokens ─── */
const GOLD = '#D4A853';
const GOLD_LIGHT = '#F0D78C';
const MAROON = '#8B1E3F';
const BG_DARK = '#1a0a0a';

/* ─── Keyframes ─── */
const keyframesCSS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }
  @media (max-width: 768px) {
    .account-grid { grid-template-columns: 1fr !important; }
    .tab-bar { flex-wrap: wrap !important; }
  }
`;

/* ─── Inline Styles ─── */
const s = {
  page: {
    minHeight: '100vh',
    background: `linear-gradient(160deg, ${BG_DARK} 0%, #2d1117 40%, #1a0a1a 70%, #0d0d1a 100%)`,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: '#fff',
    paddingBottom: '60px',
  },
  header: {
    padding: '32px 40px 24px',
    borderBottom: `1px solid rgba(212,168,83,0.12)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  avatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${GOLD} 0%, #B8860B 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '700',
    color: BG_DARK,
    flexShrink: 0,
  },
  greeting: {
    fontSize: '24px',
    fontWeight: '700',
    background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  greetingSub: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.45)',
    marginTop: '2px',
  },
  backLink: {
    color: GOLD,
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    padding: '10px 20px',
    border: `1px solid rgba(212,168,83,0.3)`,
    borderRadius: '10px',
    transition: 'all 0.25s ease',
  },
  tabBar: {
    display: 'flex',
    gap: '4px',
    padding: '20px 40px 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  tab: {
    padding: '14px 28px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    letterSpacing: '0.3px',
  },
  tabActive: {
    color: GOLD,
    borderBottomColor: GOLD,
    background: 'rgba(212,168,83,0.06)',
  },
  content: {
    padding: '32px 40px',
    animation: 'fadeUp 0.4s ease',
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(212,168,83,0.12)',
    borderRadius: '20px',
    padding: '32px',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px',
  },
  infoItem: {
    padding: '20px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  infoLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
  },
  infoValue: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#fff',
  },
  editBtn: {
    padding: '10px 24px',
    background: 'transparent',
    border: `1px solid rgba(212,168,83,0.3)`,
    borderRadius: '10px',
    color: GOLD,
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  goldBtn: {
    padding: '12px 28px',
    background: `linear-gradient(135deg, ${GOLD} 0%, #B8860B 100%)`,
    border: 'none',
    borderRadius: '12px',
    color: BG_DARK,
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  dangerBtn: {
    padding: '8px 16px',
    background: 'rgba(220,53,69,0.1)',
    border: '1px solid rgba(220,53,69,0.3)',
    borderRadius: '8px',
    color: '#f87171',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: 'rgba(255,255,255,0.4)',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.5,
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '8px',
    color: 'rgba(255,255,255,0.6)',
  },
  emptySub: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.35)',
  },
  /* Modal */
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '24px',
  },
  modal: {
    background: '#1e1218',
    border: `1px solid rgba(212,168,83,0.2)`,
    borderRadius: '20px',
    padding: '36px',
    width: '100%',
    maxWidth: '520px',
    animation: 'modalIn 0.3s ease',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '24px',
  },
  modalInput: {
    width: '100%',
    padding: '13px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    marginBottom: '16px',
    boxSizing: 'border-box',
    transition: 'border 0.2s ease',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
  },
  cancelBtn: {
    padding: '10px 22px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  /* Order & Wishlist specific */
  orderCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '14px',
    marginBottom: '12px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  badge: {
    padding: '5px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  wishlistGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px',
  },
  wishlistCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  wishlistImg: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    background: 'rgba(255,255,255,0.05)',
  },
  wishlistBody: {
    padding: '16px',
  },
  spinner: {
    width: '28px',
    height: '28px',
    border: `3px solid rgba(212,168,83,0.2)`,
    borderTopColor: GOLD,
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    margin: '40px auto',
  },
  addressCard: {
    padding: '20px 24px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    flexWrap: 'wrap',
  },
  addressActions: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
  },
};

const TABS = [
  { key: 'profile', label: 'Profile', icon: '👤' },
  { key: 'orders', label: 'Orders', icon: '📦' },
  { key: 'addresses', label: 'Addresses', icon: '📍' },
  { key: 'wishlist', label: 'Wishlist', icon: '❤️' },
];

/* ═══════════ Component ═══════════ */

export default function AccountPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  /* Address modal state */
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    type: 'Home',
  });

  /* ── Auth guard ── */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, router]);

  /* ── Fetch tab data ── */
  const fetchTabData = useCallback(async (tab) => {
    setDataLoading(true);
    try {
      switch (tab) {
        case 'orders': {
          const res = await getOrders();
          setOrders(res?.data || res || []);
          break;
        }
        case 'addresses': {
          const res = await getAddresses();
          setAddresses(res?.data || res || []);
          break;
        }
        case 'wishlist': {
          const res = await getWishlist();
          setWishlist(res?.data || res || []);
          break;
        }
        default:
          break;
      }
    } catch {
      /* silent — empty states handle it */
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && activeTab !== 'profile') {
      fetchTabData(activeTab);
    }
  }, [activeTab, isAuthenticated, fetchTabData]);

  /* ── Address CRUD ── */
  const openAddressModal = (addr = null) => {
    if (addr) {
      setEditingAddress(addr);
      setAddressForm({
        fullName: addr.fullName || '',
        phone: addr.phone || '',
        addressLine1: addr.addressLine1 || '',
        addressLine2: addr.addressLine2 || '',
        city: addr.city || '',
        state: addr.state || '',
        pincode: addr.pincode || '',
        type: addr.type || 'Home',
      });
    } else {
      setEditingAddress(null);
      setAddressForm({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', type: 'Home' });
    }
    setShowModal(true);
  };

  const handleSaveAddress = async () => {
    try {
      if (editingAddress) {
        await updateAddress(editingAddress._id || editingAddress.id, addressForm);
      } else {
        await addAddress(addressForm);
      }
      setShowModal(false);
      fetchTabData('addresses');
    } catch {
      /* handle silently */
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Remove this address?')) return;
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => (a._id || a.id) !== id));
    } catch {
      /* handle silently */
    }
  };

  const handleRemoveWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((p) => (p._id || p.id) !== productId));
    } catch {
      /* handle silently */
    }
  };

  /* ── Loading / auth gate ── */
  if (authLoading || !isAuthenticated) {
    return (
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={s.spinner} />
      </div>
    );
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const getStatusBadge = (status) => {
    const map = {
      delivered: { bg: 'rgba(34,197,94,0.12)', color: '#86efac', border: 'rgba(34,197,94,0.3)' },
      shipped: { bg: 'rgba(59,130,246,0.12)', color: '#93c5fd', border: 'rgba(59,130,246,0.3)' },
      processing: { bg: 'rgba(234,179,8,0.12)', color: '#fde68a', border: 'rgba(234,179,8,0.3)' },
      cancelled: { bg: 'rgba(220,53,69,0.12)', color: '#fca5a5', border: 'rgba(220,53,69,0.3)' },
    };
    const st = map[(status || '').toLowerCase()] || map.processing;
    return { ...s.badge, background: st.bg, color: st.color, border: `1px solid ${st.border}` };
  };

  /* ─── Render Tabs ─── */

  const renderProfile = () => (
    <div style={s.card}>
      <div style={{ ...s.sectionTitle }}>
        <span>📋</span> Personal Information
      </div>
      <div className="account-grid" style={s.infoGrid}>
        <div style={s.infoItem}>
          <div style={s.infoLabel}>Full Name</div>
          <div style={s.infoValue}>{user?.fullName || '—'}</div>
        </div>
        <div style={s.infoItem}>
          <div style={s.infoLabel}>Email</div>
          <div style={s.infoValue}>{user?.email || '—'}</div>
        </div>
        <div style={s.infoItem}>
          <div style={s.infoLabel}>Phone</div>
          <div style={s.infoValue}>{user?.phone || '—'}</div>
        </div>
        <div style={s.infoItem}>
          <div style={s.infoLabel}>Username</div>
          <div style={s.infoValue}>{user?.username || '—'}</div>
        </div>
      </div>
      <div style={{ marginTop: '28px' }}>
        <button
          style={s.editBtn}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(212,168,83,0.1)';
            e.target.style.borderColor = GOLD;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.borderColor = 'rgba(212,168,83,0.3)';
          }}
        >
          ✏️ Edit Profile
        </button>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div style={s.card}>
      <div style={s.sectionTitle}><span>📦</span> Your Orders</div>
      {dataLoading ? (
        <div style={s.spinner} />
      ) : orders.length === 0 ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>🛒</div>
          <div style={s.emptyText}>No orders yet</div>
          <div style={s.emptySub}>Your order history will appear here once you make a purchase.</div>
          <Link href="/" style={{ ...s.goldBtn, marginTop: '24px', textDecoration: 'none', display: 'inline-flex' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        (orders || []).map((order) => (
          <div key={order._id || order.id} style={s.orderCard}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                Order #{(order._id || order.id || '').slice(-8).toUpperCase()}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontWeight: '600', color: GOLD }}>
                ₹{order.totalAmount?.toLocaleString('en-IN') || '0'}
              </span>
              <span style={getStatusBadge(order.status)}>
                {order.status || 'Processing'}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderAddresses = () => (
    <div style={s.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={s.sectionTitle}><span>📍</span> Saved Addresses</div>
        <button style={s.goldBtn} onClick={() => openAddressModal()}>
          + Add Address
        </button>
      </div>
      {dataLoading ? (
        <div style={s.spinner} />
      ) : addresses.length === 0 ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>🏠</div>
          <div style={s.emptyText}>No saved addresses</div>
          <div style={s.emptySub}>Add a delivery address for faster checkout.</div>
        </div>
      ) : (
        (addresses || []).map((addr) => (
          <div key={addr._id || addr.id} style={s.addressCard}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {addr.fullName}
                <span style={{ ...s.badge, background: 'rgba(212,168,83,0.1)', color: GOLD, border: `1px solid rgba(212,168,83,0.2)`, fontSize: '11px' }}>
                  {addr.type || 'Home'}
                </span>
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
                {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                {addr.city}, {addr.state} – {addr.pincode}<br />
                📞 {addr.phone}
              </div>
            </div>
            <div style={s.addressActions}>
              <button
                style={s.editBtn}
                onClick={() => openAddressModal(addr)}
              >
                Edit
              </button>
              <button
                style={s.dangerBtn}
                onClick={() => handleDeleteAddress(addr._id || addr.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderWishlist = () => (
    <div style={s.card}>
      <div style={s.sectionTitle}><span>❤️</span> Your Wishlist</div>
      {dataLoading ? (
        <div style={s.spinner} />
      ) : wishlist.length === 0 ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>💝</div>
          <div style={s.emptyText}>Your wishlist is empty</div>
          <div style={s.emptySub}>Save items you love and come back to them later.</div>
          <Link href="/" style={{ ...s.goldBtn, marginTop: '24px', textDecoration: 'none', display: 'inline-flex' }}>
            Browse Collection
          </Link>
        </div>
      ) : (
        <div style={s.wishlistGrid}>
          {(wishlist || []).map((product) => (
            <div
              key={product._id || product.id}
              style={s.wishlistCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212,168,83,0.3)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} style={s.wishlistImg}  onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-saree.jpg'; }} />
              ) : (
                <div style={{ ...s.wishlistImg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>🧵</div>
              )}
              <div style={s.wishlistBody}>
                <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '6px' }}>{product.name}</div>
                <div style={{ color: GOLD, fontWeight: '700', fontSize: '16px', marginBottom: '12px' }}>
                  ₹{product.price?.toLocaleString('en-IN') || '—'}
                </div>
                <button
                  style={{ ...s.dangerBtn, width: '100%', textAlign: 'center', justifyContent: 'center', display: 'flex' }}
                  onClick={() => handleRemoveWishlist(product._id || product.id)}
                >
                  Remove from Wishlist
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const tabContent = {
    profile: renderProfile,
    orders: renderOrders,
    addresses: renderAddresses,
    wishlist: renderWishlist,
  };

  return (
    <>
      <style>{keyframesCSS}</style>
      <div style={s.page}>
        {/* Header */}
        <header style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.avatar}>{initials}</div>
            <div>
              <div style={s.greeting}>Welcome, {user?.fullName?.split(' ')[0] || 'User'}</div>
              <div style={s.greetingSub}>Manage your account, orders & more</div>
            </div>
          </div>
          <Link href="/" style={s.backLink}>← Back to Store</Link>
        </header>

        {/* Tabs */}
        <nav className="tab-bar" style={s.tabBar}>
          {(TABS || []).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                ...s.tab,
                ...(activeTab === tab.key ? s.tabActive : {}),
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.key) e.target.style.color = 'rgba(255,255,255,0.8)';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.key) e.target.style.color = 'rgba(255,255,255,0.5)';
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div key={activeTab} style={s.content}>
          {tabContent[activeTab]()}
        </div>

        {/* Address Modal */}
        {showModal && (
          <div style={s.overlay} onClick={() => setShowModal(false)}>
            <div style={s.modal} onClick={(e) => e.stopPropagation()}>
              <h3 style={s.modalTitle}>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>

              <input
                placeholder="Full Name"
                value={addressForm.fullName}
                onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                style={s.modalInput}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(212,168,83,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
              <input
                placeholder="Phone Number"
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                style={s.modalInput}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(212,168,83,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
              <input
                placeholder="Address Line 1"
                value={addressForm.addressLine1}
                onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                style={s.modalInput}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(212,168,83,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
              <input
                placeholder="Address Line 2 (Optional)"
                value={addressForm.addressLine2}
                onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                style={s.modalInput}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(212,168,83,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  placeholder="City"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  style={{ ...s.modalInput, flex: 1 }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(212,168,83,0.4)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
                <input
                  placeholder="State"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  style={{ ...s.modalInput, flex: 1 }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(212,168,83,0.4)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  placeholder="Pincode"
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                  style={{ ...s.modalInput, flex: 1 }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(212,168,83,0.4)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
                <select
                  value={addressForm.type}
                  onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                  style={{ ...s.modalInput, flex: 1, cursor: 'pointer' }}
                >
                  <option value="Home">🏠 Home</option>
                  <option value="Work">🏢 Work</option>
                  <option value="Other">📌 Other</option>
                </select>
              </div>

              <div style={s.modalActions}>
                <button style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button style={s.goldBtn} onClick={handleSaveAddress}>
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
