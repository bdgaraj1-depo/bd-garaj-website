# 🏍️ BD GARAJ - Web Sitesi

İstanbul Bayrampaşa'da bulunan BD Garaj için tam özellikli web sitesi ve yönetim paneli.

## 📋 Özellikler

### Genel Özellikler
- ✅ Modern ve responsive tasarım (Tailwind CSS)
- ✅ Hızlı ve kullanıcı dostu arayüz
- ✅ SEO uyumlu yapı
- ✅ Mobil uyumlu

### Müşteri Özellikleri
- 🏠 **Ana Sayfa**: Hizmetler, yorumlar, SSS ve iletişim bilgileri
- 📅 **Online Randevu Sistemi**: Kolay randevu oluşturma
- 📝 **Blog**: Motosiklet bakımı ve teknik bilgiler
- 💬 **WhatsApp İletişim**: Direkt WhatsApp bağlantısı
- 🚨 **Acil Servis İletişim**: Öncelikli hat bilgileri

### Admin Özellikleri
- 🔐 **Güvenli Admin Girişi**: JWT tabanlı authentication
- 📊 **Randevu Yönetimi**: Tüm randevuları görüntüleme, onaylama, iptal etme
- 📝 **Blog Yönetimi**: Blog yazıları oluşturma, düzenleme, silme
- 📲 **WhatsApp Bildirimleri**: Yeni randevularda otomatik bildirim (Twilio entegrasyonu)

## 🛠️ Teknoloji Stack

### Backend
- **FastAPI**: Modern Python web framework
- **MongoDB**: NoSQL veritabanı (Motor async driver)
- **JWT**: Güvenli authentication
- **Bcrypt**: Şifre hashleme
- **Twilio**: WhatsApp bildirimleri (opsiyonel)

### Frontend
- **React 19**: Modern UI kütüphanesi
- **React Router**: Sayfa yönlendirme
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **Shadcn/UI**: UI component library

## 📁 Proje Yapısı

```
/app/
├── backend/
│   ├── server.py           # FastAPI uygulaması
│   ├── requirements.txt    # Python bağımlılıkları
│   └── .env               # Backend environment variables
│
└── frontend/
    ├── src/
    │   ├── pages/         # Tüm sayfalar
    │   │   ├── HomePage.js
    │   │   ├── AppointmentPage.js
    │   │   ├── BlogListPage.js
    │   │   ├── BlogDetailPage.js
    │   │   ├── AdminLoginPage.js
    │   │   ├── AdminDashboard.js
    │   │   └── AdminBlogPage.js
    │   │
    │   ├── components/    # Yeniden kullanılabilir componentler
    │   │   ├── Navbar.js
    │   │   ├── Footer.js
    │   │   └── ProtectedRoute.js
    │   │
    │   ├── services/      # API servisleri
    │   │   └── api.js
    │   │
    │   ├── App.js        # Ana uygulama
    │   └── index.js      # Entry point
    │
    ├── package.json
    └── .env              # Frontend environment variables
```

## 🚀 Kurulum ve Çalıştırma

### Backend

```bash
cd /app/backend
pip install -r requirements.txt
```

### Frontend

```bash
cd /app/frontend
yarn install
```

### Tüm Servisleri Çalıştırma

```bash
sudo supervisorctl restart all
```

## 🔑 Varsayılan Admin Girişi

```
Kullanıcı Adı: admin
Şifre: admin123
```

**ÖNEMLİ:** Üretim ortamında bu bilgileri mutlaka değiştirin!

## 📲 WhatsApp Bildirimi Kurulumu

### Şu Anda: Mock (Sahte) Bildirim
Proje şu anda mock WhatsApp bildirimi ile çalışmaktadır. Bildirimler backend loglarında görünür ancak gerçek WhatsApp mesajı gönderilmez.

### Gerçek WhatsApp Entegrasyonu İçin

