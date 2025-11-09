import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { appointmentsAPI, servicesAPI } from '../services/api';

const AppointmentPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    service: '',
    date: '',
    time: '',
    notes: '',
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await servicesAPI.getAll();
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

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
    setSuccessMessage('');

    try {
      await appointmentsAPI.create(formData);
      setSuccessMessage(
        '✅ Randevunuz başarıyla oluşturuldu! BD Garaj WhatsApp bildirimini alacaktır.'
      );
      setFormData({
        customer_name: '',
        phone: '',
        email: '',
        service: '',
        date: '',
        time: '',
        notes: '',
      });
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      setErrorMessage('❌ Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Error creating appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  return (
    <div className="min-h-screen flex flex-col" data-testid="appointment-page">
      <Navbar />

      <div className="flex-grow bg-gray-50 pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="appointment-title">
              📅 Online Randevu Sistemi
            </h1>
            <p className="text-lg text-gray-600">
              Pazartesi – Cumartesi 08:00–17:00 arası hizmet
            </p>
          </div>

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6" data-testid="success-message">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-6" data-testid="error-message">
              {errorMessage}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} data-testid="appointment-form">
              <div className="space-y-6">
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adınız Soyadınız *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Örn: Ahmet Yıldız"
                    data-testid="appointment-name-input"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Örn: 0532 123 45 67"
                    data-testid="appointment-phone-input"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Örn: ornek@email.com"
                    data-testid="appointment-email-input"
                  />
                </div>

                {/* Service */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hizmet Seçimi *
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    data-testid="appointment-service-select"
                  >
                    <option value="">Hizmet seçiniz</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.icon} {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Randevu Tarihi *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    data-testid="appointment-date-input"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Randevu Saati *
                  </label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    data-testid="appointment-time-select"
                  >
                    <option value="">Saat seçiniz</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notlar (Opsiyonel)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Varsa ek notlarınızı buraya yazabilirsiniz..."
                    data-testid="appointment-notes-input"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 text-white py-4 rounded-lg font-semibold hover:bg-orange-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  data-testid="appointment-submit-btn"
                >
                  {loading ? 'Gönderiliyor...' : 'Randevu Oluştur'}
                </button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>📝 Not:</strong> Randevu oluşturduğunuzda BD Garaj'a anında WhatsApp bildirimi
                gönderilecektir. En kısa sürede sizinle iletişime geçilecektir.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AppointmentPage;