# Task Management System

A comprehensive task management application built with Node.js, Angular, and MongoDB for tracking team tasks with daily progress updates.

## Features

### Core Functionality
- **Task Creation**: Create tasks with title, description, due date, status, and assignee
- **Task Management**: View, edit, and delete tasks with status tracking
- **Progress Logging**: Add daily progress updates with percentage completion and remarks
- **Team Management**: Assign tasks to predefined team members
- **Status Tracking**: Track tasks through "Not started", "In progress", and "Completed" states

### User Interface
- **Modern Design**: Clean, professional interface with intuitive navigation
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Instant feedback and data updates
- **Progress Visualization**: Visual progress bars and status indicators

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **CORS** enabled for cross-origin requests
- **Environment variable** support with dotenv

### Frontend
- **Angular** with TypeScript
- **Reactive Forms** for form validation
- **HTTP Client** for API communication
- **CSS3** with modern styling and animations

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB instance (local or cloud)
- Angular CLI (v15 or higher)

### Backend Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure MongoDB connection:
   - Add your MongoDB connection string to `.env` file:
   ```
   MONGODB_URI=your_mongodb_connection_string_here
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:3000`

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install Angular dependencies:
   ```bash
   npm install
   ```

3. Start the Angular development server:
   ```bash
   ng serve
   ```
   The application will run on `http://localhost:4200`

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all active tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (soft delete)

### Task Logs
- `GET /api/tasks/:id/logs` - Get task logs
- `POST /api/tasks/:id/logs` - Create task log

### Team Members
- `GET /api/team-members` - Get team members list

## Database Schema

### Task Model
```javascript
{
  title: String (required),
  description: String (required),
  dueDate: Date (required),
  status: String (enum: ['Not started', 'In progress', 'Completed']),
  assignee: String (required),
  active: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Log Model
```javascript
{
  taskId: ObjectId (required),
  date: Date (default: now),
  progress: Number (0-100, required),
  remarks: String (required),
  createdAt: Date
}
```

## Usage Guide

### Creating Tasks
1. Click "New Task" in the navigation
2. Fill in task details:
   - Task title and description
   - Due date
   - Initial status
   - Assign to team member
3. Click "Create Task"

### Managing Tasks
1. Click "Task List" to view all tasks
2. Use action buttons on each task:
   - **Edit**: Modify task details
   - **Task Log**: Add progress updates
   - **Delete**: Remove task

### Adding Progress Updates
1. Click "Task Log" on any task
2. In the left panel:
   - Set progress percentage (0-100%)
   - Add remarks about current status
   - Click "Add Log"
3. View log history in the right panel

## Team Members
The system comes pre-configured with 5 team members:
- John Doe
- Jane Smith
- Mike Johnson
- Sarah Wilson
- Alex Brown

You can modify the team members list in the backend `server.js` file.

## Customization

### Adding Team Members
Edit the team members array in `server.js`:
```javascript
const teamMembers = [
  'Your Team Member 1',
  'Your Team Member 2',
  // Add more members as needed
];
```

### Styling Customization
- Modify `frontend/src/app/app.component.css` for UI changes
- Update color scheme by changing CSS custom properties
- Adjust responsive breakpoints for different screen sizes

## Production Deployment

### Backend
1. Set environment variables:
   ```
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   PORT=3000
   ```

2. Start production server:
   ```bash
   npm start
   ```

### Frontend
1. Build for production:
   ```bash
   ng build --prod
   ```

2. Serve the built files from `dist/frontend` directory

## Troubleshooting

### Common Issues
1. **MongoDB Connection Error**: Ensure your connection string is correct in `.env` file
2. **CORS Issues**: Verify the frontend URL is allowed in backend CORS configuration
3. **Port Conflicts**: Change ports in respective configuration files if needed

### Development Tips
- Use `npm run dev` for backend development with auto-reload
- Use `ng serve` for frontend development with hot reload
- Check browser console for frontend errors
- Check terminal output for backend errors

## License
This project is licensed under the ISC License.