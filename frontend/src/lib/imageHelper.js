/**
 * Sree Padmavathi Silks - Dynamic Image Resolver
 * Decouples code from static/placeholder Unsplash assets.
 */

// Elegant inline SVG placeholder with matching royal theme colors
const rawPlaceholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%"><rect width="100%" height="100%" fill="#7B112C"/><rect x="20" y="20" width="360" height="460" fill="none" stroke="#C8A54B" stroke-width="2" opacity="0.5"/><path d="M200 130 L260 250 L140 250 Z" fill="#C8A54B" opacity="0.8"/><circle cx="200" cy="110" r="10" fill="#C8A54B"/><path d="M150 280 H250 V290 H150 Z" fill="#C8A54B" opacity="0.6"/><text x="50%" y="360" dominant-baseline="middle" text-anchor="middle" font-family="'Playfair Display', serif" font-size="24" font-weight="bold" fill="#C8A54B">Sree Padmavathi Silks</text><text x="50%" y="395" dominant-baseline="middle" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="12" font-weight="500" fill="#F4E7C5" letter-spacing="2">HANDWOVEN HERITAGE</text></svg>`;
export const PLACEHOLDER_SVG = `data:image/svg+xml,${encodeURIComponent(rawPlaceholderSvg)}`;

const rawCategorySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="100%" height="100%"><rect width="100%" height="100%" fill="#580B1F"/><rect x="15" y="15" width="270" height="170" fill="none" stroke="#C8A54B" stroke-width="1.5" opacity="0.4"/><text x="50%" y="105" dominant-baseline="middle" text-anchor="middle" font-family="'Playfair Display', serif" font-size="20" font-weight="bold" fill="#C8A54B">Sree Padmavathi</text><text x="50%" y="130" dominant-baseline="middle" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="10" font-weight="500" fill="#F4E7C5" letter-spacing="1.5">HERITAGE WEAVE</text></svg>`;
export const CATEGORY_PLACEHOLDER_SVG = `data:image/svg+xml,${encodeURIComponent(rawCategorySvg)}`;

const PUBLIC_PREFIX = process.env.NEXT_PUBLIC_IMAGE_URL_PREFIX || '/uploads/';

/**
 * Resolves a product image to its full URL.
 * Falls back to an elegant placeholder if the path is empty/invalid.
 */
export const getProductImageUrl = (imagePath) => {
  if (!imagePath) return PLACEHOLDER_SVG;
  
  // If the admin uploaded multiple images, they are joined by a pipe '|'. Use the first one.
  const pathStr = String(imagePath).split('|')[0].trim();
  if (pathStr === '') return PLACEHOLDER_SVG;
  
  if (pathStr.includes('unsplash.com') || pathStr.includes('picsum.photos') || pathStr.includes('placeholder')) {
    return PLACEHOLDER_SVG;
  }
  
  if (pathStr.startsWith('http://') || pathStr.startsWith('https://') || pathStr.startsWith('data:') || pathStr.startsWith('/uploads/')) {
    return pathStr;
  }
  
  const cleanPath = pathStr.startsWith('/') ? pathStr.substring(1) : pathStr;
  
  // Build public URL
  return `${PUBLIC_PREFIX}${cleanPath}`;
};

/**
 * Resolves a category/collection image to its full URL.
 */
export const getCategoryImageUrl = (imagePath) => {
  if (!imagePath) return CATEGORY_PLACEHOLDER_SVG;
  
  // If multiple images are stored, use the first one.
  const pathStr = String(imagePath).split('|')[0].trim();
  if (pathStr === '') return CATEGORY_PLACEHOLDER_SVG;
  
  if (pathStr.includes('unsplash.com') || pathStr.includes('picsum.photos') || pathStr.includes('placeholder')) {
    return CATEGORY_PLACEHOLDER_SVG;
  }
  
  if (pathStr.startsWith('http://') || pathStr.startsWith('https://') || pathStr.startsWith('data:') || pathStr.startsWith('/uploads/')) {
    return pathStr;
  }
  
  const cleanPath = pathStr.startsWith('/') ? pathStr.substring(1) : pathStr;
  return `${PUBLIC_PREFIX}${cleanPath}`;
};
