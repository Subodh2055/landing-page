# World Class Angular Landing Page

A beautiful, modern Angular application with JWT authentication, role-based access control, and a complete CRUD system for product management.

## 🌟 Features

### Authentication & Authorization
- **JWT-based Authentication**: Secure login/register system with token management
- **Role-based Access Control**: Three user roles (public, user, admin)
- **Route Guards**: Protected routes based on authentication and roles
- **Mock Backend**: Simulated authentication service for development

### Product Management
- **Beautiful Product Cards**: Modern card design with hover effects
- **Role-based Product Access**: 
  - Public users see public products only
  - Logged-in users see public + user products
  - Admin users see all products
- **CRUD Operations**: Create, Read, Update, Delete products
- **JSON Storage**: Products stored in localStorage with export/import functionality

### UI/UX Design
- **Bootstrap 5**: Modern responsive design
- **Custom SCSS**: Beautiful gradients and animations
- **Font Awesome Icons**: Professional iconography
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Hover effects and transitions

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Open Browser**
   Navigate to `http://localhost:4200`

## 👥 User Accounts

### Demo Accounts
- **Admin User**:
  - Username: `admin`
  - Password: `admin123`
  - Role: Admin (full access)

- **Regular User**:
  - Username: `user`
  - Password: `user123`
  - Role: User (limited access)

### Registration
- New users can register and will be assigned the "user" role by default
- Only admin users can access the product management panel

## 🛠️ Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── navbar/
│   │   ├── product-card/
│   │   ├── product-form/
│   │   └── product-list/
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── role.guard.ts
│   ├── interceptors/
│   │   └── auth.interceptor.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   └── mock-backend.service.ts
│   └── app.module.ts
├── styles.scss
└── index.html
```

## 🎨 Design Features

### Color Scheme
- **Primary**: Purple gradient (#667eea to #764ba2)
- **Secondary**: Pink gradient for product images
- **Background**: Gradient background with glass morphism effects

### Components
- **Navbar**: Fixed navigation with user dropdown
- **Product Cards**: Hover animations and modern design
- **Auth Forms**: Clean, centered forms with validation
- **Admin Panel**: Comprehensive product management interface

## 📱 Responsive Design

- **Mobile**: Optimized for small screens
- **Tablet**: Adaptive layout for medium screens
- **Desktop**: Full-featured experience

## 🔧 Technical Stack

- **Angular 17**: Latest Angular framework
- **Bootstrap 5**: CSS framework
- **SCSS**: Advanced styling
- **RxJS**: Reactive programming
- **TypeScript**: Type-safe development

## 🚀 Build & Deploy

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

### Testing
```bash
npm test
```

## 📊 Features Overview

| Feature | Public | User | Admin |
|---------|--------|------|-------|
| View Public Products | ✅ | ✅ | ✅ |
| View User Products | ❌ | ✅ | ✅ |
| View Admin Products | ❌ | ❌ | ✅ |
| Add Products | ❌ | ❌ | ✅ |
| Edit Products | ❌ | ❌ | ✅ |
| Delete Products | ❌ | ❌ | ✅ |
| Export/Import Data | ❌ | ❌ | ✅ |

## 🎯 Key Features

1. **Authentication System**
   - JWT token management
   - Role-based access control
   - Secure route protection

2. **Product Management**
   - Beautiful card-based display
   - Role-based product filtering
   - Complete CRUD operations

3. **Data Persistence**
   - localStorage for data storage
   - JSON export/import functionality
   - Sample data included

4. **Modern UI/UX**
   - Gradient backgrounds
   - Smooth animations
   - Responsive design
   - Professional styling

## 🔐 Security Features

- JWT token authentication
- Route guards for protected routes
- Role-based access control
- Secure token storage in localStorage

## 📈 Performance

- Lazy loading ready
- Optimized bundle size
- Efficient change detection
- Responsive image handling

## 🛠️ Customization

### Adding New Products
1. Login as admin
2. Navigate to Admin Panel
3. Fill out the product form
4. Save the product

### Modifying Styles
- Edit `src/styles.scss` for global styles
- Component-specific styles in each component
- Bootstrap classes for layout

### Adding New Roles
1. Update the role guard
2. Modify product service filtering
3. Update UI components

## 🐛 Troubleshooting

### Common Issues

1. **Module not found errors**
   - Run `npm install` to install dependencies

2. **Authentication not working**
   - Check browser console for errors
   - Verify mock backend service is running

3. **Products not loading**
   - Clear localStorage and refresh
   - Check product service initialization

## 📝 License

This project is created for educational and demonstration purposes.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Enjoy building with this world-class Angular application! 🚀**
