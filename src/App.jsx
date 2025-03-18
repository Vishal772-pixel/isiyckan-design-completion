import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Features from './components/Features';
import Button from "./components/Button";
import ProductListing from './Pages/ProductListing';
import ProductDetails from './Pages/ProductDetails';
import ShoppingPage from './Pages/ShoppingPage';
import HeroSection from './components/HeroSection';
import Login from "./context/Login";
import Signup from "./context/Signup";
import Dashboard from "./Pages/Dashboard";
import Cart from "./Pages/Cart";
import Checkout from "./Pages/Checkout";
import ViewItems from './Pages/ViewItems';
import OfficeFurniture from './Pages/OfficeFurniture';
import Home from './Pages/Home';
import HotelFurniture from './Pages/HotelFurniture';
import Pubs from './Pages/Pubs';
import HomeOffice from './Pages/HomeOffice';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './Pages/Admin/Dashboard';
import AdminOrders from './Pages/Admin/Orders';
import AdminProducts from './Pages/Admin/Products';
import AdminCustomers from './Pages/Admin/Customers';
import AdminSettings from './Pages/Admin/Settings';

// Protected Route Component
const ProtectedRoute = ({ children, isAdmin }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (isAdmin && userRole !== 'admin') {
    return <Navigate to="/" />;
  }

  if (!isAdmin && userRole === 'admin') {
    return <Navigate to="/admin" />;
  }

  return children;
};

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <HeroSection />
        <Features />
        
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-center">
              {['ISO Certified', 'Award Winning', 'Eco-Friendly', 'Expert Support', '5-Star Rated'].map((item, index) => (
                <div key={index}>
                  <h3 className="font-semibold">{item}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute isAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Public and User Routes */}
        <Route
          path="/*"
          element={
            <>
              <Header />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Signup />} />

                {/* Protected User Routes */}
                <Route path="/products" element={
                  <ProtectedRoute>
                    <ProductListing />
                  </ProtectedRoute>
                } />
                <Route path="/product/:id" element={
                  <ProtectedRoute>
                    <ProductDetails />
                  </ProtectedRoute>
                } />
                <Route path="/office-furniture" element={
                  <ProtectedRoute>
                    <OfficeFurniture />
                  </ProtectedRoute>
                } />
                <Route path="/hotel-furniture" element={
                  <ProtectedRoute>
                    <HotelFurniture />
                  </ProtectedRoute>
                } />
                <Route path="/home-office" element={
                  <ProtectedRoute>
                    <HomeOffice />
                  </ProtectedRoute>
                } />
                <Route path="/pubs" element={
                  <ProtectedRoute>
                    <Pubs />
                  </ProtectedRoute>
                } />
                <Route path="/special-offers" element={
                  <ProtectedRoute>
                    <ShoppingPage />
                  </ProtectedRoute>
                } />
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/collections" element={
                  <ProtectedRoute>
                    <ViewItems />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
              </Routes>
              <Footer />
            </>
          }
        />
      </Routes>
    </Router>
  );
}