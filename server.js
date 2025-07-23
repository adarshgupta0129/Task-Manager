const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (will be configured when connection string is provided)
const connectDB = async () => {
  try {
    // Placeholder for MongoDB connection
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connection ready.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Models
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Not started', 'In progress', 'Completed'], 
    default: 'Not started' 
  },
  assignee: { type: String, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const taskLogSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  date: { type: Date, default: Date.now },
  progress: { type: Number, min: 0, max: 100, required: true },
  remarks: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);
const TaskLog = mongoose.model('TaskLog', taskLogSchema);

// Routes

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({ active: true }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new task
app.post('/api/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete task (soft delete)
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get task logs
app.get('/api/tasks/:id/logs', async (req, res) => {
  try {
    const logs = await TaskLog.find({ taskId: req.params.id }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task log
app.post('/api/tasks/:id/logs', async (req, res) => {
  try {
    const taskLog = new TaskLog({
      taskId: req.params.id,
      ...req.body
    });
    const savedLog = await taskLog.save();
    res.status(201).json(savedLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get team members (hardcoded for now)
app.get('/api/team-members', (req, res) => {
  const teamMembers = [
    'Deepak',
    'Swati',
    'Adarsh',
    'Gaurav',
    'Shubh'
  ];
  res.json(teamMembers);
});

 connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});