'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  fetchProductsApi, 
  fetchCategoriesApi, 
  fetchCollectionsApi, 
  createProductApi, 
  updateProductApi, 
  deleteProductApi 
} from '../lib/apiClient';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  // Live Database States (100% Fetched & Validated from the PostgreSQL DB)
  const [products, setProducts] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sree_padmavathi_cached_products');
      if (cached) try { return JSON.parse(cached); } catch(e){}
    }
    return [];
  });
  const [categories, setCategories] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sree_padmavathi_cached_categories');
      if (cached) try { return JSON.parse(cached); } catch(e){}
    }
    return [];
  });
  const [themeCollections, setThemeCollections] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sree_padmavathi_cached_themes');
      if (cached) try { return JSON.parse(cached); } catch(e){}
    }
    return [];
  });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Owner Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [ownerUsername, setOwnerUsername] = useState('');

  useEffect(() => {
    setIsAdminLoggedIn(localStorage.getItem('sree_padmavathi_admin_auth') === 'true' || !!localStorage.getItem('sree_padmavathi_jwt_token'));
    setOwnerUsername(localStorage.getItem('sree_padmavathi_owner_username') || '');
  }, []);

  // Load Catalog Data directly from Spring Boot 3 REST Backend (connected to the Postgres DB)
  const loadDatabaseCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const [apiProducts, apiCategories, apiCollections] = await Promise.allSettled([
        fetchProductsApi(),
        fetchCategoriesApi(),
        fetchCollectionsApi()
      ]);

      if (apiProducts.status === 'fulfilled') {
        let rawProds = apiProducts.value?.data || apiProducts.value;
        // Handle Spring Data JPA Page response
        if (rawProds && rawProds.content && Array.isArray(rawProds.content)) {
          rawProds = rawProds.content;
        }
        if (Array.isArray(rawProds)) {
            // Adapt Spring Boot SareeResponseDto to Frontend UI shape
            const adaptedProducts = (rawProds || []).map(prod => ({
                ...prod,
                name: prod.sareeName,
                price: prod.discountedPrice,
                images: prod.imageUrl ? (
                    prod.imageUrl.includes('data:image') 
                    ? (prod.imageUrl.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g) || [prod.imageUrl])
                    : prod.imageUrl.split('|')
                ) : ['/images/placeholder-saree.jpg'],
                category: prod.fabricTypeName,
                stock: prod.stockAvailable,
                collections: prod.collectionNames || (prod.collectionName ? [prod.collectionName] : [])
            }));
            setProducts(adaptedProducts);
            localStorage.setItem('sree_padmavathi_cached_products', JSON.stringify(adaptedProducts));
        }
      }
      if (apiCategories.status === 'fulfilled') {
        let rawCats = apiCategories.value?.data || apiCategories.value;
        if (rawCats && rawCats.content && Array.isArray(rawCats.content)) {
          rawCats = rawCats.content;
        }
        if (Array.isArray(rawCats)) {
            const adaptedCats = (rawCats || []).map(cat => ({
                ...cat,
                name: cat.fabricName,
                image: cat.imageUrl
            }));
            setCategories(adaptedCats);
            localStorage.setItem('sree_padmavathi_cached_categories', JSON.stringify(adaptedCats));
        }
      }
      if (apiCollections.status === 'fulfilled') {
        let rawThemes = apiCollections.value?.data || apiCollections.value;
        if (rawThemes && rawThemes.content && Array.isArray(rawThemes.content)) {
          rawThemes = rawThemes.content;
        }
        if (Array.isArray(rawThemes)) {
          setThemeCollections(rawThemes);
          localStorage.setItem('sree_padmavathi_cached_themes', JSON.stringify(rawThemes));
        }
      }
    } catch (err) {
      console.error('Error fetching live data from the Database:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllReviews = useCallback(async () => {
    try {
      const { fetchAllReviewsApi } = await import('../lib/apiClient');
      const data = await fetchAllReviewsApi();
      setReviews(data || []);
    } catch (e) {
      console.error('Error loading all reviews:', e);
    }
  }, []);

  useEffect(() => {
    loadDatabaseCatalog();
    loadAllReviews();
  }, [loadDatabaseCatalog, loadAllReviews]);

  // Inventory Stock Deduction helper
  const deductStock = (orderedItems) => {
    setProducts((prev) =>
      (prev || []).map((p) => {
        const itemInOrder = orderedItems.find((item) => item.product.id === p.id);
        if (itemInOrder) {
          const currentStock = p.stock !== undefined ? p.stock : 1;
          const newStock = Math.max(0, currentStock - itemInOrder.quantity);
          return {
            ...p,
            stock: newStock,
            inStock: newStock > 0,
            isOutOfStock: newStock === 0
          };
        }
        return p;
      })
    );
  };

  const getCategorySareeCount = useCallback((categoryName) => {
    if (!categoryName) return 0;
    return products.filter(
      (p) => p.category && p.category.toLowerCase().includes(categoryName.toLowerCase())
    ).length;
  }, [products]);

  // Single Owner Authentication Check (100% Validated against the DB)
  const loginAdmin = async (usernameInput, passwordInput) => {
    try {
      const { loginOwnerApi } = await import('../lib/apiClient');
      const res = await loginOwnerApi(usernameInput, passwordInput);
      if (res && res.success) {
        setIsAdminLoggedIn(true);
        const loggedInUsername = res.data?.username || usernameInput;
        setOwnerUsername(loggedInUsername);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sree_padmavathi_admin_auth', 'true');
          localStorage.setItem('sree_padmavathi_owner_username', loggedInUsername);
        }
        return { success: true, message: res.message, data: res.data };
      }
      return { success: false, message: res?.message || 'Invalid Database Credentials.' };
    } catch (err) {
      return { success: false, message: err?.message || 'Failed to authenticate against Database server.' };
    }
  };

  const logoutAdmin = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('sree_padmavathi_jwt_token') : null;
      if (token) {
        const { apiClient } = await import('../lib/apiClient');
        await apiClient.post('/admin/logout');
      }
    } catch (err) {
      console.warn('Backend logout failed or not supported:', err.message);
    } finally {
      setIsAdminLoggedIn(false);
      setOwnerUsername('');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sree_padmavathi_admin_auth');
        localStorage.removeItem('sree_padmavathi_jwt_token');
        localStorage.removeItem('sree_padmavathi_user_role');
        localStorage.removeItem('sree_padmavathi_owner_username');
        localStorage.removeItem('sree_padmavathi_user_profile');
      }
    }
  };

  const changeOwnerCredentials = async (currentPassInput, newUsernameInput, newPassInput) => {
    try {
      const { updateOwnerCredentialsApi } = await import('../lib/apiClient');
      const res = await updateOwnerCredentialsApi({
        currentPassword: currentPassInput,
        newUsername: newUsernameInput,
        newPassword: newPassInput
      });
      if (res && res.success) {
        const updatedUsername = newUsernameInput.trim();
        setOwnerUsername(updatedUsername);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sree_padmavathi_owner_username', updatedUsername);
        }
        return { success: true, message: 'Owner credentials updated successfully in the Database!' };
      }
      return { success: false, message: res?.message || 'Failed to update credentials in database.' };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || e.message || 'Error communicating with database.' };
    }
  };

  const adaptProduct = (prod) => ({
    ...prod,
    name: prod.sareeName,
    price: prod.discountedPrice,
    images: prod.imageUrl ? (
        prod.imageUrl.includes('data:image') 
        ? (prod.imageUrl.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g) || [prod.imageUrl])
        : prod.imageUrl.split('|')
    ) : ['/images/placeholder-saree.jpg'],
    category: prod.fabricTypeName,
    stock: prod.stockAvailable,
    collections: prod.collectionNames || (prod.collectionName ? [prod.collectionName] : [])
  });

  // Add new Saree product to Database
  const addProduct = async (newProductData) => {
    try {
      const res = await createProductApi(newProductData);
      const newProduct = adaptProduct(res.data || res);
      setProducts(prev => [...prev, newProduct]);
      loadDatabaseCatalog(); // Background sync
      return { success: true, data: newProduct };
    } catch (e) {
      console.error('Error adding product to database:', e);
      return { success: false, message: e.response?.data?.message || 'Failed to create product' };
    }
  };

  // Update Saree product in Database
  const editProduct = async (id, updatedData) => {
    try {
      const res = await updateProductApi(id, updatedData);
      const updatedProduct = adaptProduct(res.data || res);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      loadDatabaseCatalog(); // Background sync
      return { success: true, data: updatedProduct };
    } catch (e) {
      console.error('Error updating product in database:', e);
      return { success: false, message: e.response?.data?.message || 'Failed to update product' };
    }
  };

  // Delete Saree product from Database
  const deleteProduct = async (id) => {
    try {
      // Optimistic delete
      setProducts(prev => prev.filter(p => p.id !== id));
      await deleteProductApi(id);
      loadDatabaseCatalog(); // Background sync
      return { success: true };
    } catch (e) {
      console.error('Error deleting product from database:', e);
      loadDatabaseCatalog(); // Revert on failure
      return { success: false, message: e.response?.data?.message || 'Failed to delete product' };
    }
  };

  const adaptCategory = (cat) => ({
    ...cat,
    name: cat.fabricName,
    image: cat.imageUrl
  });

  // Add new Category in the DB
  const addCategory = async (categoryData) => {
    try {
      const { createCategoryApi } = await import('../lib/apiClient');
      const res = await createCategoryApi(categoryData);
      const newCat = adaptCategory(res.data || res);
      setCategories(prev => [...prev, newCat]);
      loadDatabaseCatalog(); // Background sync
      return res;
    } catch (e) {
      console.error('Error adding category:', e);
      return { success: false, message: e.response?.data?.message || e.message || 'Server error occurred.' };
    }
  };

  const editCategory = async (id, updatedData) => {
    try {
      const { updateCategoryApi } = await import('../lib/apiClient');
      const res = await updateCategoryApi(id, updatedData);
      const updatedCat = adaptCategory(res.data || res);
      setCategories(prev => prev.map(c => c.id === id ? updatedCat : c));
      loadDatabaseCatalog(); // Background sync
      return res;
    } catch (e) {
      console.error('Error updating category:', e);
    }
  };

  const deleteCategory = async (id) => {
    try {
      const { deleteCategoryApi } = await import('../lib/apiClient');
      setCategories(prev => prev.filter(c => c.id !== id));
      await deleteCategoryApi(id);
      loadDatabaseCatalog(); // Background sync
    } catch (e) {
      console.error('Error deleting category:', e);
      loadDatabaseCatalog();
    }
  };

  // Add new Theme Collection in the DB
  const addThemeCollection = async (collectionData) => {
    try {
      const { createCollectionApi } = await import('../lib/apiClient');
      const res = await createCollectionApi(collectionData);
      const newCol = res.data || res;
      setThemeCollections(prev => [...prev, newCol]);
      loadDatabaseCatalog(); // Background sync
      return res;
    } catch (e) {
      console.error('Error adding collection:', e);
      return { success: false, message: e.response?.data?.message || e.message || 'Server error occurred.' };
    }
  };

  const editThemeCollection = async (id, updatedData) => {
    try {
      const { updateCollectionApi } = await import('../lib/apiClient');
      const res = await updateCollectionApi(id, updatedData);
      const updatedCol = res.data || res;
      setThemeCollections(prev => prev.map(c => c.id === id ? updatedCol : c));
      loadDatabaseCatalog(); // Background sync
      return res;
    } catch (e) {
      console.error('Error updating collection:', e);
    }
  };

  const deleteThemeCollection = async (id) => {
    try {
      const { deleteCollectionApi } = await import('../lib/apiClient');
      setThemeCollections(prev => prev.filter(c => c.id !== id));
      await deleteCollectionApi(id);
      loadDatabaseCatalog(); // Background sync
    } catch (e) {
      console.error('Error deleting collection:', e);
      loadDatabaseCatalog();
    }
  };

  // Add Customer Review
  const addReview = async (productId, reviewData) => {
    try {
      const { createReviewApi } = await import('../lib/apiClient');
      const res = await createReviewApi({
        sareeId: productId,
        orderCode: reviewData.orderCode,
        phone: reviewData.phone,
        name: reviewData.name,
        title: reviewData.title,
        photoUrl: reviewData.photoUrl,
        rating: Number(reviewData.rating),
        comment: reviewData.comment
      });
      // Refresh reviews from API
      await loadProductReviews(productId);
      return res;
    } catch (e) {
      console.error('Error adding review:', e);
      const errMsg = e.response?.data?.message || (typeof e.response?.data === 'string' ? e.response.data : null) || e.message || 'Server error occurred.';
      throw new Error(errMsg);
    }
  };

  const loadProductReviews = async (productId) => {
    try {
      const { fetchProductReviewsApi } = await import('../lib/apiClient');
      const data = await fetchProductReviewsApi(productId);
      setReviews((prev) => {
        const filtered = prev.filter(r => r.sareeId !== productId);
        return [...filtered, ...data.map(d => ({...d, sareeId: productId}))];
      });
    } catch (e) {
      console.error('Error loading reviews:', e);
    }
  };



  // Get rating summary for a product (from in-memory reviews loaded from API)
  const getProductRatingInfo = useCallback((productId) => {
    const productReviews = reviews.filter(r => r.sareeId === productId);
    if (productReviews.length === 0) {
      return { avgRating: 0, reviewsCount: 0, reviews: [] };
    }
    const total = productReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    return {
      avgRating: (total / productReviews.length).toFixed(1),
      reviewsCount: productReviews.length,
      reviews: productReviews
    };
  }, [reviews]);

  // Mark a review as helpful
  const markReviewHelpful = (reviewId) => {
    setReviews((prev) =>
      (prev || []).map((r) =>
        r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
      )
    );
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        themeCollections,
        reviews,
        loading,
        addReview,
        deductStock,
        addProduct,
        editProduct,
        deleteProduct,
        addCategory,
        editCategory,
        deleteCategory,
        addThemeCollection,
        editThemeCollection,
        deleteThemeCollection,
        isAdminLoggedIn,
        loginAdmin,
        logoutAdmin,
        ownerUsername,
        changeOwnerCredentials,
        loadDatabaseCatalog,
        getCategorySareeCount,
        getProductRatingInfo,
        markReviewHelpful,
        loadProductReviews,
        loadAllReviews
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
