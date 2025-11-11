import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { appointmentsAPI } from '../services/api';

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentsAPI.getAll();
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await appointmentsAPI.update(appointmentId, { status: newStatus });
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) {
      try {
        await appointmentsAPI.delete(appointmentId);
        fetchAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'Beklemede',
      confirmed: 'Onaylandı',
      cancelled: 'İptal Edildi',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-dashboard">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="dashboard-title">
                📊 Yönetim Paneli
              </h1>
              <p className="text-gray-600">Randevuları yönetin ve takip edin</p>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0 flex-wrap">
              <Link
                to="/admin/content"
                className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition"
                data-testid="manage-content-btn"
              >
                🎨 İçerik Yönetimi
              </Link>
              <Link
                to="/admin/products"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                data-testid="manage-products-btn"
              >
                Ürün Yönetimi (OTO-MOTO & Yedek Parça)
              </Link>
              <Link
                to="/admin/services"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                data-testid="manage-services-btn"
              >
                Hizmet Yönetimi
              </Link>
              <Link
                to="/admin/comments"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
                data-testid="manage-comments-btn"
              >
                💬 Yorum Yönetimi
              </Link>
              <Link
                to="/admin/blog"
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
                data-testid="manage-blog-btn"
              >
                Blog Yönetimi
              </Link>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex space-x-4 overflow-x-auto">
              {[
                { key: 'all', label: 'Tümü' },
                { key: 'pending', label: 'Beklemede' },
                { key: 'confirmed', label: 'Onaylandı' },
                { key: 'cancelled', label: 'İptal Edildi' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === tab.key
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  data-testid={`filter-${tab.key}`}
                >
                  {tab.label} ({appointments.filter((a) => tab.key === 'all' || a.status === tab.key).length})
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg" data-testid="no-appointments">Randevu bulunamadı.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                  data-testid={`appointment-${appointment.id}`}
                >
                  <div className="flex flex-col lg:flex-row justify-between">
                    <div className="flex-grow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {appointment.customer_name}
                          </h3>
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="mb-1">
                            <strong>📞 Telefon:</strong> {appointment.phone}
                          </p>
                          <p className="mb-1">
                            <strong>✉️ E-posta:</strong> {appointment.email}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1">
                            <strong>🔧 Hizmet:</strong> {appointment.service}
                          </p>
                          <p className="mb-1">
                            <strong>📅 Tarih & Saat:</strong> {appointment.date} - {appointment.time}
                          </p>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>📝 Not:</strong> {appointment.notes}
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-4">
                        Oluşturulma: {formatDate(appointment.created_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 lg:mt-0 lg:ml-6 flex lg:flex-col gap-2">
                      {appointment.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                          data-testid={`confirm-btn-${appointment.id}`}
                        >
                          Onayla
                        </button>
                      )}
                      {appointment.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                          data-testid={`cancel-btn-${appointment.id}`}
                        >
                          İptal Et
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(appointment.id)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                        data-testid={`delete-btn-${appointment.id}`}
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
    </div>
  );
};

export default AdminDashboard;