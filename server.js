const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1000;

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
  deletedAt: { type: Date, default: null },
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

// Get all tasks with optional filter for deleted records
app.get('/api/tasks', async (req, res) => {
  try {
    const { includeDeleted } = req.query;
    let filter = {};
    
    if (includeDeleted === 'true') {
      // Show only deleted records (where active is false)
      filter = { active: false };
    } else if (includeDeleted === 'all') {
      // Show all records (active and deleted) - no filter needed
      filter = {};
    } else {
      // Default: show only active records (where active is true)
      filter = { active: true };
    }
    
    console.log('Filter applied:', filter); // Debug log
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    console.log('Tasks found:', tasks.length); // Debug log
    console.log('Sample task active status:', tasks.length > 0 ? tasks[0].active : 'No tasks'); // Debug log
    
    res.json(tasks);
  } catch (error) {
    console.error('Error in /api/tasks:', error);
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
    console.log('Soft deleting task with ID:', req.params.id); // Debug log
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id, 
      { 
        active: false,
        deletedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true } // Return the updated document
    );
    
    console.log('Task after soft delete:', updatedTask); // Debug log
    
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ 
      message: 'Task deleted successfully',
      deletedTask: updatedTask
    });
  } catch (error) {
    console.error('Error in soft delete:', error);
    res.status(500).json({ message: error.message });
  }
});

// Restore deleted task
app.put('/api/tasks/:id/restore', async (req, res) => {
  try {
    const restoredTask = await Task.findByIdAndUpdate(
      req.params.id,
      { 
        active: true,
        deletedAt: null,
        updatedAt: new Date()
      },
      { new: true }
    );
    res.json(restoredTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Permanently delete task
app.delete('/api/tasks/:id/permanent', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    // Also delete associated logs
    await TaskLog.deleteMany({ taskId: req.params.id });
    res.json({ message: 'Task permanently deleted' });
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

// Debug route to check all tasks and their active status
app.get('/api/debug/tasks', async (req, res) => {
  try {
    const allTasks = await Task.find({}).sort({ createdAt: -1 });
    const summary = {
      total: allTasks.length,
      active: allTasks.filter(t => t.active === true).length,
      deleted: allTasks.filter(t => t.active === false).length,
      tasks: allTasks.map(t => ({
        _id: t._id,
        title: t.title,
        active: t.active,
        deletedAt: t.deletedAt,
        createdAt: t.createdAt
      }))
    };
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});