'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();

  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sree_padmavathi_wishlist');
      if (saved) {
        setWishlistItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load wishlist from local storage', e);
    }
  }, []);

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);



  // Save to localStorage (for guests or as cache)
  useEffect(() => {
    try {
      localStorage.setItem(
        'sree_padmavathi_wishlist',
        JSON.stringify(wishlistItems)
      );
    } catch (e) {
      console.error(e);
    }
  }, [wishlistItems]);

  const toggleWishlist = (product) => {
    const exists = wishlistItems.some((item) => item.id === product.id);

    if (exists) {
      // Remove from wishlist
      setWishlistItems((prev) => prev.filter((item) => item.id !== product.id));
    } else {
      // Add to wishlist
      setWishlistItems((prev) => [...prev, product]);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        toggleWishlist,
        isInWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        wishlistCount
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
