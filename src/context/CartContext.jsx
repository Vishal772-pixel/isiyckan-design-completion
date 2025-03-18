import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../api/axios';

const CartContext = createContext();

const ADD_TO_CART = 'ADD_TO_CART';
const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
const UPDATE_QUANTITY = 'UPDATE_QUANTITY';
const SET_CART = 'SET_CART';
const CLEAR_CART = 'CLEAR_CART';

const initialState = {
  items: [],
  total: 0,
  itemCount: 0
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case SET_CART:
      return {
        items: action.payload,
        total: action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: action.payload.reduce((sum, item) => sum + item.quantity, 0)
      };
    case ADD_TO_CART:
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          total: state.total + action.payload.price,
          itemCount: state.itemCount + 1
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
        total: state.total + action.payload.price,
        itemCount: state.itemCount + 1
      };
    case REMOVE_FROM_CART:
      const itemToRemove = state.items.find(item => item.id === action.payload);
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        total: state.total - (itemToRemove.price * itemToRemove.quantity),
        itemCount: state.itemCount - itemToRemove.quantity
      };
    case UPDATE_QUANTITY:
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      const quantityDiff = quantity - item.quantity;
      return {
        ...state,
        items: state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        ),
        total: state.total + (item.price * quantityDiff),
        itemCount: state.itemCount + quantityDiff
      };
    case CLEAR_CART:
      return initialState;
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      dispatch({ type: SET_CART, payload: response.data });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const addToCart = async (product) => {
    try {
      await api.post('/cart', { productId: product.id });
      dispatch({ type: ADD_TO_CART, payload: product });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);
      dispatch({ type: REMOVE_FROM_CART, payload: productId });
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await api.put(`/cart/${productId}`, { quantity });
      dispatch({ type: UPDATE_QUANTITY, payload: { id: productId, quantity } });
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      dispatch({ type: CLEAR_CART });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{
      cart: state,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};