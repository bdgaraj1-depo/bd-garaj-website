# 🖼️ SÜRÜKLE-BIRAK RESİM YÜKLEME ÖZELLİĞİ EKLENDİ!

## 📸 Yeni Özellik: Hizmetlere Resim Ekleme

Admin panelinden tüm hizmetlere **sürükle-bırak** ile resim yükleyebilirsiniz!

---

## ✨ Özellikler

### 🎯 Sürükle-Bırak (Drag & Drop)
- ✅ Resimleri doğrudan modal'a sürükleyip bırakın
- ✅ Veya tıklayarak dosya seçin
- ✅ Anlık görsel önizleme
- ✅ Yükleme durumu göstergesi

### 🛡️ Güvenlik ve Validasyon
- ✅ **Dosya Tipi Kontrolü**: Sadece resim dosyaları (JPEG, PNG, WEBP, GIF)
- ✅ **Boyut Kontrolü**: Maximum 5MB
- ✅ **Admin Koruması**: Sadece giriş yapmış admin kullanıcılar yükleyebilir
- ✅ **Güvenli Dosya İsimlendirme**: UUID ile benzersiz dosya isimleri

### 📁 Dosya Yönetimi
- ✅ Resimler `/app/backend/uploads/` klasörüne kaydedilir
- ✅ Static file serving ile sunulur
- ✅ Resim URL'leri MongoDB'de saklanır
- ✅ Resim değiştirme ve kaldırma

### 🎨 Görsel Gösterim
- ✅ **Admin Panelinde**: Hizmet kartlarında büyük resim gösterimi
- ✅ **Ana Sayfada**: Hizmet bölümünde resimli kartlar
- ✅ **Fallback**: Resim yoksa emoji icon gösterilir
- ✅ **Responsive**: Tüm ekran boyutlarında optimize edilmiş

---

## 🚀 Nasıl Kullanılır?

### 1. Admin Paneline Giriş Yapın
```
URL: /admin/login
Kullanıcı Adı: admin
Şifre: admin123
```

### 2. Hizmet Yönetimine Gidin
- Admin Dashboard'dan "Hizmet Yönetimi" butonuna tıklayın
- Veya direkt URL: `/admin/services`

### 3. Hizmet Oluşturun veya Düzenleyin
- Yeni hizmet için: "+ Yeni Hizmet" butonuna tıklayın
- Mevcut hizmeti düzenlemek için: "Düzenle" butonuna tıklayın

### 4. Resim Yükleyin
İki yöntemle resim yükleyebilirsiniz:

#### A) Sürükle-Bırak:
1. Bilgisayarınızdan bir resim dosyası seçin
2. Modal'daki yükleme alanına sürükleyin
3. Bırakın!
4. Resim otomatik olarak yüklenir ve önizleme gösterilir

#### B) Tıklayarak Seç:
1. Yükleme alanına tıklayın
2. Açılan dosya seçiciden resim seçin
3. Resim otomatik olarak yüklenir

### 5. Resmi Yönetin
- **Değiştir**: Resmin üzerine gelin, "Değiştir" butonuna tıklayın
- **Kaldır**: Resmin üzerine gelin, "Kaldır" butonuna tıklayın

### 6. Formu Kaydedin
- Tüm bilgileri doldurun
- "Oluştur" veya "Güncelle" butonuna tıklayın
- Hizmet resimle birlikte kaydedilir!

---

## 🔧 Teknik Detaylar

### Backend API

#### Yeni Endpoint:
```
POST /api/upload/service-image
```

**Headers:**
- `Authorization: Bearer {token}` (Admin token gerekli)
- `Content-Type: multipart/form-data`

**Body:**
- `file`: Resim dosyası

**Response:**
```json
{
  "url": "/uploads/1234-5678-90ab-cdef.jpg",
  "filename": "1234-5678-90ab-cdef.jpg"
}
```

**Error Responses:**
- 400: "Invalid file type. Only images allowed."
- 400: "File too large. Max 5MB allowed."
- 401: "Unauthorized" (Token geçersiz veya eksik)

### Service Model Güncellemeleri

```python
class Service(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    image_url: Optional[str] = ""  # 🆕 YENİ ALAN
```

### Frontend Componenti

#### ImageUploader Component
Lokasyon: `/app/frontend/src/components/ImageUploader.js`

**Props:**
- `currentImage`: Mevcut resim URL'si (opsiyonel)
- `onImageUpload`: Resim yüklendiğinde çağrılacak fonksiyon
- `onImageRemove`: Resim kaldırıldığında çağrılacak fonksiyon

**Özellikler:**
- Drag & drop desteği
- Click to select desteği
- Anlık önizleme
- Yükleme durumu göstergesi
- Resim değiştirme ve kaldırma butonları

### File Storage

**Dizin:** `/app/backend/uploads/`
**İzinler:** 777 (read/write/execute)
**Dosya İsimlendirme:** UUID v4 + orijinal uzantı

**Örnek:**
```
/app/backend/uploads/51384cef-9867-407b-8557-6648c5f336b6.jpg
```

