import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { productsAPI } from '../services/api';
import { openWhatsApp } from '../utils/whatsapp';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const YedekParcaPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Tümü', icon: '🔧', description: 'Tüm yedek parçalar' },
    { id: 'spare_parts_new', name: 'Sıfır Yedek Parça', icon: '✨', description: 'Orijinal ve yeni parçalar' },
    { id: 'spare_parts_used', name: 'İkinci El Yedek Parça', icon: '♻️', description: 'Kullanılmış parçalar' },
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const category = selectedCategory === 'all' ? null : selectedCategory;
      const response = await productsAPI.getAll(category, 'active');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, currency = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid="yedek-parca-page">
      <Navbar />

      <div className="flex-grow bg-gray-50 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="page-title">
              🔧 Yedek Parça
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Sıfır ve ikinci el yedek parça ilanları
            </p>
          </div>

          {/* Category Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition ${
                    selectedCategory === category.id
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-orange-50'
                  }`}
                  data-testid={`category-${category.id}`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Category Description */}
          {selectedCategory !== 'all' && (
            <div className="mb-8 text-center">
              <p className="text-gray-600">
                {categories.find(c => c.id === selectedCategory)?.description}
              </p>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4" data-testid="no-products">
                Bu kategoride henüz ilan bulunmuyor.
              </p>
              <Link
                to="/"
                className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/yedek-parca/${product.id}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden group"
                  data-testid={`product-${product.id}`}
                >
                  {/* Image */}
                  {product.images && product.images.length > 0 ? (
                    <div className="relative overflow-hidden h-56">
                      <img
                        src={`${BACKEND_URL}${product.images[0]}`}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {formatPrice(product.price, product.currency)}
                      </div>
                      {product.status === 'sold' && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">SATILDI</span>
                        </div>
                      )}
                      {product.status === 'reserved' && (
                        <div className="absolute inset-0 bg-orange-600/70 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">REZERVE</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-6xl">📷</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-2">
                      <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded">
                        {getCategoryName(product.category)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {product.description}
                    </p>
                    
                    {/* Specs */}
                    {product.specs && Object.keys(product.specs).length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Object.entries(product.specs).slice(0, 3).map(([key, value]) => (
                          <span key={key} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            {value}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-orange-600 font-semibold group-hover:underline">
                        Detaylı Bilgi →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-16 bg-gradient-to-r from-orange-600 to-orange-700 text-white p-8 rounded-xl text-center">
            <h3 className="text-2xl font-bold mb-4">Yedek Parça Satmak veya Aramak İster Misiniz?</h3>
            <p className="text-orange-100 mb-6">
              Bizimle iletişime geçin, ilanınızı biz yayınlayalım veya aradığınız parçayı bulalım
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => openWhatsApp('Merhaba, yedek parça için ilan vermek veya araştırma yapmak istiyorum.')}
                className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition"
                data-testid="cta-whatsapp"
              >
                WhatsApp ile İletişim
              </button>
              <a
                href="tel:+905326832603"
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                data-testid="cta-phone"
              >
                Telefon ile İletişim
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default YedekParcaPage;
