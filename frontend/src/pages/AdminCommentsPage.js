import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { commentsAPI, servicesAPI } from '../services/api';

const AdminCommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchComments();
    fetchServices();
  }, [filter]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === 'all' ? null : filter;
      const response = await commentsAPI.getAllAdmin(null, statusFilter);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getAll();
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const getServiceName = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : 'Bilinmeyen Hizmet';
  };

  const handleStatusChange = async (commentId, newStatus) => {
    try {
      await commentsAPI.updateStatus(commentId, newStatus);
      fetchComments();
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Yorum güncellenirken bir hata oluştu.');
    }
  };

  const handleDelete = async (commentId) => {
    if (window.confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
      try {
        await commentsAPI.delete(commentId);
        fetchComments();
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Yorum silinirken bir hata oluştu.');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'Beklemede',
      approved: 'Onaylandı',
      rejected: 'Reddedildi',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const pendingCount = comments.filter(c => c.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-comments-page">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                💬 Yorum Yönetimi
              </h1>
              <p className="text-gray-600">
                Müşteri yorumlarını onaylayın veya reddedin
                {pendingCount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    {pendingCount} bekleyen yorum
                  </span>
                )}
              </p>
            </div>
            <Link
              to="/admin/dashboard"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition mt-4 md:mt-0"
            >
              Panele Dön
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex space-x-4 overflow-x-auto">
              {[
                { key: 'all', label: 'Tümü' },
                { key: 'pending', label: 'Beklemede' },
                { key: 'approved', label: 'Onaylandı' },
                { key: 'rejected', label: 'Reddedildi' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                    filter === tab.key
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  data-testid={`filter-${tab.key}`}
                >
                  {tab.label} ({comments.filter((c) => tab.key === 'all' || c.status === tab.key).length})
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg">Yorum bulunamadı.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                  data-testid={`comment-${comment.id}`}
                >
                  <div className="flex flex-col lg:flex-row justify-between">
                    <div className="flex-grow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {comment.user_name}
                            </h3>
                            {getStatusBadge(comment.status)}
                          </div>
                          <p className="text-sm text-gray-500">{comment.user_email}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>🔧 Hizmet:</strong> {getServiceName(comment.service_id)}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>⭐ Puan:</strong> {'⭐'.repeat(comment.rating)} ({comment.rating}/5)
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>📅 Tarih:</strong> {new Date(comment.created_at).toLocaleString('tr-TR')}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700">{comment.comment_text}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 lg:mt-0 lg:ml-6 flex lg:flex-col gap-2">
                      {comment.status !== 'approved' && (
                        <button
                          onClick={() => handleStatusChange(comment.id, 'approved')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                          data-testid={`approve-btn-${comment.id}`}
                        >
                          ✓ Onayla
                        </button>
                      )}
                      {comment.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(comment.id, 'rejected')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                          data-testid={`reject-btn-${comment.id}`}
                        >
                          ✗ Reddet
                        </button>
                      )}
                      {comment.status === 'approved' && (
                        <button
                          onClick={() => handleStatusChange(comment.id, 'pending')}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm"
                        >
                          ⟲ Bekletmeye Al
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                        data-testid={`delete-btn-${comment.id}`}
                      >
                        🗑️ Sil
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

export default AdminCommentsPage;
