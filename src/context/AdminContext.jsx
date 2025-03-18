import { createContext, useContext, useState } from 'react';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [orders, setOrders] = useState([
    {
      id: 1,
      customer: 'John Doe',
      items: ['Modern Wooden Chair', 'Glass Coffee Table'],
      total: 499.98,
      status: 'pending',
      date: '2024-01-15'
    },
    // Add more sample orders as needed
  ]);

  const [products, setProducts] = useState([
    // Your existing products array
  ]);

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const addProduct = (product) => {
    setProducts([...products, { ...product, id: products.length + 1 }]);
  };

  const updateProduct = (productId, updatedProduct) => {
    setProducts(products.map(product =>
      product.id === productId ? { ...product, ...updatedProduct } : product
    ));
  };

  const deleteProduct = (productId) => {
    setProducts(products.filter(product => product.id !== productId));
  };

  return (
    <AdminContext.Provider value={{
      orders,
      products,
      updateOrderStatus,
      addProduct,
      updateProduct,
      deleteProduct
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};