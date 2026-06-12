# Campus Mate Backend

Node.js + Express + MongoDB backend for Campus Mate application.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Update the `.env` file with your MongoDB connection string:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus_mate
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
```

### 3. MongoDB Setup

Make sure MongoDB is installed and running locally or update `MONGODB_URI` with your MongoDB Atlas connection string:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campus_mate
```

### 4. Run the Backend

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:5000`

## Project Structure

```
backend/
├── config/          # Configuration files (database)
├── controllers/     # Route handlers logic
├── models/          # MongoDB schemas
├── routes/          # API routes
├── server.js        # Main server file
├── package.json     # Dependencies
├── .env.example     # Environment variables template
└── .gitignore       # Git ignore rules
```

## Available Routes

### Health Check
- `GET /api/health` - Server status

### Users (To be implemented)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Models

### User
- name (String)
- email (String, unique)
- password (String)
- role (student | admin)

### Project
- title (String)
- description (String)
- owner (User reference)
- collaborators (User references)
- tasks (Task references)
- status (active | completed | archived)

### Task
- title (String)
- description (String)
- dueDate (Date)
- assignedTo (User reference)
- project (Project reference)
- status (pending | in-progress | completed)
- priority (low | medium | high)

## Next Steps

1. Implement user authentication (signup/login)
2. Add project and task CRUD operations
3. Implement attendance tracking endpoints
4. Add file upload handling for PDFs
5. Implement permission and authorization system
