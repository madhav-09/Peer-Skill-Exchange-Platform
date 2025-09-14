# 🎯 Skill Swap Platform - AamMunde Team

A modern web application where users can exchange skills and knowledge with each other.

This peer-to-peer skill exchange platform was built and showcased at the BuilderZone booth during AWS Community Day Vadodara 2025, as part of the Amazon Q initiative.
## 🌟 Features

### ✅ Complete User System
- **User Registration & Login** - Secure JWT authentication
- **Profile Management** - Photo upload, location, availability
- **Public/Private Profiles** - Privacy controls

### ✅ Skills Management
- **Skills I Can Teach** - List your expertise
- **Skills I Want to Learn** - Set learning goals
- **Skill Categories** - Organized skill system

### ✅ Advanced Search & Browse
- **Search by Name** - Find specific users
- **Search by Skills** - Find skill matches
- **Search by Location** - Local connections
- **Combined Filters** - Multi-criteria search

### ✅ Swap Request System
- **Send Requests** - Propose skill exchanges
- **Accept/Reject** - Manage incoming requests
- **Request Tracking** - Monitor all exchanges
- **Delete Requests** - Cancel pending requests

### ✅ In-App Messaging System
- **Real-time Chat** - Message connected users instantly
- **Connections Page** - Dedicated space for all accepted swaps
- **Message History** - Persistent conversation storage
- **Visual Interface** - Modern chat bubbles and timestamps

### ✅ Rating & Feedback
- **Post-Swap Reviews** - Rate experiences
- **User Ratings** - Build reputation
- **Feedback Comments** - Detailed reviews

### ✅ Admin Dashboard
- **User Management** - Monitor and manage users
- **Platform Oversight** - Comprehensive admin controls
- **Role-based Access** - Secure admin-only features

### ✅ Modern UI/UX
- **Glassmorphism Design** - Modern visual effects
- **Dark/Light Themes** - User preference
- **Responsive Design** - Mobile-friendly
- **Real-time Notifications** - Instant feedback
- **Smooth Animations** - Professional interactions

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication
- **Multer** - File uploads

### Database
- **PostgreSQL** - Relational database
- **Optimized Schema** - Efficient queries
- **Indexed Tables** - Fast performance

## 🚀 Quick Start

### Prerequisites
- **Node.js 16+** - [Download](https://nodejs.org/)
- **PostgreSQL 12+** - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/downloads)

### 1. Clone Repository
```bash
git clone https://github.com/madhav-09/SKILLSWAP.git
cd SKILLSWAP
```

### 2. Database Setup
```bash
# Start PostgreSQL service
# Windows: net start postgresql-x64-15
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Create database
psql -U postgres -c "CREATE DATABASE skillswap;"

# Run schema
psql -U postgres -d skillswap -f database/schema.sql

# Verify tables created
psql -U postgres -d skillswap -c "\dt"
```

### 3. Backend Setup
```bash
cd backend
npm install

# Create .env file
echo "PORT=5001
JWT_SECRET=your_jwt_secret_here_change_in_production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skillswap
DB_USER=postgres
DB_PASSWORD=your_postgres_password" > .env

# Start backend server
npm run dev
```

### 4. Frontend Setup
```bash
# Open new terminal
cd frontend
npm install

# Start React app
npm start
```

### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api/health

## 🧪 Test the Application

1. **Register**: Create account at http://localhost:3000
2. **Profile**: Set up your profile with skills
3. **Browse**: Search for other users
4. **Connect**: Send skill swap requests
5. **Chat**: Message with connected users
6. **Rate**: Leave reviews after skill exchanges

## 📊 Project Architecture

```
SkillSwap/
├── backend/                 # Node.js + Express API
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication
│   ├── config/            # Database connection
│   └── app.js             # Main server file
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Main application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── services/      # API integration
│   └── public/            # Static assets
├── database/              # PostgreSQL schema
└── README.md             # This file
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5001
JWT_SECRET=your_jwt_secret_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skillswap
DB_USER=postgres
DB_PASSWORD=your_password
```

### Frontend (.env) - Optional
```env
REACT_APP_API_URL=http://localhost:5001/api
```

## 🎨 Design & UI/UX

### Modern Glassmorphism Design
- **Frosted Glass Effects** - Beautiful translucent cards
- **Gradient Backgrounds** - Eye-catching color schemes
- **Smooth Animations** - Professional micro-interactions
- **Dark/Light Themes** - User preference support
- **Mobile-First Design** - Responsive across all devices

### User Experience Features
- **Intuitive Navigation** - Easy-to-use interface
- **Real-time Notifications** - Instant feedback
- **Loading States** - Clear progress indicators
- **Error Handling** - User-friendly error messages
- **Accessibility** - WCAG compliant design

## 🏆 Project Highlights

### Innovation
- **Skill Exchange Economy** - Unique peer-to-peer learning
- **Smart Matching** - Advanced search algorithms
- **Community Building** - Social networking for skills

### Technical Excellence
- **Modern Architecture** - Clean, scalable code
- **Security First** - JWT auth, input validation
- **Performance Optimized** - Fast queries, efficient UI
- **User Experience** - Intuitive, accessible design

### Business Impact
- **Knowledge Sharing** - Democratize learning
- **Community Connection** - Local skill networks
- **Economic Value** - Skill-based economy

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
# Build for production
cd frontend
npm run build

# Deploy build folder
```

### Backend (Heroku/Railway)
```bash
# Add Procfile
echo "web: node app.js" > Procfile

# Set environment variables in hosting platform
```

### Database (PostgreSQL Cloud)
- **Heroku Postgres**
- **AWS RDS**
- **Railway PostgreSQL**

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify .env file has correct credentials
```

**Port Already in Use**
```bash
# Change PORT in backend/.env
PORT=5002

# Or kill process using port
# Windows: netstat -ano | findstr :5001
# Mac/Linux: lsof -ti:5001 | xargs kill
```

**Module Not Found**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📈 Performance Features

- **Optimized Database Queries** with proper indexing
- **JWT Authentication** for secure sessions
- **Responsive Design** for all devices
- **Real-time Messaging** with efficient polling
- **Image Upload** with file validation
- **Search & Filtering** with multiple criteria

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- File upload restrictions

