# ColorBet Casino - Full Stack Application

A modern color betting casino application built with React, Node.js, Express, and MongoDB.

## Features

- 🎮 Real-time color betting games
- 💰 Wallet management with deposit/withdrawal system
- 👑 Admin panel for game control and user management
- 🔐 JWT-based authentication
- 📱 Responsive design
- 🎨 Beautiful UI with Tailwind CSS

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Lucide React for icons
- Vite for development

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for image uploads
- Helmet for security
- Rate limiting and compression

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd colorbet-app
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Environment Setup**
   
   **Frontend (.env):**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   
   **Backend (server/.env):**
   ```env
   MONGODB_URI=mongodb://localhost:27017/colorbet
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development
   
   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Admin emails (comma-separated)
   ADMIN_EMAILS=admin@colorbet.com,rohitsj27@gmail.com
   ```

4. **Database Setup**
   ```bash
   # Seed the database with initial data
   npm run seed
   ```

5. **Start the application**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start them separately:
   # Backend
   npm run server:dev
   
   # Frontend (in another terminal)
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Wallet
- `GET /api/wallet` - Get user wallet
- `GET /api/wallet/transactions` - Get user transactions
- `PUT /api/wallet/balance` - Update wallet balance

### Games
- `GET /api/games/current` - Get current active game
- `POST /api/games/bet` - Place a bet
- `POST /api/games/create` - Create new game (admin)
- `PUT /api/games/:id/end` - End game (admin)

### Transactions
- `POST /api/transactions/deposit` - Create deposit request

### Admin
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/block` - Block/unblock user
- `GET /api/admin/transactions` - Get all transactions
- `PUT /api/admin/transactions/:id` - Update transaction status
- `GET /api/admin/settings` - Get admin settings
- `PUT /api/admin/settings` - Update admin settings

## Game Rules

### Color Game
- Players bet on numbers (0-9), colors (red/green), or sizes (big/small)
- **Number betting**: 9x multiplier
- **Color betting**: 2x multiplier  
- **Size betting**: 2x multiplier (big: 5-9, small: 0-4)
- Special rule: 0 is always green

## Admin Features

- User management (view, block/unblock users)
- Transaction management (approve/reject deposits)
- Game control (create games, fix results)
- Settings management (QR codes, banners)
- Real-time statistics dashboard

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Helmet for security headers
- Input validation
- Admin role-based access control

## Deployment

### Backend Deployment
1. Set up MongoDB Atlas or your preferred MongoDB hosting
2. Configure environment variables for production
3. Deploy to your preferred platform (Heroku, DigitalOcean, AWS, etc.)

### Frontend Deployment
1. Update `VITE_API_URL` to your production API URL
2. Build the application: `npm run build`
3. Deploy the `dist` folder to your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.