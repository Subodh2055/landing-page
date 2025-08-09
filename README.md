# ProductHub - Angular E-commerce Application

A modern e-commerce application built with Angular 17, featuring a Flipkart-inspired design with persistent data storage using JSON Server.

## 🌟 Features

### 🛍️ **Product Management**
- **CRUD Operations** - Create, Read, Update, Delete products
- **Persistent Storage** - Data stored in JSON Server database
- **Image Upload** - Product images with preview
- **Category Management** - Organized product categories
- **Stock Management** - Real-time stock tracking

### 👤 **User Authentication**
- **JWT Authentication** - Secure login/logout system
- **Role-Based Access** - Admin, User, and Public roles
- **User Registration** - Complete registration with validation
- **Profile Management** - User profile updates

### 🎨 **Modern UI/UX**
- **Flipkart-Inspired Design** - Professional e-commerce interface
- **Responsive Design** - Works on all devices
- **Glassmorphism Effects** - Modern visual design
- **Enhanced Toastr Messages** - User-friendly notifications

### 🔍 **Advanced Features**
- **Search & Filter** - Advanced product filtering
- **Pagination** - Efficient data loading
- **Export/Import** - JSON data export/import
- **Mobile Optimization** - Touch-friendly interface

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Angular CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Subodh2055/landing-page.git
   cd landing-page
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start JSON Server (Database)**
   ```bash
   npm run json-server
   ```
   This will start the JSON server on `http://localhost:3000`

4. **Start Angular Development Server**
   ```bash
   npm start
   ```
   This will start the Angular app on `http://localhost:4200`

5. **Run Both Servers Simultaneously**
   ```bash
   npm run dev
   ```
   This runs both Angular and JSON Server together

## 📊 Database Structure

### JSON Server Endpoints

The application uses JSON Server for persistent data storage. The database file (`db.json`) contains:

#### **Users** (`/users`)
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "mobileNumber": "+1234567890",
  "role": "admin",
  "password": "admin123",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### **Products** (`/products`)
```json
{
  "id": 1,
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone with advanced camera system",
  "price": 999.99,
  "category": "Electronics",
  "image": "https://images.unsplash.com/...",
  "stock": 50,
  "rating": 4.8,
  "reviews": 1250,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### **Categories** (`/categories`)
```json
{
  "id": 1,
  "name": "Electronics",
  "description": "Electronic devices and gadgets",
  "image": "https://images.unsplash.com/..."
}
```

## 🔧 Available Scripts

### **Development**
```bash
npm start              # Start Angular dev server
npm run json-server    # Start JSON Server only
npm run dev           # Start both servers
```

### **Production**
```bash
npm run build         # Build for production
npm run deploy        # Deploy to GitHub Pages
```

### **Database Management**
```bash
npm run server        # Start JSON Server with host access
```

## 🌐 API Endpoints

### **Authentication**
- `GET /users` - Get all users
- `POST /users` - Register new user
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### **Products**
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Add new product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /products?category=Electronics` - Filter by category
- `GET /products?q=iPhone` - Search products

### **Categories**
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get category by ID

## 👥 User Roles

### **Public User**
- View public products
- Search and filter products
- Register new account

### **Authenticated User**
- All public features
- View user-specific products
- Update profile
- Add to cart (future feature)

### **Admin User**
- All user features
- CRUD operations on products
- User management
- Export/Import data
- System administration

## 🔐 Default Credentials

### **Admin Account**
- **Email:** admin@example.com
- **Password:** admin123
- **Role:** admin

### **User Account**
- **Email:** user@example.com
- **Password:** user123
- **Role:** user

## 📱 Responsive Design

The application is fully responsive and optimized for:

- **Desktop** - Full-featured interface
- **Tablet** - Adaptive layout
- **Mobile** - Touch-optimized interface

## 🎨 Design Features

### **Navbar**
- Full-width design
- ProductHub branding on left
- User actions on right
- Responsive mobile menu

### **Product Cards**
- Modern card design
- Rating stars
- Stock status
- Price formatting
- Image optimization

### **Forms**
- Glassmorphism effects
- Real-time validation
- Enhanced error messages
- Loading states

## 🚀 Deployment

### **Local Development**
1. Start JSON Server: `npm run json-server`
2. Start Angular: `npm start`
3. Access: `http://localhost:4200`

### **Production Deployment**
1. Build: `npm run build`
2. Deploy: `npm run deploy`
3. Access: `https://subodh2055.github.io/landing-page/`

## 📊 Data Persistence

### **JSON Server Benefits**
- **Persistent Storage** - Data survives server restarts
- **Real-time Updates** - Changes reflect immediately
- **RESTful API** - Standard HTTP methods
- **Easy Backup** - Simple JSON file backup
- **Development Friendly** - No database setup required

### **Data Backup**
The `db.json` file contains all your data. To backup:
1. Copy `db.json` to a safe location
2. Restore by replacing the file and restarting JSON Server

## 🔧 Configuration

### **Environment Setup**
- **Angular Port:** 4200
- **JSON Server Port:** 3000
- **API Base URL:** http://localhost:3000

### **Customization**
- Modify `db.json` for initial data
- Update `src/app/services/*.service.ts` for API endpoints
- Customize styles in `src/app/components/*/*.scss`

## 🐛 Troubleshooting

### **Common Issues**

1. **JSON Server not starting**
   ```bash
   npm install json-server --save-dev
   npm run json-server
   ```

2. **CORS Issues**
   - JSON Server runs on port 3000
   - Angular runs on port 4200
   - CORS is handled automatically

3. **Data not persisting**
   - Check if `db.json` is writable
   - Restart JSON Server after file changes

4. **Build Errors**
   ```bash
   npm install
   npm run build
   ```

## 📈 Future Enhancements

- [ ] Shopping cart functionality
- [ ] Payment integration
- [ ] Order management
- [ ] User reviews and ratings
- [ ] Advanced search filters
- [ ] Wishlist feature
- [ ] Email notifications
- [ ] Admin dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Subodh** - [GitHub](https://github.com/Subodh2055)

---

**Happy Coding! 🚀✨**
