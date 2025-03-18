import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { Trash2 } from 'lucide-react';

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Modern Wooden Chair',
      price: 299.99,
      quantity: 1,
      image: '/assets/ModernwoodenChair.png'
    },
    {
      id: 2,
      name: 'Glass Coffee Table',
      price: 199.99,
      quantity: 1,
      image: '/assets/GlassCoffeeTable.png'
    }
  ]);

  const navigate = useNavigate();

  const updateQuantity = (id, newQuantity) => {
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 29.99;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cartItems.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center p-6 border-b">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1 ml-6">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-gray-600">${item.price}</p>
                      <div className="flex items-center mt-2">
                        <button
                          className="px-2 py-1 border rounded-l"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="px-4 py-1 border-t border-b">
                          {item.quantity}
                        </span>
                        <button
                          className="px-2 py-1 border rounded-r"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="ml-6">
                      <p className="text-lg font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800 mt-2"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600 mb-4">Your cart is empty</p>
                <Link to="/products">
                  <Button variant="primary">Continue Shopping</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/checkout')}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 