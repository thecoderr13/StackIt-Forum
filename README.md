# StackIt - Minimal Q&A Forum Platform

A modern, minimal question-and-answer platform built with the MERN stack, designed for collaborative learning and structured knowledge sharing.

##  Features

- **User Authentication** - Register, login with JWT
- **Rich Text Editor** - Full-featured editor with formatting, images, links
- **Question & Answers** - Post questions and answers with voting
- **Tagging System** - Organize questions with tags
- **Notification System** - Real-time notifications for interactions
- **Responsive Design** - Mobile-first design with TailwindCSS
- **Role-based Access** - Guest, User, and Admin roles

##  Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, React Router
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Rich Text**: React Quill

##  Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
\`\`\`bash
cd backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a \`.env\` file in the backend directory with the following variables:
\`\`\`env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stackit
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
NODE_ENV=development
\`\`\`

4. Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
\`\`\`bash
cd frontend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a \`.env\` file in the frontend directory with:
\`\`\`env
VITE_API_URL=http://localhost:5000/api
\`\`\`

4. Start the frontend development server:
\`\`\`bash
npm run dev
\`\`\`

The frontend will run on http://localhost:5173

##  Environment Variables

### Backend (.env)
- \`PORT\` - Server port (default: 5000)
- \`MONGODB_URI\` - MongoDB connection string
- \`JWT_SECRET\` - Secret key for JWT tokens
- \`NODE_ENV\` - Environment (development/production)

### Frontend (.env)
- \`VITE_API_URL\` - Backend API URL

##  API Endpoints

### Authentication
- \`POST /api/auth/register\` - Register new user
- \`POST /api/auth/login\` - Login user

### Questions
- \`GET /api/questions\` - Get all questions
- \`POST /api/questions\` - Create new question
- \`GET /api/questions/:id\` - Get question by ID
- \`PUT /api/questions/:id\` - Update question
- \`DELETE /api/questions/:id\` - Delete question

### Answers
- \`POST /api/answers\` - Create new answer
- \`PUT /api/answers/:id/vote\` - Vote on answer
- \`PUT /api/answers/:id/accept\` - Accept answer

### Users
- \`GET /api/users/profile\` - Get user profile
- \`PUT /api/users/profile\` - Update user profile

### Notifications
- \`GET /api/notifications\` - Get user notifications
- \`PUT /api/notifications/:id/read\` - Mark notification as read

##  UI Components

- Question listing with search and filters
- Rich text editor for questions and answers
- Voting system with upvote/downvote
- User authentication forms
- Notification dropdown
- Responsive navigation

##  Authentication Flow

1. Users can browse questions as guests
2. Registration required for posting questions/answers
3. JWT tokens stored in localStorage
4. Protected routes for authenticated users
5. Role-based permissions (User/Admin)

##  Responsive Design

- Mobile-first approach (using tailwind css)
- Responsive navigation
- Optimized for all screen sizes
- Touch-friendly interface

##  Deployment

### Backend Deployment
1. Set production environment variables
2. Build and deploy to your preferred platform (Heroku, Railway, etc.)

### Frontend Deployment
1. Update \`VITE_API_URL\` to production backend URL
2. Build the project: \`npm run build\`
3. Deploy to Vercel, Netlify, or your preferred platform

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

##  License

This project is licensed under the MIT License.
