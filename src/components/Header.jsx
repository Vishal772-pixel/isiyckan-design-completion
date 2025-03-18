import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, X, ArrowLeft, User } from 'lucide-react';
import Button from './Button';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();
  const userRole = localStorage.getItem('userRole');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  const showBackButton = location.pathname !== '/';

  const handleDashboardClick = () => {
    if (isAuthenticated) {
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            )}
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/assets/logo.png"
                alt="IsIyCkan Design Logo"
                className="h-16 w-auto transform scale-110" // Increased size and added scaling
              />
              <span className="text-2xl font-bold text-gray-900">
                IsIyCkan
              </span>
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/office-furniture"
              className="text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              Office Furniture
            </Link>
            <Link
              to="/hotel-furniture"
              className="text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              Hotel Furniture
            </Link>
            <Link
              to="/home-office"
              className="text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              Home Office
            </Link>
            <Link
              to="/pubs"
              className="text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              Restaurant
            </Link>
            <Link
              to="/special-offers"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Special Offers
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </>
            ) : (
              <button
                onClick={handleDashboardClick}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <User className="h-6 w-6 text-gray-600" />
              </button>
            )}
            
            <Link
              to="/cart"
              className="relative p-2 text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.itemCount}
                </span>
              )}
            </Link>
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg mt-2 p-4 md:hidden"
              >
                <nav className="flex flex-col space-y-4">
                  <button
                    className="text-secondary-600 hover:text-secondary-900 transition-colors"
                    onClick={() => { setIsMenuOpen(false); navigate('/office-furniture'); }}
                  >
                    Office Furniture
                  </button>
                  <button
                    className="text-secondary-600 hover:text-secondary-900 transition-colors"
                    onClick={() => { setIsMenuOpen(false); navigate('/hotel-furniture'); }}
                  >
                    Hotel Furniture
                  </button>
                  <button
                    className="text-secondary-600 hover:text-secondary-900 transition-colors"
                    onClick={() => { setIsMenuOpen(false); navigate('/home-office'); }}
                  >
                    Home Office
                  </button>
                  <button
                    className="text-secondary-600 hover:text-secondary-900 transition-colors"
                    onClick={() => { setIsMenuOpen(false); navigate('/pubs'); }}
                  >
                    Restaurant
                  </button>
                  <button
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    onClick={() => { setIsMenuOpen(false); navigate('/special-offers'); }}
                  >
                    Special Offers
                  </button>
                  <hr className="my-2" />
                  {!isAuthenticated ? (
                    <>
                      <button
                        className="w-full justify-start"
                        onClick={() => { setIsMenuOpen(false); navigate('/login'); }}
                      >
                        Login
                      </button>
                      <button
                        className="w-full justify-start"
                        onClick={() => { setIsMenuOpen(false); navigate('/register'); }}
                      >
                        Register
                      </button>
                    </>
                  ) : (
                    <button
                      className="w-full justify-start"
                      onClick={() => { 
                        setIsMenuOpen(false);
                        handleDashboardClick();
                      }}
                    >
                      Dashboard
                    </button>
                  )}
                  <Link
                    to="/cart"
                    className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-900 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Cart ({cart.itemCount})</span>
                  </Link>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}