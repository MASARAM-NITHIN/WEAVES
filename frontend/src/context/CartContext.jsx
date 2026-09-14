import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  createOrderApi, 
  fetchAdminOrdersApi, 
  updateOrderStatusApi, 
  uploadPaymentProofApi, 
  updateVerificationStatusApi,
  createEnquiryApi,
  fetchAdminEnquiriesApi,
  updateEnquiryStatusApi,
  deleteEnquiryApi
} from '../lib/apiClient';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sree_padmavathi_cart');
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from local storage', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('sree_padmavathi_cart', JSON.stringify(cartItems));
      } catch (e) {
        console.error('Failed to save cart to local storage', e);
      }
    }
  }, [cartItems, isLoaded]);

  const [orderHistory, setOrderHistory] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);

  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Load Order History for user (Customer)
  const lookupOrderHistory = useCallback(async (phone) => {
    try {
      const res = await lookupOrderHistoryApi(phone);
      setOrderHistory(res.data);
    } catch (e) {
      console.error('Failed to load order history:', e?.response?.data || e.message);
    }
  }, []);

  const [ordersError, setOrdersError] = useState(null);

  // Load Database Orders for Admin
  const loadDatabaseOrders = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('sree_padmavathi_jwt_token') : null;
      if (!token) return;

      setIsOrdersLoading(true);
      setOrdersError(null);
      const res = await fetchAdminOrdersApi(); // Uses new native fetch default of size=50
      
      // Robustly extract the array from Spring Boot's various response shapes (Page object, direct array, nested data)
      let rawOrders = [];
      if (Array.isArray(res)) rawOrders = res;
      else if (res && Array.isArray(res.content)) rawOrders = res.content;
      else if (res && res.data && Array.isArray(res.data.content)) rawOrders = res.data.content;
      else if (res && Array.isArray(res.data)) rawOrders = res.data;
      
      setOrderHistory(rawOrders);
    } catch (e) {
      console.error('Failed to load orders:', e?.response?.status, e?.response?.data || e.message);
      setOrdersError(e?.message || 'Failed to load');
      setOrderHistory([]);
    } finally {
      setIsOrdersLoading(false);
    }
  }, []);

  const loadDatabaseEnquiries = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('sree_padmavathi_jwt_token') : null;
      if (!token) return;

      const res = await fetchAdminEnquiriesApi();
      
      let rawInqs = [];
      if (Array.isArray(res)) rawInqs = res;
      else if (res && Array.isArray(res.content)) rawInqs = res.content;
      else if (res && res.data && Array.isArray(res.data.content)) rawInqs = res.data.content;
      else if (res && Array.isArray(res.data)) rawInqs = res.data;
      
      setInquiries(rawInqs);
    } catch (e) {
      console.error('Failed to load enquiries:', e?.response?.status, e?.response?.data || e.message);
      setInquiries([]);
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sree_padmavathi_jwt_token') : null;
    if (token) {
      loadDatabaseOrders();
      loadDatabaseEnquiries();
    }
  }, [loadDatabaseOrders, loadDatabaseEnquiries]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const addToCart = (product, quantity = 1, selectedColor = null) => {
    const isOutOfStock = product.stock !== undefined ? product.stock <= 0 : (product.inStock === false);
    if (isOutOfStock) {
      showToast(`Sorry, "${product.name.slice(0, 25)}..." is Out of Stock.`);
      return false;
    }

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.product.id === product.id && item.selectedColor === selectedColor
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prevItems, { product, quantity, selectedColor }];
    });

    setIsCartOpen(true);
    showToast(`Added "${product.name.slice(0, 25)}..." to your cart!`);
    return true;
  };

  const removeFromCart = (productId, selectedColor = null) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.product.id === productId && item.selectedColor === selectedColor)
      )
    );
  };

  const updateQuantity = (productId, quantity, selectedColor = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedColor);
      return;
    }
    setCartItems((prevItems) =>
      (prevItems || []).map((item) =>
        item.product.id === productId && item.selectedColor === selectedColor
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon('');
    setDiscountPercent(0);
  };

  const applyPromoCode = (code) => {
    const clean = (code || '').trim().toUpperCase();
    if (clean === 'PADMAVATHI10' || clean === 'SILK10') {
      setAppliedCoupon(clean);
      setDiscountPercent(10);
      return { success: true, discountPercent: 10, message: '🎉 10% Royal Silk Discount Applied!' };
    }
    if (clean === 'BRIDAL15' || clean === 'KANCHI15') {
      setAppliedCoupon(clean);
      setDiscountPercent(15);
      return { success: true, discountPercent: 15, message: '💎 15% Bridal Silk Celebration Discount Applied!' };
    }
    return { success: false, message: 'Invalid or expired coupon code.' };
  };

  // Place Order directly into the PostgreSQL Database
  const saveOrder = async (orderDetails) => {
    // Construct DTO for Spring Boot backend
    const orderReq = {
      phone: orderDetails.customer?.phone || '9999999999', // Phone is strictly required by our backend
      customerName: `${orderDetails.customer?.firstName || ''} ${orderDetails.customer?.lastName || ''}`.trim() || 'Guest User',
      email: orderDetails.customer?.email || null,
      shippingAddress: orderDetails.customer?.address || 'N/A',
      city: orderDetails.customer?.city || 'N/A',
      state: orderDetails.customer?.state || 'N/A',
      pincode: orderDetails.customer?.pinCode || '000000',
      items: (cartItems || []).map((item) => ({
        sareeId: item.product.id,
        quantity: item.quantity
      })),
      upiId: orderDetails.customerUpiId,
      utrNumber: orderDetails.utrNumber
    };

    try {
      // 1. Create the Order
      const res = await createOrderApi(orderReq);
      const apiOrder = res.data || res;
      
      // 2. Upload payment screenshot if provided
      if (orderDetails.paymentScreenshot && apiOrder.orderCode) {
        try {
          await uploadPaymentProofApi(
            apiOrder.orderCode,
            orderReq.phone,
            orderDetails.utrNumber,
            orderDetails.paymentScreenshot
          );
        } catch (uploadErr) {
          console.error("Payment screenshot upload failed, but order was created.", uploadErr);
          const errorMsg = uploadErr.response?.data?.message || uploadErr.response?.data || uploadErr.message;
          alert(`Your order was placed, but your payment screenshot failed to upload: ${errorMsg}`);
        }
      }
      
      await loadDatabaseOrders();
      clearCart();
      return { success: true, data: apiOrder };
    } catch (e) {
      console.error('Error saving order to database:', e);
      return { success: false, message: e.response?.data?.message || e.message || 'Failed to place order.' };
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setOrderHistory((prev) =>
        (prev || []).map((ord) => (ord.id === orderId ? { ...ord, orderStatus: newStatus, status: newStatus } : ord))
      );
      await updateOrderStatusApi(orderId, newStatus);
      loadDatabaseOrders(); // Background sync
    } catch (e) {
      console.error('Error updating order status in database:', e);
      loadDatabaseOrders(); // Revert on failure
    }
  };

  const updateVerificationStatus = async (orderId, newStatus) => {
    try {
      setOrderHistory((prev) =>
        (prev || []).map((ord) => (ord.id === orderId ? { ...ord, verificationStatus: newStatus } : ord))
      );
      await updateVerificationStatusApi(orderId, newStatus);
      loadDatabaseOrders(); // Background sync
    } catch (e) {
      console.error('Error updating verification status in database:', e);
      loadDatabaseOrders(); // Revert on failure
    }
  };

  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  const subtotal = cartItems.reduce((total, item) => {
    const priceVal = item.product?.price;
    const price = typeof priceVal === 'string'
      ? (parseFloat(priceVal.replace(/[^\d.]/g, '')) || 0)
      : (Number(priceVal) || 0);
    return total + price * (item.quantity || 0);
  }, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const freeShippingThreshold = 4999;
  const shippingFee = 0;
  const taxIncluded = 0;
  const grandTotal = Math.max(0, subtotal - discountAmount);




  const addInquiry = async (data) => {
    try {
      const newInquiry = await createEnquiryApi({
        orderId: data.orderId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        sareeInterest: data.sareeInterest,
        message: data.message
      });
      setInquiries((prev) => [newInquiry, ...prev]);
      return newInquiry;
    } catch (e) {
      console.error('Failed to create enquiry:', e);
      throw e;
    }
  };

  const updateInquiryStatus = async (id, newStatus) => {
    try {
      await updateEnquiryStatusApi(id, newStatus);
      setInquiries((prev) => (prev || []).map((inq) => inq.id === id ? { ...inq, status: newStatus } : inq));
    } catch (e) {
      console.error('Failed to update enquiry status:', e);
    }
  };

  const deleteInquiry = async (id) => {
    try {
      await deleteEnquiryApi(id);
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    } catch (e) {
      console.error('Failed to delete enquiry:', e);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyPromoCode,
        appliedCoupon,
        discountPercent,
        discountAmount,
        shippingFee,
        taxIncluded,
        grandTotal,
        subtotal,
        saveOrder,
        orderHistory,
        isOrdersLoading,
        ordersError,
        updateOrderStatus,
        updateVerificationStatus,
        inquiries,
        addInquiry,
        updateInquiryStatus,
        deleteInquiry,
        isCartOpen,
        setIsCartOpen,
        cartCount,
        toastMessage,
        loadDatabaseOrders,
        loadDatabaseEnquiries
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
