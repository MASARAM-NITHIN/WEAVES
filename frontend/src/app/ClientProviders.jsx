'use client';

import React, { useState } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { ProductProvider } from '../context/ProductContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';

import AnnouncementBar from '../components/AnnouncementBar/AnnouncementBar';
import Navbar from '../components/Navbar/Navbar';
import MobileBottomNav from '../components/MobileBottomNav/MobileBottomNav';
import CartDrawer from '../components/CartDrawer/CartDrawer';
import WishlistDrawer from '../components/WishlistDrawer/WishlistDrawer';
import SearchBar from '../components/SearchBar/SearchBar';
import Footer from '../components/Footer/Footer';
import BackToTop from '../components/BackToTop/BackToTop';
import WhatsAppWidget from '../components/WhatsAppWidget/WhatsAppWidget';
import AppUpdateGuard from '../components/AppUpdateGuard/AppUpdateGuard';

export default function ClientProviders({ children }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <WishlistProvider>
            <AppUpdateGuard>
              <div id="root" className="d-flex flex-column min-vh-100 position-relative">
                <div className="fixed-header-wrapper">
                  <AnnouncementBar />
                  <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
                </div>
                <div className="navbar-spacer" />
                <main className="flex-grow-1">
                  {children}
                </main>
                <Footer />
                <MobileBottomNav onOpenSearch={() => setIsSearchOpen(true)} />
                <BackToTop />
                <WhatsAppWidget />
                <CartDrawer />
                <WishlistDrawer />
                {isSearchOpen && <SearchBar onClose={() => setIsSearchOpen(false)} />}
              </div>
            </AppUpdateGuard>
          </WishlistProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
