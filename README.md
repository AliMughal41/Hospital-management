# MediSyncX - Hospital Management System

🏥 A modern, comprehensive hospital management system built with React.js frontend and Node.js backend.

## ✨ Clean Project Structure

This project has been professionally organized with:
- ✅ Separate frontend and backend folders
- ✅ No duplicate or unnecessary files  
- ✅ Proper gitignore configuration
- ✅ Environment variable templates
- ✅ Standard Node.js/React structure

## 🚀 Features

### 🔐 Authentication & Authorization
- Firebase Authentication integration
- Role-based access control (Admin, Doctor, Technician, Receptionist)
- Secure Firebase ID token-based API authentication
- Password reset functionality

### 👥 User Management
- Different user roles with customized dashboards
- User profile management
- Staff management system

### 🏥 Core Hospital Functions
- **Patient Management**: Complete patient records and information system
- **Appointment Scheduling**: Advanced appointment booking and management
- **Lab Tests**: Laboratory test management and results tracking
- **Blood Bank**: Blood inventory and donation management
- **Staff Management**: Employee records and shift management
- **Financial Management**: Accounting and salary management
- **Settings**: System configuration and hospital information

### 📊 Dashboard Features
- Real-time statistics and analytics
- Role-specific dashboard views
- Interactive charts and data visualization
- Quick action buttons and navigation

## 🛠 Technology Stack

### Frontend (`/frontend`)
- **React.js** - Modern JavaScript library for building user interfaces
- **React Router** - Client-side routing
- **Firebase SDK** - Authentication and real-time database
- **CSS3** - Custom styling with modern design

### Backend (`/backend`)
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Firebase Admin SDK** - Server-side Firebase integration
- **Firebase ID Tokens** - Secure authentication

### Database
- **Firebase Realtime Database** - NoSQL real-time database
- **Firebase Authentication** - User authentication service
- **Firebase Storage** - File storage service

## 🚀 Quick Start

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm or yarn package manager
- Firebase project with Authentication and Realtime Database enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prject_med
   ```

2. **Configure Firebase**
   - Update `frontend/src/firebase/config.js` with your Firebase config
   - Add `serviceAccountKey.json` to `backend/config/`

3. **Create test user in Firebase Console**
   - Email: `admin@hospital.com`
   - Password: `password123`

4. **Install dependencies and start**
   ```bash
   # Backend
   cd backend
   npm install
   npm run dev
   
   # Frontend (new terminal)
   cd frontend
   npm install
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - Login with test credentials

## 📁 Project Structure

```
📁 prject med/
├── 📁 backend/                    # Node.js Express server
│   ├── 📁 config/                 # Configuration files
│   ├── 📁 controllers/            # Business logic controllers
│   ├── 📁 middleware/             # Express middleware
│   ├── 📁 routes/                 # API route definitions
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Backend dependencies
│   └── server.js                 # Express application entry point
│
├── 📁 frontend/                   # React.js application
│   ├── 📁 public/                # Static assets
│   ├── 📁 src/                   # React source code
│   │   ├── 📁 components/        # React components
│   │   ├── 📁 context/           # React context providers
│   │   ├── 📁 firebase/          # Firebase client configuration
│   │   ├── 📁 utils/             # Utility functions
│   │   ├── App.js                # Main App component
│   │   └── index.js              # React entry point
│   └── package.json              # Frontend dependencies
│
├── .gitignore                    # Git ignore rules
├── README.md                     # Project documentation
└── SETUP_GUIDE.md               # Detailed setup instructions
```

## 🎯 User Roles & Dashboards

- **Admin**: Full dashboard with all modules and user management
- **Doctor**: Appointments management and prescription handling
- **Technician**: Lab tests and equipment management
- **Receptionist**: Patient registration, appointments, basic records

## 🔧 Development

### Available Scripts

**Backend:**
```bash
cd backend
npm run dev          # Development with nodemon
npm start            # Production server
```

**Frontend:**
```bash
cd frontend
npm start            # Development server
npm run build        # Production build
npm test             # Run tests
```

### Environment Configuration

Create `.env` file in backend directory:
```env
PORT=5000
NODE_ENV=development
FIREBASE_DATABASE_URL=https://your-project-rtdb.firebaseio.com
JWT_SECRET=your-jwt-secret
```

## 🚦 Getting Started

1. **Follow SETUP_GUIDE.md** for detailed setup instructions
2. **Configure Firebase** with your project credentials
3. **Create test users** through Firebase Console
4. **Start development servers** for both frontend and backend
5. **Access the application** at http://localhost:3000

## 🐛 Troubleshooting

### Common Issues:
- **Dashboard not showing**: Check Firebase authentication and user creation
- **API errors**: Verify backend is running on port 5000
- **Build failures**: Clear node_modules and reinstall dependencies

### Debug Steps:
1. Check browser console for JavaScript errors
2. Verify both servers are running (3000 & 5000)
3. Confirm Firebase configuration is correct
4. Ensure test user exists in Firebase Console

## 📖 Documentation

- **SETUP_GUIDE.md**: Comprehensive setup instructions
- **Firebase Console**: Check authentication and database status
- **Component Documentation**: In-code comments and JSDoc

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Project Status

✅ **Authentication System**: Working
✅ **Role-based Dashboards**: Working  
✅ **Firebase Integration**: Working
✅ **Clean Project Structure**: Complete
✅ **Documentation**: Complete

---

**MediSyncX** - Professional Hospital Management Made Simple 🏥