# Flow - Linear Clone

A Linear clone built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **Authentication**: JWT-based secure authentication
- **Issue Management**: Create, read and update issues
- **Team Organization**: Multiple teams with dedicated issue boards
- **Issue Board**: Kanban-style board with customizable columns (Backlog, Todo, In Progress, In Review, Done, Cancelled, Duplicate)
- **Issue Details**: Comprehensive issue detail page with:
  - Editable title and description
  - Status, priority, and assignee management
  - Sub-issues support
  - Comments system
  - Activity tracking
- **Dark Theme**: Beautiful dark theme matching Linear's design
- **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcrypt** for password hashing
- RESTful API architecture

### Frontend
- **React 18** with Hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd flow
```

2. Run the setup script:
```bash
npm start
```

This will:
- Install all dependencies (root, backend, frontend)
- Start MongoDB if not running
- Seed the database with initial data
- Start both backend and frontend servers

The application will be available at:
- Frontend: http://localhost:8000
- Backend API: http://localhost:8080

### Manual Setup

If you prefer to set up manually:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Seed the database
cd ../backend
npm run seed

# Start the application (from root)
cd ..
npm start
```

## Default Credentials

```
Email: alice@flow.dev
Password: Password@123
```

## Project Structure

```
flow/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utilities (seed script)
│   └── app.js           # Express app
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # React context (Auth)
│   │   ├── pages/       # Page components
│   │   ├── App.js       # Main app component
│   │   └── utils.js     # Utility functions
│   └── package.json
└── package.json         # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires authentication)

### Users
- `GET /api/users` - Get all users (requires authentication)

### Teams
- `GET /api/teams` - Get all teams (requires authentication)

### Issues
- `GET /api/issues/team/:teamId` - Get issues by team (requires authentication)
- `GET /api/issues/:identifier` - Get issue by identifier (requires authentication)
- `POST /api/issues` - Create new issue (requires authentication)
- `PUT /api/issues/:identifier` - Update issue (requires authentication)

### Comments
- `GET /api/comments/issue/:issueId` - Get comments for issue (requires authentication)
- `POST /api/comments/issue/:issueId` - Add comment (requires authentication)
- `PUT /api/comments/:id` - Update comment (requires authentication)
- `DELETE /api/comments/:id` - Delete comment (requires authentication)

### Activities
- `GET /api/activities/issue/:issueId` - Get activities for issue (requires authentication)

## Features in Detail

### Issue Board
- View issues organized by status columns
- Filter by: All issues, Active (todo, in progress, in review), or Backlog
- Drag-and-drop support (can be added)
- Quick issue creation from any column

### Issue Detail Page
- Edit title and description inline
- Change status, priority, and assignee via dropdowns
- Create and manage sub-issues
- Add, edit, and delete comments
- View activity history
- Delete issues

### Teams
The app comes seeded with 4 teams:
- **Engineering** (ENG) - Core engineering team
- **Design** (DES) - Product design and UX team
- **Marketing** (MKT) - Marketing and growth team
- **Product** (PRD) - Product strategy and roadmap

## Seed Data

The application comes with pre-seeded data including:
- 9 users with realistic names and emails
- 4 teams with different focuses
- 20+ issues across different statuses and priorities
- Sub-issues for complex tasks
- Comments on selected issues
- Activity history for all changes

## Development

### Seeding Database
```bash
npm run seed
```

This resets the database to initial state with fresh seed data.

## Best Practices Implemented

1. **Security**
   - JWT authentication with secure token handling
   - Password hashing with bcrypt
   - Protected API routes

2. **Code Organization**
   - Clean separation of concerns (MVC pattern)
   - Reusable components
   - Context API for global state

3. **Database**
   - Mongoose schemas with validation
   - Indexes for performance
   - Proper relationships between models

4. **UI/UX**
   - Responsive design
   - Dark theme matching Linear
   - Loading states
   - Error handling with toast notifications
   - Keyboard shortcuts support

5. **Performance**
   - Efficient database queries with population
   - Optimized re-renders
   - Lazy loading where applicable
