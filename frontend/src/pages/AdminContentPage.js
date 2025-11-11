import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { featuresAPI, testimonialsAPI, faqsAPI, contactAPI, ctaAPI } from '../services/api';

const AdminContentPage = () => {
  const [activeTab, setActiveTab] = useState('features');
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Features State
  const [features, setFeatures] = useState([]);
  const [editingFeature, setEditingFeature] = useState(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [featureForm, setFeatureForm] = useState({
    icon: '✨',
    title: '',
    description: '',
  });

  // Testimonials State
  const [testimonials, setTestimonials] = useState([]);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({
    customer_name: '',
    rating: 5,
    comment: '',
    service_type: '',
  });

  // FAQs State
  const [faqs, setFaqs] = useState([]);
  const [editingFaq, setEditingFaq] = useState(null);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
  });

  // Contact Info State
  const [contactInfo, setContactInfo] = useState({
    phone: '0532 683 26 03',
    email: 'bdgaraj1@gmail.com',
    address: 'Hızırreis Sok. No:1A, Bayrampaşa / İstanbul',
    whatsapp: '905326832603',
    working_hours: 'Pazartesi - Cumartesi: 08:00 - 17:00',
    emergency_phone: '0532 683 26 03',
    maps_url: 'https://maps.google.com/?q=Hızırreis+Sok.+No:1A+Bayrampaşa+Istanbul',
  });

  // CTA Section State
  const [ctaSection, setCTASection] = useState({
    title: '🚀 Hemen Randevu Alın!',
    subtitle: 'Motosikletiniz için hemen randevu alın, profesyonel hizmetlerimizden faydalanın',
    button_text: 'Hemen Randevu Al',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [featuresRes, testimonialsRes, faqsRes, contactRes, ctaRes] = await Promise.all([
        featuresAPI.getAll(),
        testimonialsAPI.getAll(),
        faqsAPI.getAll(),
        contactAPI.get(),
        ctaAPI.get(),
      ]);

      setFeatures(featuresRes.data);
      setTestimonials(testimonialsRes.data);
      setFaqs(faqsRes.data);
      setContactInfo(contactRes.data);
      setCTASection(ctaRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSaveMessage = (message) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // Features Handlers
  const handleFeatureSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFeature) {
        await featuresAPI.update(editingFeature.id, featureForm);
        showSaveMessage('Özellik güncellendi!');
      } else {
        await featuresAPI.create(featureForm);
        showSaveMessage('Yeni özellik eklendi!');
      }
      setShowFeatureModal(false);
      setEditingFeature(null);
      setFeatureForm({ icon: '✨', title: '', description: '' });
      fetchAllData();
    } catch (error) {
      console.error('Error saving feature:', error);
      alert('Özellik kaydedilirken hata oluştu.');
    }
  };

  const handleFeatureDelete = async (id) => {
    if (window.confirm('Bu özelliği silmek istediğinizden emin misiniz?')) {
      try {
        await featuresAPI.delete(id);
        showSaveMessage('Özellik silindi!');
        fetchAllData();
      } catch (error) {
        console.error('Error deleting feature:', error);
      }
    }
  };

  // Testimonials Handlers
  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTestimonial) {
        await testimonialsAPI.update(editingTestimonial.id, testimonialForm);
        showSaveMessage('Yorum güncellendi!');
      } else {
        await testimonialsAPI.create(testimonialForm);
        showSaveMessage('Yeni yorum eklendi!');
      }
      setShowTestimonialModal(false);
      setEditingTestimonial(null);
      setTestimonialForm({ customer_name: '', rating: 5, comment: '', service_type: '' });
      fetchAllData();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('Yorum kaydedilirken hata oluştu.');
    }
  };

  const handleTestimonialDelete = async (id) => {
    if (window.confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
      try {
        await testimonialsAPI.delete(id);
        showSaveMessage('Yorum silindi!');
        fetchAllData();
      } catch (error) {
        console.error('Error deleting testimonial:', error);
      }
    }
  };

  // FAQs Handlers
  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        await faqsAPI.update(editingFaq.id, faqForm);
        showSaveMessage('SSS güncellendi!');
      } else {
        await faqsAPI.create(faqForm);
        showSaveMessage('Yeni SSS eklendi!');
      }
      setShowFaqModal(false);
      setEditingFaq(null);
      setFaqForm({ question: '', answer: '' });
      fetchAllData();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('SSS kaydedilirken hata oluştu.');
    }
  };

  const handleFaqDelete = async (id) => {
    if (window.confirm('Bu SSS\'i silmek istediğinizden emin misiniz?')) {
      try {
        await faqsAPI.delete(id);
        showSaveMessage('SSS silindi!');
        fetchAllData();
      } catch (error) {
        console.error('Error deleting FAQ:', error);
      }
    }
  };

  // Contact Info Handlers
  const handleContactChange = (e) => {
    setContactInfo({ ...contactInfo, [e.target.name]: e.target.value });
  };

  const handleContactSave = async () => {
    try {
      await contactAPI.update(contactInfo);
      showSaveMessage('İletişim bilgileri güncellendi!');
      fetchAllData();
    } catch (error) {
      console.error('Error updating contact info:', error);
      alert('İletişim bilgileri güncellenirken hata oluştu.');
    }
  };

  // CTA Section Handlers
  const handleCTAChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setCTASection({ ...ctaSection, [e.target.name]: value });
  };

  const handleCTASave = async () => {
    try {
      await ctaAPI.update(ctaSection);
      showSaveMessage('CTA bölümü güncellendi!');
      fetchAllData();
    } catch (error) {
      console.error('Error updating CTA section:', error);
      alert('CTA bölümü güncellenirken hata oluştu.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🎨 İçerik Yönetimi</h1>
              <p className="text-gray-600">Ana sayfa içeriklerini düzenleyin</p>
            </div>
            <Link
              to="/admin/dashboard"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
            >
              Panele Dön
            </Link>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              ✅ {saveMessage}
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex overflow-x-auto">
              {[
                { id: 'features', label: '✨ Neden BD Garaj?' },
                { id: 'testimonials', label: '💬 Müşteri Yorumları' },
                { id: 'faqs', label: '❓ SSS' },
                { id: 'contact', label: '📞 İletişim' },
                { id: 'cta', label: '🚀 CTA Bölümü' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-medium transition whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-gray-600 hover:text-orange-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-lg shadow-md p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              </div>
            ) : (
              <>
                {/* Features Tab */}
                {activeTab === 'features' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">✨ Neden BD Garaj?</h2>
                      <button
                        onClick={() => {
                          setEditingFeature(null);
                          setFeatureForm({ icon: '✨', title: '', description: '' });
                          setShowFeatureModal(true);
                        }}
                        className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
                      >
                        + Yeni Özellik
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {features.map((feature) => (
                        <div key={feature.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                          <div className="flex items-start justify-between">
                            <div className="flex-grow">
                              <div className="text-3xl mb-2">{feature.icon}</div>
                              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                              <p className="text-gray-600 text-sm">{feature.description}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => {
                                  setEditingFeature(feature);
                                  setFeatureForm(feature);
                                  setShowFeatureModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-xl"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleFeatureDelete(feature.id)}
                                className="text-red-600 hover:text-red-800 text-xl"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Testimonials Tab */}
                {activeTab === 'testimonials' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">💬 Müşteri Yorumları</h2>
                      <button
                        onClick={() => {
                          setEditingTestimonial(null);
                          setTestimonialForm({ customer_name: '', rating: 5, comment: '', service_type: '' });
                          setShowTestimonialModal(true);
                        }}
                        className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
                      >
                        + Yeni Yorum
                      </button>
                    </div>

                    <div className="space-y-4">
                      {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                          <div className="flex justify-between items-start">
                            <div className="flex-grow">
                              <h3 className="font-semibold text-lg">{testimonial.customer_name}</h3>
                              <div className="flex items-center gap-2 my-2">
                                <span className="text-yellow-500">{'⭐'.repeat(testimonial.rating)}</span>
                                <span className="text-sm text-gray-500">• {testimonial.service_type}</span>
                              </div>
                              <p className="text-gray-700">{testimonial.comment}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => {
                                  setEditingTestimonial(testimonial);
                                  setTestimonialForm(testimonial);
                                  setShowTestimonialModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-xl"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleTestimonialDelete(testimonial.id)}
                                className="text-red-600 hover:text-red-800 text-xl"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FAQs Tab */}
                {activeTab === 'faqs' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">❓ Sıkça Sorulan Sorular</h2>
                      <button
                        onClick={() => {
                          setEditingFaq(null);
                          setFaqForm({ question: '', answer: '' });
                          setShowFaqModal(true);
                        }}
                        className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
                      >
                        + Yeni SSS
                      </button>
                    </div>

                    <div className="space-y-4">
                      {faqs.map((faq) => (
                        <div key={faq.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                          <div className="flex justify-between items-start">
                            <div className="flex-grow">
                              <h3 className="font-semibold text-lg mb-2">❓ {faq.question}</h3>
                              <p className="text-gray-700">{faq.answer}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => {
                                  setEditingFaq(faq);
                                  setFaqForm(faq);
                                  setShowFaqModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-xl"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleFaqDelete(faq.id)}
                                className="text-red-600 hover:text-red-800 text-xl"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Info Tab */}
                {activeTab === 'contact' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">📞 İletişim Bilgileri</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📱 Telefon (Görüntüleme için)
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={contactInfo.phone}
                          onChange={handleContactChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="0532 683 26 03"
                        />
                        <p className="text-xs text-gray-500 mt-1">Format: 0532 683 26 03</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          💬 WhatsApp Numarası (0 olmadan)
                        </label>
                        <input
                          type="text"
                          name="whatsapp"
                          value={contactInfo.whatsapp}
                          onChange={handleContactChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="905326832603"
                        />
                        <p className="text-xs text-gray-500 mt-1">Format: 905326832603 (ülke kodu + numara)</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📧 E-posta Adresi
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={contactInfo.email}
                        onChange={handleContactChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="bdgaraj1@gmail.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📍 Adres
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={contactInfo.address}
                        onChange={handleContactChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Hızırreis Sok. No:1A, Bayrampaşa / İstanbul"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🗺️ Google Maps URL
                      </label>
                      <input
                        type="url"
                        name="maps_url"
                        value={contactInfo.maps_url}
                        onChange={handleContactChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="https://maps.google.com/?q=..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Google Maps'te konumunuzu bulun ve "Paylaş" → "Link Kopyala"
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ⏰ Çalışma Saatleri
                      </label>
                      <input
                        type="text"
                        name="working_hours"
                        value={contactInfo.working_hours}
                        onChange={handleContactChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Pazartesi - Cumartesi: 08:00 - 17:00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🚨 Acil Servis Telefonu
                      </label>
                      <input
                        type="text"
                        name="emergency_phone"
                        value={contactInfo.emergency_phone}
                        onChange={handleContactChange}
                        className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        placeholder="0532 683 26 03"
                      />
                      <p className="text-xs text-red-500 mt-1">
                        Acil durumlar için gösterilecek telefon numarası
                      </p>
                    </div>

                    <div className="pt-4 border-t">
                      <button
                        onClick={handleContactSave}
                        className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition font-semibold"
                      >
                        💾 Değişiklikleri Kaydet
                      </button>
                    </div>
                  </div>
                )}

                {/* CTA Section Tab */}
                {activeTab === 'cta' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      🚀 Hemen Randevu Alın! (CTA Bölümü)
                    </h2>
                    
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                      <p className="text-sm text-blue-800">
                        ℹ️ Bu bölüm ana sayfada turuncu arka planlı büyük bir banner olarak görünür ve 
                        kullanıcıları randevu almaya teşvik eder.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📝 Ana Başlık
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={ctaSection.title}
                        onChange={handleCTAChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-lg font-semibold"
                        placeholder="🚀 Hemen Randevu Alın!"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Büyük ve dikkat çekici bir başlık kullanın
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        💬 Alt Başlık / Açıklama
                      </label>
                      <textarea
                        name="subtitle"
                        value={ctaSection.subtitle}
                        onChange={handleCTAChange}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Motosikletiniz için hemen randevu alın, profesyonel hizmetlerimizden faydalanın"
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-1">
                        Kullanıcıları motive eden kısa bir açıklama
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🔘 Buton Metni
                      </label>
                      <input
                        type="text"
                        name="button_text"
                        value={ctaSection.button_text}
                        onChange={handleCTAChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Hemen Randevu Al"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Buton üzerinde gösterilecek metin (kısa ve etkili)
                      </p>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-100 p-6 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-xs text-gray-600 mb-4 font-semibold">👁️ ÖNİZLEME:</p>
                      <div className="bg-orange-600 text-white p-8 rounded-lg text-center">
                        <h3 className="text-2xl md:text-3xl font-bold mb-3">
                          {ctaSection.title}
                        </h3>
                        <p className="text-lg mb-6 opacity-90">
                          {ctaSection.subtitle}
                        </p>
                        <button className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold">
                          {ctaSection.button_text}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <button
                        onClick={handleCTASave}
                        className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition font-semibold"
                      >
                        💾 Değişiklikleri Kaydet
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Feature Modal */}
      {showFeatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold mb-4">
              {editingFeature ? 'Özellik Düzenle' : 'Yeni Özellik Ekle'}
            </h2>
            <form onSubmit={handleFeatureSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">İkon (Emoji)</label>
                <input
                  type="text"
                  value={featureForm.icon}
                  onChange={(e) => setFeatureForm({ ...featureForm, icon: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="✨"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
                <input
                  type="text"
                  value={featureForm.title}
                  onChange={(e) => setFeatureForm({ ...featureForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                <textarea
                  value={featureForm.description}
                  onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                ></textarea>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeatureModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testimonial Modal */}
      {showTestimonialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold mb-4">
              {editingTestimonial ? 'Yorum Düzenle' : 'Yeni Yorum Ekle'}
            </h2>
            <form onSubmit={handleTestimonialSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Müşteri Adı</label>
                <input
                  type="text"
                  value={testimonialForm.customer_name}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, customer_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Puan (1-5)</label>
                <select
                  value={testimonialForm.rating}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  {[5, 4, 3, 2, 1].map(num => (
                    <option key={num} value={num}>{'⭐'.repeat(num)} ({num})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hizmet Tipi</label>
                <input
                  type="text"
                  value={testimonialForm.service_type}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, service_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Örn: AlienTech Yazılım"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Yorum</label>
                <textarea
                  value={testimonialForm.comment}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, comment: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                ></textarea>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setShowTestimonialModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold mb-4">
              {editingFaq ? 'SSS Düzenle' : 'Yeni SSS Ekle'}
            </h2>
            <form onSubmit={handleFaqSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Soru</label>
                <input
                  type="text"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cevap</label>
                <textarea
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                ></textarea>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setShowFaqModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
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

export default AdminContentPage;
