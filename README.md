# Sanket - Community Issue Reporting Platform

PPT : https://www.canva.com/design/DAG5QKm85xA/5BiWu2bSbC-JSU7VHmF7-A/edit
Video Link : https://drive.google.com/file/d/1dSckmA7L9jk7Mi8yuiNkYuucIlfMpUNy/view

A full-stack Progressive Web Application (PWA) for municipal issue reporting and management, enabling citizens to report and track civic problems while providing administrators with powerful tools for efficient resolution and resource allocation.

## 🌟 Features

### For Citizens

- **Issue Reporting**: Report civic issues with photos, location, and detailed descriptions
- **AI-Powered Descriptions**: Automatic issue description enhancement using Google Gemini AI
- **Anonymous Reporting**: Option to report issues anonymously
- **Real-time Updates**: Get notifications on issue status changes
- **Upvoting System**: Support important issues by upvoting
- **Comments & Discussions**: Engage in community discussions on reported issues
- **Heatmap Visualization**: View geographic distribution of issues
- **Leaderboard**: Track top contributors to the community
- **Multilingual Support**: Available in English and Nepali (i18n)
- **Offline Support**: PWA with service worker for offline functionality
- **User Profiles**: Track your reported issues and contributions

### For Administrators

- **Admin Dashboard**: Comprehensive overview of all reported issues
- **Issue Management**: Update status, priority, and assign to categories
- **Budget Tracking**: Allocate and track budgets for issue resolution
- **Timeline Management**: Create and manage resolution timelines
- **Evidence Uploads**: Add before/after photos and evidence documentation
- **Advanced Analytics**: Statistical insights and prediction dashboards
- **Priority Management**: AI-powered priority calculation and manual override
- **Review System**: Review and approve/reject reported issues
- **PDF Reports**: Generate detailed PDF reports for issues
- **QR Code Generation**: Create QR codes for easy issue tracking
- **Push Notifications**: Send notifications to users about issue updates

## 🏗️ Tech Stack

### Frontend

- **React 19.2** - Modern UI library
- **Vite** - Fast build tool and dev server
- **React Router v7** - Client-side routing
- **TanStack Query** - Server state management
- **Tailwind CSS v4** - Utility-first CSS framework
- **Leaflet** - Interactive maps with heatmap support
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **i18next** - Internationalization
- **Lottie React** - Animation support
- **Axios** - HTTP client

### Backend

- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - Database and ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage and management
- **Multer** - File upload handling
- **Google Generative AI** - AI-powered features
- **PDFKit** - PDF generation
- **QRCode** - QR code generation
- **Nodemailer** - Email notifications
- **Twilio** - SMS notifications (optional)
- **Web Push** - Push notification support

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager
- Cloudinary account (for image uploads)
- Google AI API key (for Gemini AI features)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Final
```

### 2. Server Setup

```bash
cd server
npm install
```

Create a `.env` file in the server directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google AI
GEMINI_API_KEY=your_gemini_api_key

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Twilio (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

### 3. Client Setup

```bash
cd ../client
npm install
```

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### 4. Create Admin User

```bash
cd ../server
node scripts/createAdmin.js
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Start the Backend:**

```bash
cd server
npm run dev
```

Server will run on `http://localhost:5000`

**Terminal 2 - Start the Frontend:**

```bash
cd client
npm run dev
```

Client will run on `http://localhost:5173`

### Production Mode

**Build the Client:**

```bash
cd client
npm run build
```

**Start the Server:**

```bash
cd ../server
npm start
```

## 📁 Project Structure

