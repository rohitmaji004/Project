const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3002;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// In-memory storage for tasks
let tasks = [];
let taskIdCounter = 1;

// Function to create the first task automatically
function initializeFirstTask() {
  tasks.push({
    id: taskIdCounter++,
    title: 'First Task',
    description: 'This is the first task.',
    group: 1,
    status: 'active'
  });
}

// Initialize the first task when the server starts
initializeFirstTask();

// Endpoint to get all active tasks
app.get('/tasks/active', (req, res) => {
  const activeTasks = tasks.filter(task => task.status === 'active');
  res.json(activeTasks);
});

// Endpoint to get all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// Endpoint to get all completed tasks
app.get('/tasks/completed', (req, res) => {
  const completedTasks = tasks.filter(task => task.status === 'completed');
  res.json(completedTasks);
});

// Endpoint to create a new task
app.post('/tasks', (req, res) => {
  const newTask = {
    id: taskIdCounter++,
    title: req.body.title,
    description: req.body.description,
    group: req.body.group,
    status: 'pending'
  };
  tasks.push(newTask);
  res.json(newTask);
});

// Endpoint to update an existing task
app.put('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.status = req.body.status || task.status;

    // Unlock next task if the current task is completed
    if (task.status === 'completed') {
      const currentGroup = task.group;
      const allTasksInGroup = tasks.filter(t => t.group === currentGroup);
      const allCompleted = allTasksInGroup.every(t => t.status === 'completed');

      if (allCompleted) {
        const nextGroupTasks = tasks.filter(t => t.group === currentGroup + 1);
        nextGroupTasks.forEach(t => t.status = 'active');
      }
    }

    res.json(task);
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});

// Endpoint to delete a task
app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);
    res.json({ message: 'Task deleted' });
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});

// Start the server
app.listen(3002, () => {
  console.log(`Taskboard system running at http://localhost:${port}`);
});
