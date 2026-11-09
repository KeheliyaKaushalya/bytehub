# ByteHub E-Commerce Website

A complete e-commerce web application for computer hardware and accessories.

## Project Overview

ByteHub is a fully functional e-commerce website built with HTML, CSS, JavaScript, and Supabase (PostgreSQL database). It includes all required functionalities for an e-commerce platform.

## Features

### Frontend (Customer Features)
- Home Page with featured products and categories
- Products listing page with search and filter
- Product detail page with add to cart functionality
- Shopping cart with quantity management
- User registration with validation
- User login/logout functionality
- User dashboard (profile management)
- Order history with tracking
- Contact Us form
- About Us page
- FAQ page
- Privacy Policy page
- Terms & Conditions page

### Backend (Admin Features)
- Admin dashboard with statistics
- Product management (Add, Edit, Delete)
- User management (View users, Toggle admin status)
- Order management (View, Update status, Track)
- FAQ management (Add, Edit, Delete)
- Contact form submissions viewer

## Technology Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Icons:** Font Awesome 4.7
- **Slider:** Swiper.js
- **Fonts:** Google Fonts (Poppins)

## Setup Instructions for Viva Exam

### Prerequisites
1. A web browser (Chrome, Firefox, Edge, etc.)
2. Internet connection (for loading CDN resources and Supabase)

### Running the Project

#### Option 1: Direct File Opening
1. Download and extract the project folder
2. Open `index.html` in any modern web browser
3. The website will load with sample data from the database

#### Option 2: Using a Local Server (Recommended)
1. Install a local server like:
   - **WAMP Server** (Windows)
   - **XAMPP** (Cross-platform)
   - **Live Server** extension in VS Code

2. Place the project folder in:
   - WAMP: `C:\wamp\www\bytehub`
   - XAMPP: `C:\xampp\htdocs\bytehub`

3. Start WAMP/XAMPP services
4. Open browser and go to: `http://localhost/bytehub/index.html`

### Demo Accounts

#### Customer Account
1. Go to the Registration page
2. Create a new account with:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
3. After registration, login with these credentials

#### Admin Account
To access admin features:

1. First, register a regular account through the website
2. Then run this SQL command in Supabase SQL Editor to make yourself an admin:

```sql
UPDATE user_profiles
SET is_admin = true
WHERE id IN (
    SELECT id FROM auth.users
    WHERE email = 'your-email@example.com'
);
```

3. Login with that account
4. Navigate to: `http://localhost/bytehub/admin.html`

## Database Schema

The database includes the following tables:

| Table | Description |
|-------|-------------|
| categories | Product categories |
| products | All products with details |
| user_profiles | Extended user information |
| cart_items | Shopping cart items |
| orders | Customer orders |
| order_items | Items in each order |
| faqs | FAQ entries |
| contacts | Contact form submissions |

## File Structure

```
bytehub/
├── index.html              # Home page
├── products.html           # Products listing
├── product-detail.html     # Product detail page
├── cart.html              # Shopping cart
├── register.html          # User registration
├── dashboard.html         # User profile/dashboard
├── orders.html            # Order history
├── about.html             # About Us page
├── contact.html           # Contact Us page
├── faq.html               # FAQ page
├── privacy.html           # Privacy Policy
├── terms.html             # Terms & Conditions
├── admin.html             # Admin dashboard
├── admin-products.html    # Product management
├── admin-users.html       # User management
├── admin-orders.html      # Order management
├── admin-faqs.html        # FAQ management
├── css/
│   └── style.css          # All styles
├── js/
│   └── script.js          # All JavaScript
└── README.md              # This file
```

## Form Validations

All forms include client-side validation:

- **Registration Form:**
  - Name: Minimum 2 characters
  - Email: Valid email format
  - Password: Minimum 6 characters
  - Confirm Password: Must match password

- **Contact Form:**
  - Name: Minimum 2 characters
  - Email: Valid email format
  - Message: Minimum 10 characters

- **Login Form:**
  - Email: Valid email format
  - Password: Minimum 6 characters

## Testing the Website

### Customer Flow
1. Open `index.html`
2. Browse products on the home page
3. Click "View Details" to see product page
4. Click "Add to Cart"
5. Click cart icon to view cart
6. Click "View Cart" for full cart page
7. Register an account
8. Login
9. Checkout from cart
10. View orders in "My Orders"

### Admin Flow
1. Make your account an admin (see Admin Account section)
2. Login with admin account
3. Go to `admin.html`
4. Add/Edit/Delete products
5. View and manage users
6. Process orders
7. Manage FAQs

## Sample Data

The database is pre-populated with:
- 4 Product categories
- 8 Featured products
- 5 FAQ entries

## Troubleshooting

1. **Products not loading:**
   - Check internet connection
   - Open browser console (F12) for errors

2. **Login not working:**
   - Clear browser cache
   - Check if cookies are enabled

3. **Admin panel not accessible:**
   - Ensure your account has `is_admin = true`
   - Re-login after setting admin status

## Notes for Viva Exam

1. The project demonstrates:
   - Complete CRUD operations for products, users, orders, FAQs
   - User authentication with Supabase
   - Row Level Security (RLS) for data protection
   - Form validation on both frontend and backend
   - Responsive design for all screen sizes
   - Admin panel for website management

2. Database connection is already configured in the code. No additional setup required.

3. The Supabase project is hosted online - data persists between sessions.

4. All functionality works in real-time with the database.

## Developer Credits

Developed as part of the Web Application Development project.
Supabase backend is pre-configured and ready for demonstration.

---

For any issues during the viva exam, please check the browser console (F12 -> Console tab) for error messages.
