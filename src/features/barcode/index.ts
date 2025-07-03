/**
 * Public exports for the barcode feature module.
 * This acts like an internal package interface for the rest of the app.
 * Use this to avoid reaching into specific file paths.
 */
export { default as BarcodePage } from './page';
export { BarcodeScanner } from './BarcodeScanner';
export { ProductCard } from './ProductCard';