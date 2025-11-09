from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, File, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
security = HTTPBearer()

# Twilio Configuration
TWILIO_ENABLED = os.environ.get('TWILIO_ENABLED', 'false').lower() == 'true'
if TWILIO_ENABLED:
    from twilio.rest import Client
    TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
    TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
    TWILIO_WHATSAPP_FROM = os.environ.get('TWILIO_WHATSAPP_FROM')
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

BD_GARAJ_WHATSAPP = os.environ.get('BD_GARAJ_WHATSAPP', 'whatsapp:+905326832603')

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class Admin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminCreate(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    phone: str
    email: EmailStr
    service: str
    date: str  # YYYY-MM-DD format
    time: str  # HH:MM format
    notes: Optional[str] = ""
    status: str = "pending"  # pending, confirmed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AppointmentCreate(BaseModel):
    customer_name: str
    phone: str
    email: EmailStr
    service: str
    date: str
    time: str
    notes: Optional[str] = ""

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    author: str = "BD Garaj"
    image_url: Optional[str] = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlogPostCreate(BaseModel):
    title: str
    content: str
    author: Optional[str] = "BD Garaj"
    image_url: Optional[str] = ""

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    author: Optional[str] = None
    image_url: Optional[str] = None

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    icon: str
    image_url: Optional[str] = ""

class Feature(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    icon: str
    title: str
    description: str
    order: int = 0

class FeatureCreate(BaseModel):
    icon: str
    title: str
    description: str
    order: int = 0

class FeatureUpdate(BaseModel):
    icon: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None

class Testimonial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    text: str
    rating: int = 5
    order: int = 0

class TestimonialCreate(BaseModel):
    name: str
    text: str
    rating: int = 5
    order: int = 0

class TestimonialUpdate(BaseModel):
    name: Optional[str] = None
    text: Optional[str] = None
    rating: Optional[int] = None
    order: Optional[int] = None

class FAQ(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str
    order: int = 0

class FAQCreate(BaseModel):
    question: str
    answer: str
    order: int = 0

class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    order: Optional[int] = None

class ContactInfo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "contact_info"
    address: str
    phone: str
    email: str
    whatsapp: str
    working_hours: str
    emergency_phone: str
    maps_url: str

class ContactInfoUpdate(BaseModel):
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    working_hours: Optional[str] = None
    emergency_phone: Optional[str] = None
    maps_url: Optional[str] = None

class CTASection(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "cta_section"
    title: str
    subtitle: str
    button_text: str

class CTASectionUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    button_text: Optional[str] = None

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str  # "vehicle", "motorcycle", "equipment"
    title: str
    description: str
    price: float
    currency: str = "TRY"
    images: List[str] = []
    status: str = "active"  # active, sold, reserved
    contact_phone: Optional[str] = ""
    contact_email: Optional[str] = ""
    specs: Optional[dict] = {}  # Additional specs like year, km, brand, etc
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    category: str
    title: str
    description: str
    price: float
    currency: str = "TRY"
    images: List[str] = []
    status: str = "active"
    contact_phone: Optional[str] = ""
    contact_email: Optional[str] = ""
    specs: Optional[dict] = {}

class ProductUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    images: Optional[List[str]] = None
    status: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    specs: Optional[dict] = None

class Comment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    service_id: str
    user_name: str
    user_email: EmailStr
    comment_text: str
    rating: Optional[int] = Field(default=5, ge=1, le=5)  # 1-5 yıldız
    status: str = "pending"  # pending, approved, rejected
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CommentCreate(BaseModel):
    service_id: str
    user_name: str
    user_email: EmailStr
    comment_text: str
    rating: Optional[int] = Field(default=5, ge=1, le=5)

class CommentUpdate(BaseModel):
    status: str  # approved, rejected

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=24)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        admin = await db.admins.find_one({"username": username}, {"_id": 0})
        if admin is None:
            raise HTTPException(status_code=401, detail="Admin not found")
        return Admin(**admin)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def send_whatsapp_notification(appointment: Appointment):
    """Send WhatsApp notification to BD Garaj"""
    message = f"""🏍️ YENİ RANDEVU!

👤 Müşteri: {appointment.customer_name}
📞 Telefon: {appointment.phone}
📧 E-posta: {appointment.email}
🔧 Hizmet: {appointment.service}
📅 Tarih: {appointment.date}
🕐 Saat: {appointment.time}
📝 Not: {appointment.notes if appointment.notes else 'Yok'}

Randevu ID: {appointment.id}"""

    if TWILIO_ENABLED:
        try:
            message_response = twilio_client.messages.create(
                body=message,
                from_=TWILIO_WHATSAPP_FROM,
                to=BD_GARAJ_WHATSAPP
            )
            logger.info(f"WhatsApp sent: {message_response.sid}")
            return True
        except Exception as e:
            logger.error(f"WhatsApp error: {str(e)}")
            return False
    else:
        logger.info(f"[MOCK WhatsApp] Message to {BD_GARAJ_WHATSAPP}:\n{message}")
        return True

# ==================== INITIALIZATION ====================

@app.on_event("startup")
async def startup_db_client():
    """Initialize database with default admin and services"""
    # Create uploads directory if not exists
    uploads_dir = Path("/app/backend/uploads")
    uploads_dir.mkdir(exist_ok=True)
    logger.info(f"Uploads directory: {uploads_dir}")
    
    # Create default admin if not exists
    admin_exists = await db.admins.find_one({"username": "Burak5834"})
    if not admin_exists:
        # Remove old admin if exists
        await db.admins.delete_many({"username": "admin"})
        
        default_admin = Admin(
            username="Burak5834",
            password_hash=hash_password("Burak58811434")
        )
        doc = default_admin.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.admins.insert_one(doc)
        logger.info("Default admin created: username=Burak5834")

    # Create default services
    services_count = await db.services.count_documents({})
    if services_count == 0:
        default_services = [
            Service(name="AlienTech Yazılım", description="Motor performans optimizasyonu ve ECU yazılımı", icon="💻"),
            Service(name="Bakım & Onarım", description="Periyodik bakım ve genel onarım hizmetleri", icon="🔧"),
            Service(name="Çanta Montaj Projelendirme", description="TSE onaylı çanta sistemleri projelendirme ve montaj", icon="🧳"),
            Service(name="Sigorta Hasar Takip", description="Kaza ve hasar durumlarında sigorta işlemleri takibi", icon="📋"),
            Service(name="OTO-MOTO Alım Satım", description="Araç, motor ve ekipman alım satım hizmetleri", icon="🚗"),
        ]
        for service in default_services:
            doc = service.model_dump()
            await db.services.insert_one(doc)
        logger.info(f"{len(default_services)} default services created")
    
    # Update old service names if they exist
    await db.services.update_one(
        {"name": "Çanta Montajı"},
        {"$set": {"name": "Çanta Montaj Projelendirme"}}
    )
    await db.services.update_one(
        {"name": "Sigorta Takibi"},
        {"$set": {"name": "Sigorta Hasar Takip"}}
    )
    
    # Create default features (Neden BD Garaj)
    features_count = await db.features.count_documents({})
    if features_count == 0:
        default_features = [
            Feature(icon="👨‍🔧", title="10+ yıllık deneyim", description="Sektör uzmanı ekip", order=1),
            Feature(icon="🇹🇷", title="Yerli üretim", description="Çözümlerimiz yerli ve milli", order=2),
            Feature(icon="✅", title="6 ay garanti", description="Tüm hizmetlerde garanti", order=3),
            Feature(icon="📞", title="7/24 destek", description="Danışmanlık desteği", order=4),
        ]
        for feature in default_features:
            await db.features.insert_one(feature.model_dump())
        logger.info(f"{len(default_features)} default features created")
    
    # Create default testimonials
    testimonials_count = await db.testimonials.count_documents({})
    if testimonials_count == 0:
        default_testimonials = [
            Testimonial(name="Ahmet Y.", text="Profesyonel ekip, güvenilir hizmet!", rating=5, order=1),
            Testimonial(name="Mehmet K.", text="Motosikletim adeta yeniden doğdu!", rating=5, order=2),
            Testimonial(name="Burak D.", text="İlgileri ve iş kaliteleri mükemmel", rating=5, order=3),
        ]
        for testimonial in default_testimonials:
            await db.testimonials.insert_one(testimonial.model_dump())
        logger.info(f"{len(default_testimonials)} default testimonials created")
    
    # Create default FAQs
    faqs_count = await db.faqs.count_documents({})
    if faqs_count == 0:
        default_faqs = [
            FAQ(question="Hangi motosiklet markalarına hizmet veriyorsunuz?", answer="Tüm marka ve modellere hizmet veriyoruz.", order=1),
            FAQ(question="İşlem süreleri ne kadar?", answer="İşleme göre değişmekle birlikte, 1-3 iş günü arasında tamamlıyoruz.", order=2),
            FAQ(question="Garanti hizmetiniz var mı?", answer="Evet, tüm hizmetlerimiz için 6 ay garanti sunuyoruz.", order=3),
            FAQ(question="Acil durumlarda ne yapmalıyım?", answer="7/24 WhatsApp hattımızdan bize ulaşabilirsiniz.", order=4),
        ]
        for faq in default_faqs:
            await db.faqs.insert_one(faq.model_dump())
        logger.info(f"{len(default_faqs)} default FAQs created")
    
    # Create default contact info
    contact_exists = await db.contact_info.find_one({"id": "contact_info"})
    if not contact_exists:
        default_contact = ContactInfo(
            address="Hızırreis Sok. No:1A, Bayrampaşa / İstanbul",
            phone="0532 683 26 03",
            email="bdgaraj1@gmail.com",
            whatsapp="+905326832603",
            working_hours="Pazartesi - Cumartesi: 08:00 - 17:00",
            emergency_phone="0532 683 26 03",
            maps_url="https://maps.google.com/?q=Hızırreis+Sok.+No:1A+Bayrampaşa+Istanbul"
        )
        await db.contact_info.insert_one(default_contact.model_dump())
        logger.info("Default contact info created")
    
    # Create default CTA section
    cta_exists = await db.cta_section.find_one({"id": "cta_section"})
    if not cta_exists:
        default_cta = CTASection(
            title="🚀 Hemen Randevu Alın!",
            subtitle="%10 İndirimli İlk Servis",
            button_text="Randevu Formunu Doldur"
        )
        await db.cta_section.insert_one(default_cta.model_dump())
        logger.info("Default CTA section created")

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(admin_login: AdminLogin):
    admin = await db.admins.find_one({"username": admin_login.username}, {"_id": 0})
    if not admin or not verify_password(admin_login.password, admin['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token = create_access_token(data={"sub": admin['username']})
    return TokenResponse(access_token=access_token)

@api_router.get("/auth/verify")
async def verify_token(current_admin: Admin = Depends(get_current_admin)):
    return {"username": current_admin.username, "valid": True}

@api_router.post("/auth/register", response_model=Admin)
async def register_admin(admin_create: AdminCreate, current_admin: Admin = Depends(get_current_admin)):
    """Only existing admins can create new admins"""
    existing = await db.admins.find_one({"username": admin_create.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_admin = Admin(
        username=admin_create.username,
        password_hash=hash_password(admin_create.password)
    )
    doc = new_admin.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.admins.insert_one(doc)
    return new_admin

# ==================== APPOINTMENT ENDPOINTS ====================

@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appointment_create: AppointmentCreate):
    appointment = Appointment(**appointment_create.model_dump())
    
    doc = appointment.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.appointments.insert_one(doc)
    
    # Send WhatsApp notification
    await send_whatsapp_notification(appointment)
    
    return appointment

@api_router.get("/appointments", response_model=List[Appointment])
async def get_appointments(current_admin: Admin = Depends(get_current_admin)):
    appointments = await db.appointments.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for apt in appointments:
        if isinstance(apt['created_at'], str):
            apt['created_at'] = datetime.fromisoformat(apt['created_at'])
    return appointments

@api_router.get("/appointments/{appointment_id}", response_model=Appointment)
async def get_appointment(appointment_id: str, current_admin: Admin = Depends(get_current_admin)):
    appointment = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if isinstance(appointment['created_at'], str):
        appointment['created_at'] = datetime.fromisoformat(appointment['created_at'])
    return Appointment(**appointment)

@api_router.put("/appointments/{appointment_id}", response_model=Appointment)
async def update_appointment(
    appointment_id: str,
    update_data: AppointmentUpdate,
    current_admin: Admin = Depends(get_current_admin)
):
    appointment = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        await db.appointments.update_one({"id": appointment_id}, {"$set": update_dict})
        appointment.update(update_dict)
    
    if isinstance(appointment['created_at'], str):
        appointment['created_at'] = datetime.fromisoformat(appointment['created_at'])
    return Appointment(**appointment)

@api_router.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str, current_admin: Admin = Depends(get_current_admin)):
    result = await db.appointments.delete_one({"id": appointment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment deleted successfully"}

# ==================== BLOG ENDPOINTS ====================

@api_router.get("/blog", response_model=List[BlogPost])
async def get_blog_posts():
    posts = await db.blog_posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for post in posts:
        if isinstance(post['created_at'], str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
        if isinstance(post['updated_at'], str):
            post['updated_at'] = datetime.fromisoformat(post['updated_at'])
    return posts

@api_router.get("/blog/{post_id}", response_model=BlogPost)
async def get_blog_post(post_id: str):
    post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    if isinstance(post['created_at'], str):
        post['created_at'] = datetime.fromisoformat(post['created_at'])
    if isinstance(post['updated_at'], str):
        post['updated_at'] = datetime.fromisoformat(post['updated_at'])
    return BlogPost(**post)

@api_router.post("/blog", response_model=BlogPost)
async def create_blog_post(
    post_create: BlogPostCreate,
    current_admin: Admin = Depends(get_current_admin)
):
    blog_post = BlogPost(**post_create.model_dump())
    doc = blog_post.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.blog_posts.insert_one(doc)
    return blog_post

@api_router.put("/blog/{post_id}", response_model=BlogPost)
async def update_blog_post(
    post_id: str,
    update_data: BlogPostUpdate,
    current_admin: Admin = Depends(get_current_admin)
):
    post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
        await db.blog_posts.update_one({"id": post_id}, {"$set": update_dict})
        post.update(update_dict)
    
    if isinstance(post['created_at'], str):
        post['created_at'] = datetime.fromisoformat(post['created_at'])
    if isinstance(post['updated_at'], str):
        post['updated_at'] = datetime.fromisoformat(post['updated_at'])
    return BlogPost(**post)

@api_router.delete("/blog/{post_id}")
async def delete_blog_post(post_id: str, current_admin: Admin = Depends(get_current_admin)):
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return {"message": "Blog post deleted successfully"}

# ==================== SERVICES ENDPOINTS ====================

class ServiceCreate(BaseModel):
    name: str
    description: str
    icon: str
    image_url: Optional[str] = ""

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None

@api_router.get("/services", response_model=List[Service])
async def get_services():
    services = await db.services.find({}, {"_id": 0}).to_list(1000)
    return services

@api_router.post("/services", response_model=Service)
async def create_service(service_create: ServiceCreate, current_admin: Admin = Depends(get_current_admin)):
    service = Service(**service_create.model_dump())
    doc = service.model_dump()
    await db.services.insert_one(doc)
    return service

@api_router.put("/services/{service_id}", response_model=Service)
async def update_service(
    service_id: str,
    update_data: ServiceUpdate,
    current_admin: Admin = Depends(get_current_admin)
):
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        await db.services.update_one({"id": service_id}, {"$set": update_dict})
        service.update(update_dict)
    
    return Service(**service)

@api_router.delete("/services/{service_id}")
async def delete_service(service_id: str, current_admin: Admin = Depends(get_current_admin)):
    result = await db.services.delete_one({"id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted successfully"}

@api_router.post("/upload/service-image")
async def upload_service_image(
    file: UploadFile = File(...),
    current_admin: Admin = Depends(get_current_admin)
):
    """Upload service image"""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only images allowed.")
    
    # Validate file size (max 5MB)
    file_size = 0
    chunk_size = 1024 * 1024  # 1MB
    temp_file = await file.read()
    file_size = len(temp_file)
    
    if file_size > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(status_code=400, detail="File too large. Max 5MB allowed.")
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = Path("/app/backend/uploads") / unique_filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(temp_file)
    
    # Return URL
    file_url = f"/uploads/{unique_filename}"
    logger.info(f"File uploaded: {file_url}")
    
    return {"url": file_url, "filename": unique_filename}

# ==================== FEATURES ENDPOINTS (Neden BD Garaj) ====================

@api_router.get("/features", response_model=List[Feature])
async def get_features():
    features = await db.features.find({}, {"_id": 0}).sort("order", 1).to_list(1000)
    return features

@api_router.post("/features", response_model=Feature)
async def create_feature(feature_create: FeatureCreate, current_admin: Admin = Depends(get_current_admin)):
    feature = Feature(**feature_create.model_dump())
    await db.features.insert_one(feature.model_dump())
    return feature

@api_router.put("/features/{feature_id}", response_model=Feature)
async def update_feature(
    feature_id: str,
    update_data: FeatureUpdate,
    current_admin: Admin = Depends(get_current_admin)
):
    feature = await db.features.find_one({"id": feature_id}, {"_id": 0})
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        await db.features.update_one({"id": feature_id}, {"$set": update_dict})
        feature.update(update_dict)
    
    return Feature(**feature)

@api_router.delete("/features/{feature_id}")
async def delete_feature(feature_id: str, current_admin: Admin = Depends(get_current_admin)):
    result = await db.features.delete_one({"id": feature_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Feature not found")
    return {"message": "Feature deleted successfully"}

# ==================== TESTIMONIALS ENDPOINTS (Müşteri Yorumları) ====================

@api_router.get("/testimonials", response_model=List[Testimonial])
async def get_testimonials():
    testimonials = await db.testimonials.find({}, {"_id": 0}).sort("order", 1).to_list(1000)
    return testimonials

@api_router.post("/testimonials", response_model=Testimonial)
async def create_testimonial(testimonial_create: TestimonialCreate, current_admin: Admin = Depends(get_current_admin)):
    testimonial = Testimonial(**testimonial_create.model_dump())
    await db.testimonials.insert_one(testimonial.model_dump())
    return testimonial

@api_router.put("/testimonials/{testimonial_id}", response_model=Testimonial)
async def update_testimonial(
    testimonial_id: str,
    update_data: TestimonialUpdate,
    current_admin: Admin = Depends(get_current_admin)
):
    testimonial = await db.testimonials.find_one({"id": testimonial_id}, {"_id": 0})
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        await db.testimonials.update_one({"id": testimonial_id}, {"$set": update_dict})
        testimonial.update(update_dict)
    
    return Testimonial(**testimonial)

@api_router.delete("/testimonials/{testimonial_id}")
async def delete_testimonial(testimonial_id: str, current_admin: Admin = Depends(get_current_admin)):
    result = await db.testimonials.delete_one({"id": testimonial_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"message": "Testimonial deleted successfully"}

# ==================== FAQ ENDPOINTS (SSS) ====================

@api_router.get("/faqs", response_model=List[FAQ])
async def get_faqs():
    faqs = await db.faqs.find({}, {"_id": 0}).sort("order", 1).to_list(1000)
    return faqs

@api_router.post("/faqs", response_model=FAQ)
async def create_faq(faq_create: FAQCreate, current_admin: Admin = Depends(get_current_admin)):
    faq = FAQ(**faq_create.model_dump())
    await db.faqs.insert_one(faq.model_dump())
    return faq

@api_router.put("/faqs/{faq_id}", response_model=FAQ)
async def update_faq(
    faq_id: str,
    update_data: FAQUpdate,
    current_admin: Admin = Depends(get_current_admin)
):
    faq = await db.faqs.find_one({"id": faq_id}, {"_id": 0})
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        await db.faqs.update_one({"id": faq_id}, {"$set": update_dict})
        faq.update(update_dict)
    
    return FAQ(**faq)

@api_router.delete("/faqs/{faq_id}")
async def delete_faq(faq_id: str, current_admin: Admin = Depends(get_current_admin)):
    result = await db.faqs.delete_one({"id": faq_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return {"message": "FAQ deleted successfully"}

# ==================== CONTACT INFO ENDPOINTS ====================

@api_router.get("/contact-info", response_model=ContactInfo)
async def get_contact_info():
    contact = await db.contact_info.find_one({"id": "contact_info"}, {"_id": 0})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact info not found")
    return ContactInfo(**contact)

@api_router.put("/contact-info", response_model=ContactInfo)
async def update_contact_info(
    update_data: ContactInfoUpdate,
    current_admin: Admin = Depends(get_current_admin)
):
    contact = await db.contact_info.find_one({"id": "contact_info"}, {"_id": 0})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact info not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        await db.contact_info.update_one({"id": "contact_info"}, {"$set": update_dict})
        contact.update(update_dict)
    
    return ContactInfo(**contact)

# ==================== CTA SECTION ENDPOINTS ====================

@api_router.get("/cta-section", response_model=CTASection)
async def get_cta_section():
    cta = await db.cta_section.find_one({"id": "cta_section"}, {"_id": 0})
    if not cta:
        raise HTTPException(status_code=404, detail="CTA section not found")
    return CTASection(**cta)

@api_router.put("/cta-section", response_model=CTASection)
async def update_cta_section(
    update_data: CTASectionUpdate,
    current_admin: Admin = Depends(get_current_admin)
):
    cta = await db.cta_section.find_one({"id": "cta_section"}, {"_id": 0})
    if not cta:
        raise HTTPException(status_code=404, detail="CTA section not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        await db.cta_section.update_one({"id": "cta_section"}, {"$set": update_dict})
        cta.update(update_dict)
    
    return CTASection(**cta)

# ==================== PRODUCTS ENDPOINTS (OTO-MOTO Alım Satım) ====================

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, status: Optional[str] = None):
    """Get all products, optionally filtered by category and status"""
    query = {}
    if category:
        query["category"] = category
    if status:
        query["status"] = status
    
    products = await db.products.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
        if isinstance(product.get('updated_at'), str):
            product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    if isinstance(product.get('updated_at'), str):
        product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(
    product_create: ProductCreate,
    current_admin: Admin = Depends(get_current_admin)
):
    product = Product(**product_create.model_dump())
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.products.insert_one(doc)
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    update_data: ProductUpdate,
    current_admin: Admin = Depends(get_current_admin)
):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
        await db.products.update_one({"id": product_id}, {"$set": update_dict})
        product.update(update_dict)
    
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    if isinstance(product.get('updated_at'), str):
        product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    return Product(**product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_admin: Admin = Depends(get_current_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

@api_router.post("/upload/product-image")
async def upload_product_image(
    file: UploadFile = File(...),
    current_admin: Admin = Depends(get_current_admin)
):
    """Upload product image"""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only images allowed.")
    
    # Validate file size (max 5MB)
    temp_file = await file.read()
    file_size = len(temp_file)
    
    if file_size > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(status_code=400, detail="File too large. Max 5MB allowed.")
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = Path("/app/backend/uploads") / unique_filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(temp_file)
    
    # Return URL
    file_url = f"/uploads/{unique_filename}"
    logger.info(f"Product image uploaded: {file_url}")
    
    return {"url": file_url, "filename": unique_filename}

# ==================== COMMENTS API ====================

@api_router.get("/comments", response_model=List[Comment])
async def get_comments(service_id: Optional[str] = None, status: Optional[str] = None):
    """Get comments (public - only approved, or admin - all)"""
    query = {}
    
    if service_id:
        query["service_id"] = service_id
    
    # If status filter is provided, use it; otherwise show only approved for public
    if status:
        query["status"] = status
    else:
        query["status"] = "approved"  # Public only sees approved comments
    
    comments = await db.comments.find(query, {"_id": 0}).sort("created_at", -1).to_list(length=None)
    return [Comment(**comment) for comment in comments]

@api_router.get("/comments/all", response_model=List[Comment])
async def get_all_comments(
    service_id: Optional[str] = None, 
    status: Optional[str] = None,
    current_admin: Admin = Depends(get_current_admin)
):
    """Get all comments (admin only - includes pending and rejected)"""
    query = {}
    
    if service_id:
        query["service_id"] = service_id
    
    if status:
        query["status"] = status
    
    comments = await db.comments.find(query, {"_id": 0}).sort("created_at", -1).to_list(length=None)
    return [Comment(**comment) for comment in comments]

@api_router.post("/comments", response_model=Comment)
async def create_comment(comment: CommentCreate):
    """Create a new comment (public - starts as pending)"""
    # Verify service exists
    service = await db.services.find_one({"id": comment.service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    new_comment = Comment(**comment.model_dump(), status="pending")
    await db.comments.insert_one(new_comment.model_dump())
    
    logger.info(f"New comment created for service {comment.service_id} by {comment.user_name}")
    return new_comment

@api_router.patch("/comments/{comment_id}", response_model=Comment)
async def update_comment_status(
    comment_id: str, 
    update: CommentUpdate,
    current_admin: Admin = Depends(get_current_admin)
):
    """Update comment status (admin only)"""
    if update.status not in ["approved", "rejected", "pending"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.comments.update_one(
        {"id": comment_id},
        {"$set": {"status": update.status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    updated_comment = await db.comments.find_one({"id": comment_id}, {"_id": 0})
    logger.info(f"Comment {comment_id} status updated to {update.status}")
    return Comment(**updated_comment)

@api_router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: str, current_admin: Admin = Depends(get_current_admin)):
    """Delete a comment (admin only)"""
    result = await db.comments.delete_one({"id": comment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment deleted successfully"}

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "BD Garaj API is running", "status": "ok"}

# Include router and middleware
app.include_router(api_router)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="/app/backend/uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
