import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ImageUploader from '../components/ImageUploader';
import { servicesAPI } from '../services/api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    image_url: '',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getAll();
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingService) {
        await servicesAPI.update(editingService.id, formData);
      } else {
        await servicesAPI.create(formData);
      }
      setShowModal(false);
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        icon: '',
        image_url: '',
      });
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Hizmet kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      icon: service.icon,
      image_url: service.image_url || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) {
      try {
        await servicesAPI.delete(serviceId);
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const handleNewService = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      image_url: '',
    });
    setShowModal(true);
  };

  const handleImageUpload = async (file) => {
    try {
      const response = await servicesAPI.uploadImage(file);
      const imageUrl = `${BACKEND_URL}${response.data.url}`;
      setFormData({
        ...formData,
        image_url: imageUrl,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleImageRemove = () => {
    setFormData({
      ...formData,
      image_url: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-services-page">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="services-admin-title">
                ⚙️ Hizmet Yönetimi
              </h1>
              <p className="text-gray-600">Site üzerinde gösterilecek hizmetleri yönetin</p>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link
                to="/admin/dashboard"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
                data-testid="back-to-dashboard-btn"
              >
                Randevulara Dön
              </Link>
              <button
                onClick={handleNewService}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
                data-testid="new-service-btn"
              >
                + Yeni Hizmet
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                  data-testid={`service-card-${service.id}`}
                >
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      data-testid={`edit-btn-${service.id}`}
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                      data-testid={`delete-btn-${service.id}`}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="service-modal">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingService ? 'Hizmeti Düzenle' : 'Yeni Hizmet'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hizmet Adı *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Örn: AlienTech Yazılım"
                    data-testid="service-name-input"
                  />
                </div>

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Hizmet açıklaması..."
                    data-testid="service-description-input"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon (Emoji) *
                  </label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Örn: 💻 (emoji kopyala-yapıştır)"
                    data-testid="service-icon-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    <a href="https://emojipedia.org/" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                      Emojipedia'dan
                    </a> emoji seçebilirsiniz
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:bg-gray-400"
                  data-testid="service-submit-btn"
                >
                  {loading ? 'Kaydediliyor...' : editingService ? 'Güncelle' : 'Oluştur'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingService(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
                  data-testid="service-cancel-btn"
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

export default AdminServicesPage;
