import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ImageUploader from '../components/ImageUploader';
import { productsAPI } from '../services/api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadingImages, setUploadingImages] = useState([]);

  const [formData, setFormData] = useState({
    category: 'vehicle',
    title: '',
    description: '',
    price: '',
    currency: 'TRY',
    status: 'active',
    contact_phone: '05326832603',
    contact_email: 'bdgaraj1@gmail.com',
    images: [],
    specs: {},
  });

  const [newSpec, setNewSpec] = useState({ key: '', value: '' });

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      const category = selectedCategory === 'all' ? null : selectedCategory;
      const response = await productsAPI.getAll(category);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = async (file) => {
    try {
      const response = await productsAPI.uploadImage(file);
      const imageUrl = `${BACKEND_URL}${response.data.url}`;
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl],
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleAddSpec = () => {
    if (newSpec.key && newSpec.value) {
      setFormData({
        ...formData,
        specs: { ...formData.specs, [newSpec.key]: newSpec.value },
      });
      setNewSpec({ key: '', value: '' });
    }
  };

  const handleRemoveSpec = (key) => {
    const newSpecs = { ...formData.specs };
    delete newSpecs[key];
    setFormData({ ...formData, specs: newSpecs });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, data);
      } else {
        await productsAPI.create(data);
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Ürün kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      category: product.category,
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      currency: product.currency,
      status: product.status,
      contact_phone: product.contact_phone || '0532 683 26 03',
      contact_email: product.contact_email || 'bdgaraj1@gmail.com',
      images: product.images || [],
      specs: product.specs || {},
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      try {
        await productsAPI.delete(productId);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      category: 'vehicle',
      title: '',
      description: '',
      price: '',
      currency: 'TRY',
      status: 'active',
      contact_phone: '05326832603',
      contact_email: 'bdgaraj1@gmail.com',
      images: [],
      specs: {},
    });
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getCategoryName = (category) => {
    const categories = {
      vehicle: 'Araç',
      motorcycle: 'Motor',
      equipment: 'Ekipman',
    };
    return categories[category] || category;
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-products-page">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🚗 Ürün Yönetimi (OTO-MOTO)
              </h1>
              <p className="text-gray-600">Araç, motor ve ekipman ilanlarını yönetin</p>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link
                to="/admin/dashboard"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
              >
                Panele Dön
              </Link>
              <button
                onClick={handleNewProduct}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
                data-testid="new-product-btn"
              >
                + Yeni Ürün
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6 flex gap-2 overflow-x-auto">
            {[
              { id: 'all', name: 'Tümü' },
              { id: 'vehicle', name: 'Araçlar' },
              { id: 'motorcycle', name: 'Motorlar' },
              { id: 'equipment', name: 'Ekipmanlar' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === cat.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg mb-4">Henüz ürün yok.</p>
              <button
                onClick={handleNewProduct}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
              >
                İlk Ürünü Oluştur
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                  data-testid={`product-${product.id}`}
                >
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-6xl">📷</span>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded">
                        {getCategoryName(product.category)}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' :
                        product.status === 'sold' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {product.status === 'active' ? 'Aktif' : product.status === 'sold' ? 'Satıldı' : 'Rezerve'}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    
                    <p className="text-orange-600 font-bold mb-3">
                      {formatPrice(product.price, product.currency)}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                        data-testid={`edit-btn-${product.id}`}
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                        data-testid={`delete-btn-${product.id}`}
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="vehicle">🚙 Araç</option>
                    <option value="motorcycle">🏍️ Motor</option>
                    <option value="equipment">🧰 Ekipman</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Örn: 2020 Honda CB650R"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Ürün açıklaması..."
                  ></textarea>
                </div>

                {/* Price & Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fiyat *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="150000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Para Birimi
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="TRY">₺ TRY</option>
                      <option value="USD">$ USD</option>
                      <option value="EUR">€ EUR</option>
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="active">Aktif (Satılık)</option>
                    <option value="reserved">Rezerve</option>
                    <option value="sold">Satıldı</option>
                  </select>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Görseller
                  </label>
                  <div className="space-y-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img src={image} alt={`Product ${index + 1}`} className="w-full h-48 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <ImageUploader
                      onImageUpload={handleImageUpload}
                    />
                  </div>
                </div>

                {/* Specs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Özellikler
                  </label>
                  <div className="space-y-2 mb-4">
                    {Object.entries(formData.specs).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <span className="flex-1">{key}: {value}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(key)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Sil
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSpec.key}
                      onChange={(e) => setNewSpec({ ...newSpec, key: e.target.value })}
                      placeholder="Anahtar (örn: Yıl)"
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      value={newSpec.value}
                      onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
                      placeholder="Değer (örn: 2020)"
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpec}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                    >
                      Ekle
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İletişim Telefonu
                    </label>
                    <input
                      type="tel"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İletişim E-posta
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:bg-gray-400"
                >
                  {loading ? 'Kaydediliyor...' : editingProduct ? 'Güncelle' : 'Oluştur'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
