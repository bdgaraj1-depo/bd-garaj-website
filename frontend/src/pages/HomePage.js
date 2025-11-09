import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { servicesAPI, featuresAPI, testimonialsAPI, faqsAPI, contactAPI, ctaAPI } from '../services/api';

const HomePage = () => {
  const [services, setServices] = useState([]);
  const [features, setFeatures] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [contactInfo, setContactInfo] = useState(null);
  const [ctaSection, setCtaSection] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, featuresRes, testimonialsRes, faqsRes, contactRes, ctaRes] = await Promise.all([
          servicesAPI.getAll(),
          featuresAPI.getAll(),
          testimonialsAPI.getAll(),
          faqsAPI.getAll(),
          contactAPI.get(),
          ctaAPI.get(),
        ]);
        
        setServices(servicesRes.data);
        setFeatures(featuresRes.data);
        setTestimonials(testimonialsRes.data);
        setFaqs(faqsRes.data);
        setContactInfo(contactRes.data);
        setCtaSection(ctaRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col" data-testid="home-page">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 to-orange-800 text-white pt-24 pb-20" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img 
                src="https://customer-assets.emergentagent.com/job_site-kurulum-10/artifacts/rasgr3sl_logo.png" 
                alt="BD Garaj Logo" 
                className="h-32 w-32 md:h-40 md:w-40 object-contain"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="hero-title">
              Burak Doğan'ın Garajı: BD Garaj
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100">
              Motosiklet tutkusunu profesyonellikle buluşturan özel servis noktası
            </p>
            <p className="text-lg mb-8 max-w-3xl mx-auto">
              İstanbul Bayrampaşa'da bulunan BD Garaj, her marka ve model motosiklet için AlienTech
              yazılım, bakım & onarım, çanta projelendirme ve montaj, sigorta ve dosya takibi
              hizmetleri sunuyoruz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/randevu"
                className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition shadow-lg"
                data-testid="hero-appointment-btn"
              >
                Hemen Randevu Al 🔥
              </Link>
              <a
                href="https://wa.me/905326832603"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg"
                data-testid="hero-whatsapp-btn"
              >
                WhatsApp İletişim
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ⚙️ Hizmetlerimiz
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Motosikletinizin performansını, güvenliğini ve sürüş keyfinizi artırıyoruz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/hizmet/${service.id}`}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden block group"
                data-testid={`service-card-${service.id}`}
              >
                {service.image_url ? (
                  <div className="relative overflow-hidden">
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"></div>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center group-hover:from-orange-500 group-hover:to-orange-700 transition-all">
                    <span className="text-6xl group-hover:scale-110 transition-transform">{service.icon}</span>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{service.icon}</span>
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">{service.name}</h3>
                  </div>
                  <p className="text-gray-600 mb-3">{service.description}</p>
                  <span className="text-orange-600 font-medium group-hover:underline">Detaylı Bilgi →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why BD Garaj */}
      <section className="py-20" data-testid="why-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🎯 Neden BD Garaj?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className="bg-orange-50 p-6 rounded-lg text-center"
                data-testid={`feature-${index}`}
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ⭐ Müşteri Yorumları
            </h2>
            <p className="text-lg text-gray-600">50+ mutlu müşteri ailesinden seçkiler</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white p-6 rounded-xl shadow-md"
                data-testid={`testimonial-${testimonial.id}`}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <div className="text-yellow-500">★★★★★</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20" data-testid="faq-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ❓ Sıkça Sorulan Sorular
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="bg-white p-6 rounded-lg shadow-md"
                data-testid={`faq-${faq.id}`}
              >
                <summary className="font-semibold text-gray-900 cursor-pointer">
                  {faq.question}
                </summary>
                <p className="mt-4 text-gray-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-600 text-white py-16" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            🚀 Hemen Randevu Alın!
          </h2>
          <p className="text-xl mb-8">%10 İndirimli İlk Servis</p>
          <Link
            to="/randevu"
            className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition shadow-lg inline-block"
            data-testid="cta-appointment-btn"
          >
            Randevu Formunu Doldur
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50" data-testid="contact-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              📧 İletişim Bilgileri
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📍 Adres</h3>
              <p className="text-gray-600 mb-4">Hızırreis Sok. No:1A, Bayrampaşa / İstanbul</p>
              <a
                href="https://maps.google.com/?q=Hızırreis+Sok.+No:1A+Bayrampaşa+Istanbul"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:underline"
                data-testid="contact-maps-link"
              >
                Haritada Gör
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📞 İletişim</h3>
              <p className="text-gray-600 mb-2">
                <strong>Telefon:</strong> 0532 683 26 03
              </p>
              <p className="text-gray-600 mb-2">
                <strong>E-posta:</strong> bdgaraj1@gmail.com
              </p>
              <p className="text-gray-600">
                <strong>Çalışma Saatleri:</strong> Pzt-Cmt 08:00-17:00
              </p>
            </div>
          </div>

          <div className="mt-8 bg-red-50 border border-red-200 p-6 rounded-lg text-center">
            <h3 className="text-xl font-semibold text-red-900 mb-2">🚨 Acıl Servis</h3>
            <p className="text-gray-700 mb-4">Acil durumlar için öncelikli hat:</p>
            <a
              href="tel:+905326832603"
              className="text-2xl font-bold text-red-600 hover:underline"
              data-testid="contact-emergency-phone"
            >
              0532 683 26 03
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;