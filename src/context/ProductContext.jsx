import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getProductById = async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const createProduct = async (productData) => {
    try {
      const response = await api.post('/products', productData);
      setProducts([...products, response.data]);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  return (
    <ProductContext.Provider value={{
      products,
      loading,
      error,
      getProductById,
      createProduct,
      refreshProducts: fetchProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};