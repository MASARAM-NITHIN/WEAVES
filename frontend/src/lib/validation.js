/**
 * Sree Padmavathi Silks - Frontend Input Validation Utilities
 */

export const validateOrderForm = (formData, cartCount) => {
  const errors = {};

  if (!cartCount || cartCount === 0) {
    errors.cart = 'Your shopping bag is empty. Please add sarees before proceeding to checkout.';
  }

  if (!formData.fullName || formData.fullName.trim().length < 3) {
    errors.fullName = 'Full Name must be at least 3 characters long.';
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!formData.phone || !phoneRegex.test(formData.phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Please enter a valid 10-digit Indian Mobile Number (e.g. 9849012345).';
  }

  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!formData.address || formData.address.trim().length < 10) {
    errors.address = 'Please enter a complete shipping address (building, street, landmark).';
  }

  if (!formData.city || formData.city.trim().length < 2) {
    errors.city = 'City / District is required.';
  }

  const pinRegex = /^\d{6}$/;
  if (!formData.pincode || !pinRegex.test(formData.pincode.trim())) {
    errors.pincode = 'Please enter a valid 6-digit Pincode (e.g. 515201).';
  }

  if (!formData.paymentScreenshot) {
    errors.paymentScreenshot = 'Please upload your UPI payment screenshot to complete order verification.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateSareeForm = (sareeData, uploadedImagesCount) => {
  const errors = {};

  if (!sareeData.name || sareeData.name.trim().length < 4) {
    errors.name = 'Saree name must be at least 4 characters.';
  }

  if (!sareeData.price || Number(sareeData.price) <= 0) {
    errors.price = 'Price must be greater than ₹0.';
  }

  if (!sareeData.category) {
    errors.category = 'Category selection is required.';
  }

  if (!uploadedImagesCount || uploadedImagesCount === 0) {
    errors.images = 'Please upload at least 1 photo for this saree.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateLoginForm = (username, password) => {
  const errors = {};

  if (!username || username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters.';
  }

  if (!password || password.length < 4) {
    errors.password = 'Password must be at least 4 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
