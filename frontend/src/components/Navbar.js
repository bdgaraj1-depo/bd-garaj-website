import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('admin_token');

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3" data-testid="nav-home-link">
              <img 
                src="https://customer-assets.emergentagent.com/job_site-kurulum-10/artifacts/7gc7uuu4_PHOTO-2025-11-09-23-04-00.jpg" 
                alt="BD Garaj Logo" 
                className="h-14 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-orange-600 font-medium" data-testid="nav-home">
              Ana Sayfa
            </Link>
            <Link to="/randevu" className="text-gray-700 hover:text-orange-600 font-medium" data-testid="nav-appointment">
              Randevu
            </Link>
            <Link to="/oto-moto" className="text-gray-700 hover:text-orange-600 font-medium" data-testid="nav-oto-moto">
              OTO-MOTO
            </Link>
            <Link to="/yedek-parca" className="text-gray-700 hover:text-orange-600 font-medium" data-testid="nav-yedek-parca">
              Yedek Parça
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-orange-600 font-medium" data-testid="nav-blog">
              Blog
            </Link>
            {isAdmin ? (
              <>
                <Link to="/admin/dashboard" className="text-gray-700 hover:text-orange-600 font-medium" data-testid="nav-admin-dashboard">
                  Yönetim
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  data-testid="nav-logout-btn"
                >
                  Çıkış
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                data-testid="nav-admin-login"
              >
                Admin Girişi
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-orange-600"
              data-testid="mobile-menu-btn"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t" data-testid="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Ana Sayfa
            </Link>
            <Link
              to="/randevu"
              className="block px-3 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Randevu
            </Link>
            <Link
              to="/oto-moto"
              className="block px-3 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              OTO-MOTO
            </Link>
            <Link
              to="/yedek-parca"
              className="block px-3 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Yedek Parça
            </Link>
            <Link
              to="/blog"
              className="block px-3 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>
            {isAdmin ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className="block px-3 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Yönetim
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  Çıkış
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="block px-3 py-2 text-orange-600 hover:bg-orange-50 rounded-md font-medium"
                onClick={() => setIsOpen(false)}
              >
                Admin Girişi
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;