import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { servicesAPI } from '../services/api';
import { openWhatsApp } from '../utils/whatsapp';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await servicesAPI.getAll();
        const foundService = response.data.find(s => s.id === id);
        if (foundService) {
          setService(foundService);
        } else {
          setError('Hizmet bulunamadı.');
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        setError('Hizmet yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col" data-testid="service-detail-page">
      <Navbar />

      <div className="flex-grow bg-gray-50 pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-8"
            data-testid="back-to-home-link"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Ana Sayfaya Dön
          </Link>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg mb-4" data-testid="error-message">{error}</p>
              <Link
                to="/"
                className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden" data-testid="service-detail">
              {/* Hero Section with Image */}
              {service.image_url ? (
                <div className="relative h-96">
                  <img
                    src={service.image_url}
                    alt={service.name}
                    className="w-full h-full object-cover"
                    data-testid="service-image"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-5xl">{service.icon}</span>
                      <h1 className="text-4xl md:text-5xl font-bold" data-testid="service-title">
                        {service.name}
                      </h1>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative h-96 bg-gradient-to-br from-orange-500 to-orange-700">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <span className="text-8xl mb-4">{service.icon}</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-center px-4" data-testid="service-title">
                      {service.name}
                    </h1>
                  </div>
                </div>
              )}

              {/* Content Section */}
              <div className="p-8 md:p-12">
                <div className="prose prose-lg max-w-none mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Hizmet Detayları</h2>
                  <p className="text-gray-700 text-lg leading-relaxed" data-testid="service-description">
                    {service.description}
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">✅ Profesyonel Hizmet</h3>
                    <p className="text-gray-600">
                      10+ yıllık deneyimli ekibimizle en kaliteli hizmeti sunuyoruz.
                    </p>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">🛡️ 6 Ay Garanti</h3>
                    <p className="text-gray-600">
                      Tüm hizmetlerimiz için 6 ay garanti sunuyoruz.
                    </p>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">⚡ Hızlı Teslimat</h3>
                    <p className="text-gray-600">
                      İşlemlerinizi 1-3 iş günü içinde tamamlıyoruz.
                    </p>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">💬 7/24 Destek</h3>
                    <p className="text-gray-600">
                      WhatsApp üzerinden 7/24 danışmanlık desteği sağlıyoruz.
                    </p>
                  </div>
                </div>

                {/* Additional Info based on service type */}
                {service.name === "AlienTech Yazılım" && (
                  <div className="bg-gray-50 p-6 rounded-lg mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">AlienTech Yazılım Detayları</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Motor performans optimizasyonu</li>
                      <li>• ECU yazılım güncellemeleri</li>
                      <li>• Yakıt tüketimi optimizasyonu</li>
                      <li>• Güç artırma çözümleri</li>
                      <li>• Tüm marka ve modellere destek</li>
                    </ul>
                  </div>
                )}

                {service.name === "Bakım & Onarım" && (
                  <div className="bg-gray-50 p-6 rounded-lg mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Bakım & Onarım Hizmetleri</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Periyodik bakım hizmetleri</li>
                      <li>• Motor bakımı ve revizyonu</li>
                      <li>• Fren sistemi kontrol ve bakımı</li>
                      <li>• Lastik değişimi ve balanslama</li>
                      <li>• Elektrik ve elektronik arıza tespiti</li>
                    </ul>
                  </div>
                )}

                {service.name === "Çanta Montaj Projelendirme" && (
                  <div className="bg-gray-50 p-6 rounded-lg mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Çanta Montaj Projelendirme</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• TSE onaylı çanta sistemleri</li>
                      <li>• Özel tasarım ve projelendirme</li>
                      <li>• Profesyonel montaj hizmeti</li>
                      <li>• Güvenlik testleri</li>
                      <li>• Uzun yol için ideal çözümler</li>
                    </ul>
                  </div>
                )}

                {service.name === "Sigorta Hasar Takip" && (
                  <div className="bg-gray-50 p-6 rounded-lg mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Sigorta Hasar Takip</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Tüm sigorta işlemleri takibi</li>
                      <li>• Hasar tespit ve raporlama</li>
                      <li>• Ekspertiz süreç yönetimi</li>
                      <li>• Onarım sonrası sigorta işlemleri</li>
                      <li>• Hızlı ve güvenilir çözüm</li>
                    </ul>
                  </div>
                )}

                {/* CTA Section */}
                <div className="border-t pt-8">
                  <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-8 rounded-xl text-center">
                    <h3 className="text-2xl font-bold mb-4">Bu Hizmeti Almak İster Misiniz?</h3>
                    <p className="text-orange-100 mb-6">
                      Hemen randevu alın veya detaylı bilgi için bize ulaşın
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link
                        to="/randevu"
                        className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition"
                        data-testid="service-cta-appointment"
                      >
                        Randevu Al
                      </Link>
                      <button
                        onClick={() => openWhatsApp(`Merhaba, ${service.name} hizmeti hakkında bilgi almak istiyorum.`)}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                        data-testid="service-cta-whatsapp"
                      >
                        WhatsApp ile İletişim
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">İletişim Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <div>
                      <p className="font-medium">📍 Adres:</p>
                      <p>Hızırreis Sok. No:1A, Bayrampaşa / İstanbul</p>
                    </div>
                    <div>
                      <p className="font-medium">📞 Telefon:</p>
                      <p>0532 683 26 03</p>
                    </div>
                    <div>
                      <p className="font-medium">✉️ E-posta:</p>
                      <p>bdgaraj1@gmail.com</p>
                    </div>
                    <div>
                      <p className="font-medium">🕐 Çalışma Saatleri:</p>
                      <p>Pazartesi - Cumartesi: 08:00 - 17:00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServiceDetailPage;
