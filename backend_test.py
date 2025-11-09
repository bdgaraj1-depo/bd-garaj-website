#!/usr/bin/env python3
"""
BD Garaj Backend API Comprehensive Test Suite
Tests all backend endpoints for BD Garaj motosiklet servisi
"""

import requests
import json
import sys
from datetime import datetime
import os

# Configuration
BASE_URL = "https://motocycle-portal.preview.emergentagent.com/api"
ADMIN_CREDENTIALS = {
    "username": "Burak5834",
    "password": "Burak58811434"
}

class BDGarajAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_result(self, test_name, success, message, response_data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        if response_data:
            result["response_data"] = response_data
        self.test_results.append(result)
        print(f"{status} {test_name}: {message}")
        
    def make_request(self, method, endpoint, data=None, files=None, auth_required=False):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if auth_required and self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
            
        if files:
            # Remove content-type for file uploads
            headers.pop("Content-Type", None)
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers)
            elif method.upper() == "POST":
                if files:
                    response = self.session.post(url, headers=headers, files=files)
                else:
                    response = self.session.post(url, headers=headers, json=data)
            elif method.upper() == "PUT":
                response = self.session.put(url, headers=headers, json=data)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
        except requests.exceptions.RequestException as e:
            return None
            
    def test_health_check(self):
        """Test basic API health"""
        response = self.make_request("GET", "/")
        if response and response.status_code == 200:
            data = response.json()
            if data.get("status") == "ok":
                self.log_result("Health Check", True, "API is running", data)
                return True
        self.log_result("Health Check", False, f"API health check failed - Status: {response.status_code if response else 'No response'}")
        return False
        
    def test_authentication(self):
        """Test admin authentication"""
        # Test login
        response = self.make_request("POST", "/auth/login", ADMIN_CREDENTIALS)
        if response and response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.auth_token = data["access_token"]
                self.log_result("Admin Login", True, "Successfully authenticated", {"token_type": data.get("token_type")})
                
                # Test token verification
                verify_response = self.make_request("GET", "/auth/verify", auth_required=True)
                if verify_response and verify_response.status_code == 200:
                    verify_data = verify_response.json()
                    if verify_data.get("valid") and verify_data.get("username") == ADMIN_CREDENTIALS["username"]:
                        self.log_result("Token Verification", True, "Token is valid", verify_data)
                        return True
                    else:
                        self.log_result("Token Verification", False, "Token verification failed", verify_data)
                else:
                    self.log_result("Token Verification", False, f"Token verification request failed - Status: {verify_response.status_code if verify_response else 'No response'}")
            else:
                self.log_result("Admin Login", False, "No access token in response", data)
        else:
            self.log_result("Admin Login", False, f"Login failed - Status: {response.status_code if response else 'No response'}")
        return False
        
    def test_services_api(self):
        """Test Services API - HIGH PRIORITY"""
        response = self.make_request("GET", "/services")
        if response and response.status_code == 200:
            services = response.json()
            
            # Check if we have services
            if isinstance(services, list):
                service_count = len(services)
                service_names = [s.get("name", "") for s in services]
                
                # Check for "Yedek Parça" service
                yedek_parca_exists = any("Yedek Parça" in name for name in service_names)
                
                # Expected services based on code
                expected_services = [
                    "AlienTech Yazılım",
                    "Bakım & Onarım", 
                    "Çanta Montaj Projelendirme",
                    "Sigorta Hasar Takip",
                    "OTO-MOTO Alım Satım"
                ]
                
                # Check if we have expected number of services (5 default + potentially Yedek Parça)
                if service_count >= 5:
                    self.log_result("Services Count", True, f"Found {service_count} services", {"services": service_names})
                else:
                    self.log_result("Services Count", False, f"Expected at least 5 services, found {service_count}", {"services": service_names})
                
                # Check for Yedek Parça service
                if yedek_parca_exists:
                    self.log_result("Yedek Parça Service", True, "Yedek Parça service found", {"services": service_names})
                else:
                    self.log_result("Yedek Parça Service", False, "Yedek Parça service not found", {"services": service_names})
                    
                return service_count >= 5 and yedek_parca_exists
            else:
                self.log_result("Services API", False, "Invalid response format", services)
        else:
            self.log_result("Services API", False, f"Services API failed - Status: {response.status_code if response else 'No response'}")
        return False
        
    def test_products_api(self):
        """Test Products API - HIGH PRIORITY"""
        success_count = 0
        total_tests = 0
        
        # Test 1: Get all products
        total_tests += 1
        response = self.make_request("GET", "/products")
        if response and response.status_code == 200:
            products = response.json()
            if isinstance(products, list):
                self.log_result("Get All Products", True, f"Retrieved {len(products)} products", {"count": len(products)})
                success_count += 1
            else:
                self.log_result("Get All Products", False, "Invalid response format", products)
        else:
            self.log_result("Get All Products", False, f"Failed - Status: {response.status_code if response else 'No response'}")
            
        # Test 2: Filter by category - spare_parts_new
        total_tests += 1
        response = self.make_request("GET", "/products?category=spare_parts_new")
        if response and response.status_code == 200:
            products = response.json()
            if isinstance(products, list):
                self.log_result("Filter Spare Parts New", True, f"Retrieved {len(products)} new spare parts", {"count": len(products)})
                success_count += 1
            else:
                self.log_result("Filter Spare Parts New", False, "Invalid response format", products)
        else:
            self.log_result("Filter Spare Parts New", False, f"Failed - Status: {response.status_code if response else 'No response'}")
            
        # Test 3: Filter by category - spare_parts_used
        total_tests += 1
        response = self.make_request("GET", "/products?category=spare_parts_used")
        if response and response.status_code == 200:
            products = response.json()
            if isinstance(products, list):
                self.log_result("Filter Spare Parts Used", True, f"Retrieved {len(products)} used spare parts", {"count": len(products)})
                success_count += 1
            else:
                self.log_result("Filter Spare Parts Used", False, "Invalid response format", products)
        else:
            self.log_result("Filter Spare Parts Used", False, f"Failed - Status: {response.status_code if response else 'No response'}")
            
        # Test 4: Filter by category - vehicle_sale
        total_tests += 1
        response = self.make_request("GET", "/products?category=vehicle_sale")
        if response and response.status_code == 200:
            products = response.json()
            if isinstance(products, list):
                self.log_result("Filter Vehicle Sale", True, f"Retrieved {len(products)} vehicles for sale", {"count": len(products)})
                success_count += 1
            else:
                self.log_result("Filter Vehicle Sale", False, "Invalid response format", products)
        else:
            self.log_result("Filter Vehicle Sale", False, f"Failed - Status: {response.status_code if response else 'No response'}")
            
        # Test 5: Filter by status - active
        total_tests += 1
        response = self.make_request("GET", "/products?status=active")
        if response and response.status_code == 200:
            products = response.json()
            if isinstance(products, list):
                self.log_result("Filter Active Products", True, f"Retrieved {len(products)} active products", {"count": len(products)})
                success_count += 1
            else:
                self.log_result("Filter Active Products", False, "Invalid response format", products)
        else:
            self.log_result("Filter Active Products", False, f"Failed - Status: {response.status_code if response else 'No response'}")
            
        # Test 6: Create new product (requires auth)
        if self.auth_token:
            total_tests += 1
            test_product = {
                "category": "spare_parts_new",
                "title": "Test Motosiklet Freni",
                "description": "Test amaçlı eklenen yeni fren sistemi",
                "price": 250.0,
                "currency": "TRY",
                "status": "active",
                "contact_phone": "0532 683 26 03",
                "contact_email": "bdgaraj1@gmail.com",
                "specs": {
                    "brand": "Brembo",
                    "model": "Test Model",
                    "year": "2024"
                }
            }
            
            response = self.make_request("POST", "/products", test_product, auth_required=True)
            if response and response.status_code == 200:
                created_product = response.json()
                if created_product.get("id") and created_product.get("title") == test_product["title"]:
                    self.log_result("Create Product", True, "Product created successfully", {"id": created_product.get("id")})
                    success_count += 1
                    
                    # Test 7: Update the created product
                    total_tests += 1
                    product_id = created_product["id"]
                    update_data = {
                        "price": 275.0,
                        "description": "Güncellenmiş test fren sistemi"
                    }
                    
                    update_response = self.make_request("PUT", f"/products/{product_id}", update_data, auth_required=True)
                    if update_response and update_response.status_code == 200:
                        updated_product = update_response.json()
                        if updated_product.get("price") == 275.0:
                            self.log_result("Update Product", True, "Product updated successfully", {"new_price": updated_product.get("price")})
                            success_count += 1
                        else:
                            self.log_result("Update Product", False, "Product update failed - price not updated", updated_product)
                    else:
                        self.log_result("Update Product", False, f"Update failed - Status: {update_response.status_code if update_response else 'No response'}")
                    
                    # Test 8: Delete the created product
                    total_tests += 1
                    delete_response = self.make_request("DELETE", f"/products/{product_id}", auth_required=True)
                    if delete_response and delete_response.status_code == 200:
                        delete_data = delete_response.json()
                        if "deleted successfully" in delete_data.get("message", "").lower():
                            self.log_result("Delete Product", True, "Product deleted successfully", delete_data)
                            success_count += 1
                        else:
                            self.log_result("Delete Product", False, "Unexpected delete response", delete_data)
                    else:
                        self.log_result("Delete Product", False, f"Delete failed - Status: {delete_response.status_code if delete_response else 'No response'}")
                else:
                    self.log_result("Create Product", False, "Product creation failed - invalid response", created_product)
            else:
                self.log_result("Create Product", False, f"Create failed - Status: {response.status_code if response else 'No response'}")
        else:
            self.log_result("Products CRUD Tests", False, "Skipped - No authentication token")
            
        return success_count >= (total_tests * 0.8)  # 80% success rate
        
    def test_other_apis(self):
        """Test other APIs for basic functionality"""
        apis_to_test = [
            ("/appointments", "Appointments API"),
            ("/blog", "Blog API"), 
            ("/features", "Features API"),
            ("/testimonials", "Testimonials API"),
            ("/contact-info", "Contact Info API"),
            ("/cta-section", "CTA Section API"),
            ("/faqs", "FAQs API")
        ]
        
        success_count = 0
        for endpoint, name in apis_to_test:
            auth_required = endpoint == "/appointments"  # Only appointments require auth
            response = self.make_request("GET", endpoint, auth_required=auth_required)
            
            if response and response.status_code == 200:
                data = response.json()
                if isinstance(data, (list, dict)):
                    count = len(data) if isinstance(data, list) else 1
                    self.log_result(name, True, f"Retrieved data successfully", {"count": count})
                    success_count += 1
                else:
                    self.log_result(name, False, "Invalid response format", data)
            else:
                self.log_result(name, False, f"Failed - Status: {response.status_code if response else 'No response'}")
                
        return success_count >= len(apis_to_test) * 0.7  # 70% success rate
        
    def test_image_upload(self):
        """Test image upload functionality"""
        if not self.auth_token:
            self.log_result("Image Upload", False, "Skipped - No authentication token")
            return False
            
        # Create a small test image file in memory
        test_image_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
        
        files = {
            'file': ('test_image.png', test_image_content, 'image/png')
        }
        
        # Test product image upload
        response = self.make_request("POST", "/upload/product-image", files=files, auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            if "url" in data and "filename" in data:
                self.log_result("Product Image Upload", True, "Image uploaded successfully", {"url": data.get("url")})
                return True
            else:
                self.log_result("Product Image Upload", False, "Invalid upload response", data)
        else:
            self.log_result("Product Image Upload", False, f"Upload failed - Status: {response.status_code if response else 'No response'}")
        return False
        
    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting BD Garaj Backend API Test Suite")
        print(f"🎯 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            ("Health Check", self.test_health_check),
            ("Authentication", self.test_authentication),
            ("Services API", self.test_services_api),
            ("Products API", self.test_products_api),
            ("Other APIs", self.test_other_apis),
            ("Image Upload", self.test_image_upload)
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n📋 Running {test_name}...")
            try:
                if test_func():
                    passed_tests += 1
            except Exception as e:
                self.log_result(test_name, False, f"Test failed with exception: {str(e)}")
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        success_rate = (passed_tests / total_tests) * 100
        print(f"Overall Success Rate: {success_rate:.1f}% ({passed_tests}/{total_tests})")
        
        # Detailed results
        print("\n📋 Detailed Results:")
        for result in self.test_results:
            print(f"{result['status']} {result['test']}: {result['message']}")
            
        return success_rate >= 80  # 80% overall success rate

if __name__ == "__main__":
    tester = BDGarajAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 Backend API tests completed successfully!")
        sys.exit(0)
    else:
        print("\n⚠️  Some backend API tests failed. Check results above.")
        sys.exit(1)