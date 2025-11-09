import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await authAPI.login(formData.username, formData.password);
      localStorage.setItem('admin_token', response.data.access_token);
      navigate('/admin/dashboard');
    } catch (error) {
      setErrorMessage('Kullanıcı adı veya şifre yanlış!');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center px-4" data-testid="admin-login-page">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_site-kurulum-10/artifacts/7gc7uuu4_PHOTO-2025-11-09-23-04-00.jpg" 
              alt="BD Garaj Logo" 
              className="h-32 w-auto object-contain"
            />
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2" data-testid="login-title">Admin Girişi</h1>
          <p className="text-orange-100">BD Garaj Yönetim Paneli</p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6" data-testid="login-error">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} data-testid="login-form">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Kullanıcı adınız"
                  data-testid="login-username-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Şifreniz"
                  data-testid="login-password-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                data-testid="login-submit-btn"
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-orange-600 hover:text-orange-700 text-sm" data-testid="back-to-home">
              Ana Sayfaya Dön
            </Link>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Admin Girişi:</strong>
              <br />
              Kullanıcı adı ve şifrenizi girin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;