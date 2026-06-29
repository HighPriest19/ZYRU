import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Footer } from './components/Navigation';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { DesignStudio } from './pages/DesignStudio';
import { CommunityLab } from './pages/CommunityLab';
import { ProductDetail } from './pages/ProductDetail';
import { Account } from './pages/Account';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { UserSync } from './components/UserSync';

export default function App() {
  return (
    <AuthProvider>
      <UserSync />
      <CartProvider>
        <Router>
        <div className="min-h-screen flex flex-col selection:bg-black selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/studio" element={<DesignStudio />} />
              <Route path="/community" element={<CommunityLab />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/account" element={<Account />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  </AuthProvider>
  );
}
