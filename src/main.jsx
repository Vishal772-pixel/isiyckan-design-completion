import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';
import { ProductProvider } from './context/ProductContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AdminProvider>
        <ProductProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ProductProvider>
      </AdminProvider>
    </AuthProvider>
  </StrictMode>
);