1. **Twilio Hesabı Oluşturun**: https://www.twilio.com/
2. **WhatsApp Sandbox Kurulumu**: Twilio Console'da WhatsApp sandbox'ı aktifleştirin
3. **Credentials Alın**:
   - Account SID
   - Auth Token
   - Twilio WhatsApp numarası (örn: whatsapp:+14155238886)

4. **Backend .env Dosyasını Güncelleyin**:

```env
# /app/backend/.env

TWILIO_ACCOUNT_SID="your_account_sid_here"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
BD_GARAJ_WHATSAPP="whatsapp:+905326832603"
TWILIO_ENABLED="true"
```

5. **Backend'i Yeniden Başlatın**:

```bash
sudo supervisorctl restart backend
```

## 🌐 API Endpoints

### Public Endpoints

```
GET  /api/                    # Health check
GET  /api/services            # Tüm hizmetleri listele
GET  /api/blog                # Tüm blog yazılarını listele
GET  /api/blog/{id}          # Tek blog yazısı
POST /api/appointments        # Yeni randevu oluştur
POST /api/auth/login          # Admin login
```

### Protected Endpoints (Admin Only)

```
GET    /api/auth/verify           # Token doğrulama
POST   /api/auth/register         # Yeni admin oluştur
GET    /api/appointments          # Tüm randevuları listele
PUT    /api/appointments/{id}     # Randevu güncelle
DELETE /api/appointments/{id}     # Randevu sil
POST   /api/blog                  # Blog yazısı oluştur
PUT    /api/blog/{id}            # Blog yazısı güncelle
DELETE /api/blog/{id}            # Blog yazısı sil
```

## 📊 MongoDB Collections

### admins
```javascript
{
  id: "uuid",
  username: "string",
  password_hash: "string",
  created_at: "datetime"
}
```

### appointments
```javascript
{
  id: "uuid",
  customer_name: "string",
  phone: "string",
  email: "string",
  service: "string",
  date: "YYYY-MM-DD",
  time: "HH:MM",
  notes: "string",
  status: "pending|confirmed|cancelled",
  created_at: "datetime"
}
```

### blog_posts
```javascript
{
  id: "uuid",
  title: "string",
  content: "string",
  author: "string",
  image_url: "string",
  created_at: "datetime",
  updated_at: "datetime"
}
```

### services
```javascript
{
  id: "uuid",
  name: "string",
  description: "string",
  icon: "emoji"
}
```

## 🔒 Güvenlik

- ✅ JWT token authentication
- ✅ Bcrypt password hashing
- ✅ CORS yapılandırması
- ✅ Protected admin routes
- ✅ Input validation (Pydantic)

## 📝 Önemli Notlar

1. **Environment Variables**: `.env` dosyalarını asla git'e commit etmeyin
2. **Production**: Üretim ortamında `JWT_SECRET_KEY` değiştirin
3. **Admin Şifresi**: Varsayılan admin şifresini değiştirin
4. **WhatsApp**: Gerçek WhatsApp bildirimleri için Twilio hesabı gereklidir
5. **Database**: MongoDB connection string'i `.env` dosyasında tanımlıdır

## 🎨 Tasarım

- **Renk Paleti**: Turuncu (#EA580C) ana renk, profesyonel ve sıcak görünüm
- **Tipografi**: Inter font ailesi
- **Icons**: Emoji icons (🏍️, 🔧, 💻, vb.)
- **Responsive**: Mobil, tablet ve desktop için optimize edilmiş

## 🆘 Destek ve İletişim

**BD Garaj**
- 📍 Adres: Hızırreis Sok. No:1A, Bayrampaşa / İstanbul
- 📞 Telefon: 0532 683 26 03
- ✉️ E-posta: bdgaraj1@gmail.com
- 💬 WhatsApp: [0532 683 26 03](https://wa.me/905326832603)

## 📄 Lisans

Bu proje BD Garaj için özel olarak geliştirilmiştir.

---

**Geliştirme Tarihi**: Kasım 2025
**Geliştirici**: E1 Agent by Emergent
**Versiyon**: 1.0.0