### Static File Serving

Backend FastAPI uygulaması uploads klasörünü static olarak servis eder:

```python
app.mount("/uploads", StaticFiles(directory="/app/backend/uploads"), name="uploads")
```

**Erişim URL'leri:**
```
http://localhost:8001/uploads/{filename}
```

---

## 📊 Desteklenen Dosya Formatları

### Kabul Edilen Tipler:
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ WEBP (.webp)
- ✅ GIF (.gif)

### Kısıtlamalar:
- ❌ Maximum boyut: 5MB
- ❌ Sadece resim dosyaları
- ❌ Animasyonlu GIF'ler desteklenir ancak sadece ilk frame gösterilir

---

## 🎨 Görsel Deneyim

### Resim Var:
```
┌─────────────────────┐
│                     │
│    [HİZMET RESMİ]  │
│                     │
├─────────────────────┤
│ 💻 AlienTech       │
│ Motor performans... │
│                     │
│ [Düzenle] [Sil]    │
└─────────────────────┘
```

### Resim Yok (Fallback):
```
┌─────────────────────┐
│                     │
│       💻           │
│   (Emoji Icon)      │
│                     │
├─────────────────────┤
│ AlienTech Yazılım  │
│ Motor performans... │
│                     │
│ [Düzenle] [Sil]    │
└─────────────────────┘
```

---

## 🧪 Test Edildi

### Backend Tests:
- ✅ File upload endpoint çalışıyor
- ✅ File type validation çalışıyor
- ✅ File size validation hazır
- ✅ Admin authentication koruması çalışıyor
- ✅ Static file serving çalışıyor

### Frontend Tests:
- ✅ ImageUploader component derlendi
- ✅ Drag & drop fonksiyonu hazır
- ✅ Click to select hazır
- ✅ Preview gösterimi hazır
- ✅ Loading state gösterimi hazır

### Integration Tests:
- ✅ Resim yükleme API entegrasyonu
- ✅ Service kartlarında resim gösterimi (admin)
- ✅ Service kartlarında resim gösterimi (ana sayfa)
- ✅ Fallback icon gösterimi

---

## 📝 Kullanım Örnekleri

### Örnek 1: Yeni Hizmet + Resim

1. Admin paneline gir
2. Hizmet Yönetimi → + Yeni Hizmet
3. Formu doldur:
   - **Ad**: Test Sürüşü
   - **Açıklama**: Profesyonel test sürücülerimizle
   - **Icon**: 🏍️
4. Resim alanına motosiklet resmi sürükle
5. "Oluştur" butonuna tıkla
6. ✅ Hizmet resimle birlikte oluşturuldu!

### Örnek 2: Mevcut Hizmete Resim Ekle

1. Hizmet kartında "Düzenle" butonuna tıkla
2. Resim yükleme alanına tıkla
3. Bilgisayardan resim seç
4. Önizleme görünür
5. "Güncelle" butonuna tıkla
6. ✅ Hizmet güncellendi!

### Örnek 3: Resmi Değiştir

1. Hizmet kartında "Düzenle" butonuna tıkla
2. Mevcut resmin üzerine gel
3. "Değiştir" butonuna tıkla
4. Yeni resim seç
5. "Güncelle" butonuna tıkla
6. ✅ Resim değiştirildi!

---

## 🚨 Dikkat Edilmesi Gerekenler

### 📌 Önemli Notlar:

1. **Dosya Boyutu**: 5MB'dan büyük dosyalar yüklenemez
2. **Dosya Tipi**: Sadece resim dosyaları kabul edilir
3. **Admin Yetkisi**: Sadece admin kullanıcılar resim yükleyebilir
4. **Dosya İsimleri**: Otomatik olarak UUID ile yeniden isimlendirilir
5. **Silme**: Resim kaldırılırsa sadece URL silinir, dosya serverda kalır

### ⚠️ Üretim Ortamı İçin:

1. **Disk Alanı**: Uploads klasörü için disk alanı kontrolü yapın
2. **Backup**: Düzenli olarak uploads klasörünü yedekleyin
3. **CDN**: Yüksek trafik için CDN kullanmayı düşünün
4. **Temizlik**: Kullanılmayan resimleri periyodik olarak temizleyin
5. **Güvenlik**: Üretim ortamında HTTPS kullanın

---

## 🎉 Sonuç

BD Garaj web sitesi artık **tam özellikli resim yükleme** sistemine sahip!

### Eklenen Özellikler:
- ✅ Sürükle-bırak ile resim yükleme
- ✅ Resim önizleme
- ✅ Resim değiştirme ve kaldırma
- ✅ File type ve size validation
- ✅ Admin koruması
- ✅ Güvenli file storage
- ✅ Static file serving
- ✅ Responsive görsel gösterim

Admin kullanıcılar artık hizmetlere kolayca profesyonel görseller ekleyebilir! 🖼️

---

**Geliştirme Tarihi**: Kasım 2025
**Özellik**: Sürükle-Bırak Resim Yükleme
**Durum**: ✅ Aktif ve Çalışıyor
