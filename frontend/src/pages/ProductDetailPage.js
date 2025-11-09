import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { productsAPI } from '../services/api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getOne(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Ürün bulunamadı.');
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

  const getCategoryName = (category) => {
    const categories = {
      vehicle: 'Araç Alım Satım',
      motorcycle: 'Motor Alım Satım',
      equipment: 'Motor Ekipmanları',
    };
    return categories[category] || category;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Satılık' },
      sold: { bg: 'bg-red-100', text: 'text-red-800', label: 'Satıldı' },
      reserved: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Rezerve' },
    };
    const badge = badges[status] || badges.active;
    return (
      <span className={`${badge.bg} ${badge.text} px-4 py-2 rounded-full font-semibold`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <Link to="/oto-moto" className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700">
              OTO-MOTO Sayfasına Dön
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" data-testid="product-detail-page">
      <Navbar />

      <div className="flex-grow bg-gray-50 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/oto-moto"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-8"
            data-testid="back-link"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            OTO-MOTO Sayfasına Dön
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={`${BACKEND_URL}${product.images[currentImageIndex]}`}
                    alt={product.title}
                    className="w-full h-96 object-cover"
                    data-testid="main-image"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                    <span className="text-8xl">📷</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index ? 'border-orange-600' : 'border-transparent'
                      }`}
                      data-testid={`thumbnail-${index}`}
                    >
                      <img
                        src={`${BACKEND_URL}${image}`}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="mb-4">
                  <span className="inline-block bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded">
                    {getCategoryName(product.category)}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="product-title">
                  {product.title}
                </h1>

                <div className="mb-6">
                  {getStatusBadge(product.status)}
                </div>

                <div className="mb-6 pb-6 border-b">
                  <p className="text-4xl font-bold text-orange-600" data-testid="product-price">
                    {formatPrice(product.price, product.currency)}
                  </p>
                </div>

                <div className="mb-6 pb-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Açıklama</h2>
                  <p className="text-gray-700 whitespace-pre-line" data-testid="product-description">
                    {product.description}
                  </p>
                </div>

                {/* Specs */}
                {product.specs && Object.keys(product.specs).length > 0 && (
                  <div className="mb-6 pb-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Özellikler</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(product.specs).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">{key}</p>
                          <p className="font-semibold text-gray-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">İletişim</h2>
                  
                  {product.contact_phone && (
                    <a
                      href={`tel:${product.contact_phone}`}
                      className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                      data-testid="contact-phone"
                    >
                      📞 {product.contact_phone}
                    </a>
                  )}

                  <a
                    href={`https://wa.me/905326832603?text=Merhaba, ${product.title} hakkında bilgi almak istiyorum.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    data-testid="contact-whatsapp"
                  >
                    WhatsApp ile İletişim
                  </a>

                  {product.contact_email && (
                    <a
                      href={`mailto:${product.contact_email}`}
                      className="block w-full bg-orange-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
                      data-testid="contact-email"
                    >
                      ✉️ E-posta Gönder
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
