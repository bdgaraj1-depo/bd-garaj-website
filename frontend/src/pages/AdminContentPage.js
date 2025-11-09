import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const AdminContentPage = () => {
  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-content-page">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📝 İçerik Yönetimi
            </h1>
            <p className="text-gray-600">Ana sayfa içeriklerini yönetin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Features */}
            <Link
              to="/admin/features"
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition group"
              data-testid="manage-features-card"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition">🎯</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition">
                Neden BD Garaj?
              </h2>
              <p className="text-gray-600">Özellikler bölümünü düzenle</p>
            </Link>

            {/* Testimonials */}
            <Link
              to="/admin/testimonials"
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition group"
              data-testid="manage-testimonials-card"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition">⭐</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition">
                Müşteri Yorumları
              </h2>
              <p className="text-gray-600">Yorumları yönet</p>
            </Link>

            {/* FAQs */}
            <Link
              to="/admin/faqs"
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition group"
              data-testid="manage-faqs-card"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition">❓</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition">
                S.S.S.
              </h2>
              <p className="text-gray-600">Sıkça sorulan soruları düzenle</p>
            </Link>

            {/* CTA Section */}
            <Link
              to="/admin/cta"
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition group"
              data-testid="manage-cta-card"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition">🚀</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition">
                Randevu CTA
              </h2>
              <p className="text-gray-600">CTA bölümünü düzenle</p>
            </Link>

            {/* Contact Info */}
            <Link
              to="/admin/contact"
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition group"
              data-testid="manage-contact-card"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition">📧</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition">
                İletişim Bilgileri
              </h2>
              <p className="text-gray-600">İletişim ve acil servis düzenle</p>
            </Link>

            {/* Back to Dashboard */}
            <Link
              to="/admin/dashboard"
              className="bg-gray-100 p-8 rounded-xl shadow-md hover:shadow-xl transition group"
              data-testid="back-dashboard-card"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition">⬅️</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Randevulara Dön
              </h2>
              <p className="text-gray-600">Ana panele geri dön</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContentPage;