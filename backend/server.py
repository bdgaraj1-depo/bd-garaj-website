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
    # Create default admin if not exists
    admin_exists = await db.admins.find_one({"username": "admin"})
    if not admin_exists:
        default_admin = Admin(
            username="admin",
            password_hash=hash_password("admin123")
        )
        doc = default_admin.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.admins.insert_one(doc)
        logger.info("Default admin created: username=admin, password=admin123")

    # Create default services
    services_count = await db.services.count_documents({})
    if services_count == 0:
        default_services = [
            Service(name="AlienTech Yazılım", description="Motor performans optimizasyonu ve ECU yazılımı", icon="💻"),
            Service(name="Bakım & Onarım", description="Periyodik bakım ve genel onarım hizmetleri", icon="🔧"),
            Service(name="Çanta Montajı", description="TSE onaylı çanta sistemleri projelendirme ve montaj", icon="🧳"),
            Service(name="Sigorta Takibi", description="Kaza ve hasar durumlarında sigorta işlemleri takibi", icon="📋"),
        ]
        for service in default_services:
            doc = service.model_dump()
            await db.services.insert_one(doc)
        logger.info(f"{len(default_services)} default services created")

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

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None

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

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "BD Garaj API is running", "status": "ok"}

# Include router and middleware
app.include_router(api_router)

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