```
Final/
├── client/                  # React frontend application
│   ├── public/             # Static assets
│   │   ├── hero.json       # Lottie animation
│   │   ├── manifest.json   # PWA manifest
│   │   └── sw.js           # Service worker
│   ├── src/
│   │   ├── api/            # API service functions
│   │   ├── assets/         # Images and static files
│   │   ├── components/     # Reusable React components
│   │   ├── context/        # React context providers
│   │   ├── data/           # Static data files
│   │   ├── hooks/          # Custom React hooks
│   │   ├── locales/        # Translation files (en, np)
│   │   ├── pages/          # Page components
│   │   ├── router/         # Route configuration
│   │   ├── styles/         # CSS files
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main app component
│   │   ├── i18n.js         # i18n configuration
│   │   └── main.jsx        # App entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   └── vite.config.js
│
└── server/                  # Node.js backend application
    ├── config/             # Configuration files
    │   ├── cloudinary.js   # Cloudinary setup
    │   ├── db.js           # MongoDB connection
    │   └── gemini.js       # Google AI setup
    ├── controllers/        # Request handlers
    │   ├── adminController.js
    │   ├── aiController.js
    │   ├── authController.js
    │   ├── budgetController.js
    │   ├── commentController.js
    │   ├── evidenceController.js
    │   ├── issueController.js
    │   ├── notificationController.js
    │   ├── pdfController.js
    │   ├── predictionController.js
    │   ├── priorityController.js
    │   ├── reviewController.js
    │   ├── timelineController.js
    │   └── upvoteController.js
    ├── middleware/         # Express middleware
    │   ├── adminMiddleware.js
    │   └── authMiddleware.js
    ├── models/             # Mongoose schemas
    │   ├── BeforeAfter.js
    │   ├── Budget.js
    │   ├── Comment.js
    │   ├── Issue.js
    │   ├── IssueEvidence.js
    │   ├── IssueHistory.js
    │   ├── Notification.js
    │   ├── OfflineIssue.js
    │   ├── PushSubscription.js
    │   ├── Review.js
    │   ├── Upvote.js
    │   └── User.js
    ├── routes/             # API routes
    │   ├── adminRoutes.js
    │   ├── authRoutes.js
    │   ├── budgetRoutes.js
    │   ├── commentRoutes.js
    │   ├── evidenceRoutes.js
    │   ├── issueRoutes.js
    │   ├── notificationRoutes.js
    │   ├── predictionRoutes.js
    │   ├── priorityRoutes.js
    │   ├── pushRoutes.js
    │   ├── reviewRoutes.js
    │   ├── timelineRoutes.js
    │   ├── upvoteRoutes.js
    │   └── userRoutes.js
    ├── scripts/            # Utility scripts
    │   ├── createAdmin.js  # Create admin user
    │   └── setAdmin.js     # Set existing user as admin
    ├── uploads/            # Uploaded files storage
    ├── utils/              # Helper functions
    ├── package.json
    └── server.js           # Server entry point
```

## 🔑 Key Functionalities

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (User/Admin)
- Google OAuth integration
- Secure password hashing

### Issue Management

- CRUD operations for issues
- Image upload with Cloudinary
- Location tracking with coordinates
- Category and ward classification
- Severity levels
- Status tracking (pending, in-progress, resolved, rejected)

### AI Integration

- Automatic issue description enhancement
- Priority prediction algorithms
- Intelligent categorization

### Real-time Features

- Push notifications for status updates
- Real-time comment updates
- Notification system

### Data Visualization

- Geographic heatmap of issues
- Statistical dashboards
- Charts and graphs for analytics
- Prediction insights

### Offline Capability

- Service worker implementation
- Offline issue storage
- Background sync when online

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Issues

- `GET /api/issues` - Get all issues
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

### Admin

- `GET /api/admin/dashboard` - Get dashboard data
- `GET /api/admin/issues` - Get all issues (admin view)
- `PUT /api/admin/issues/:id` - Update issue status
- `GET /api/admin/statistics` - Get statistics

### Comments

- `GET /api/comments/issue/:id` - Get issue comments
- `POST /api/comments` - Add comment
- `DELETE /api/comments/:id` - Delete comment

### Upvotes

- `POST /api/upvotes/:id` - Toggle upvote
- `GET /api/upvotes/:id` - Get upvote status

### Reviews

- `POST /api/reviews/:id` - Submit review
- `GET /api/reviews/:id` - Get reviews

### Budget

- `POST /api/budget/:id` - Add budget
- `GET /api/budget/:id` - Get budget details

### Timeline

- `POST /api/timeline/:id` - Add timeline entry
- `GET /api/timeline/:id` - Get timeline

### Evidence

- `POST /api/evidence/:id` - Upload evidence
- `GET /api/evidence/:id` - Get evidence

### Priority

- `GET /api/priority/:id` - Get priority score
- `PUT /api/priority/:id` - Update priority

### Predictions

- `GET /api/predictions` - Get prediction analytics

### Notifications

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/subscribe` - Subscribe to push notifications

## 🛡️ Security Features

- JWT token-based authentication
- Password encryption with bcryptjs
- Protected routes with middleware
- Input validation and sanitization
- CORS configuration
- Secure file upload handling

## 📱 Progressive Web App (PWA)

The application is a fully functional PWA with:

- Offline support
- Service worker caching
- App manifest for installation
- Responsive design
- Push notification support

## 🌍 Internationalization

The app supports multiple languages:

- English (en)
- Nepali (np)

Language can be switched from the user interface.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

**TeamCodeOrbitX**

- Provincial Phase - Rupandehi

## 📞 Support

For support, please contact the development team or open an issue in the repository.

## 🙏 Acknowledgments

- Google Generative AI for AI-powered features
- Cloudinary for image management
- MongoDB Atlas for database hosting
- The open-source community for amazing tools and libraries

---

**Built with ❤️ by TeamCodeOrbitX**
