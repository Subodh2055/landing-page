# 🌟 World-Class Angular Landing Page

A modern, responsive Angular application featuring JWT authentication, role-based access control, and comprehensive product management with a stunning UI.

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** with secure token management
- **Role-based Access Control** (Public, User, Admin)
- **Protected Routes** with route guards
- **Mock Backend Service** for development

### 🎨 Modern UI/UX
- **Bootstrap 5** for responsive design
- **Glass Morphism** effects throughout the application
- **3D Hover Effects** on product cards with perspective transforms
- **Custom SCSS** with advanced animations and transitions
- **Nepal Cultural Background** with Mount Everest imagery

### 📱 Responsive Design
- **Mobile-first** approach
- **2-column product grid** on mobile devices
- **Adaptive layouts** for all screen sizes
- **Touch-friendly** interactions

### 🛍️ Product Management
- **CRUD Operations** (Create, Read, Update, Delete)
- **Image Upload** with base64 encoding
- **Advanced Filtering** with sidebar controls
- **Pagination** (50 products per page)
- **Search & Sort** functionality
- **Category Management**
- **Price Range Filtering**
- **Stock Status Filtering**

### 🎛️ Advanced Features
- **Minimizable Sidebar** with toggle functionality
- **Toast Notifications** for user feedback
- **Form Validation** with custom error messages
- **Date Picker** for product creation
- **localStorage Persistence** for data
- **JSON Export/Import** functionality

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Angular CLI

### Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# Install dependencies
npm install

# Start development server
npm start
```

### Default Credentials
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: Admin

## 🏗️ Project Structure

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
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── product.controller.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── role.guard.ts
│   ├── models/
│   │   ├── product.model.ts
│   │   └── user.model.ts
│   └── services/
│       ├── auth.service.ts
│       ├── mock-backend.service.ts
│       └── product.service.ts
├── assets/
│   └── images/
└── styles.scss
```

## 🎯 Key Components

### Authentication Components
- **Login Component**: Beautiful glass morphism design with gradient backgrounds
- **Register Component**: Matching design with enhanced form validation

### Product Management
- **Product List**: Responsive grid with 3D hover effects
- **Product Form**: Advanced form with image upload and validation
- **Product Card**: Individual product display with animations

### Navigation
- **Navbar**: Fixed navigation with glass morphism effects
- **Sidebar**: Minimizable filter panel with category and price controls

## 🎨 UI/UX Highlights

### Glass Morphism Design
- Translucent backgrounds with blur effects
- Gradient overlays and shadows
- Smooth transitions and animations

### 3D Hover Effects
- Product cards lift and rotate on hover
- Individual element animations
- Enhanced shadows and scaling

### Responsive Layout
- Mobile: 2-column product grid
- Tablet: 3-column layout
- Desktop: 4-column layout

## 🔧 Development

### Available Scripts
```bash
# Development server
npm start

# Production build
npm run build

# Run tests
npm test

# Deploy to GitHub Pages
npm run deploy
```

### Build Configuration
- **Production Build**: Optimized for deployment
- **Budget Limits**: Increased for complex SCSS files
- **Asset Optimization**: Compressed images and styles

## 🌐 Deployment

### GitHub Pages
1. Create a GitHub repository
2. Update the deploy script in `package.json`:
   ```json
   "deploy": "ng deploy --base-href=https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/"
   ```
3. Run deployment:
   ```bash
   npm run deploy
   ```

### Manual Deployment
1. Build the project:
   ```bash
   ng build --configuration production
   ```
2. Upload the `dist/landing-page` folder to your web server

## 🛠️ Technologies Used

- **Angular 17**: Core framework
- **Bootstrap 5**: CSS framework
- **SCSS**: Advanced styling
- **TypeScript**: Type-safe development
- **RxJS**: Reactive programming
- **ngx-toastr**: Toast notifications
- **JWT**: Authentication tokens

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Nepal cultural background imagery
- Bootstrap team for the excellent CSS framework
- Angular team for the amazing framework
- All contributors and supporters

---

**Made with ❤️ and ☕ by [Your Name]**
