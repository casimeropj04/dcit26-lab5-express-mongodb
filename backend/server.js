require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Student = require('./models/Student');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(express.json());

// Only allow known fields from the request body
const pickFields = (body = {}) => {
  const data = {};
  ['fullName', 'course', 'yearLevel', 'section'].forEach((key) => {
    if (body[key] !== undefined) data[key] = body[key];
  });
  return data;
};

// Reject malformed IDs with 400 before touching the database
const validateId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid student ID' });
  }
  next();
};

// Convert errors into suitable status codes without leaking stack traces
const handleError = (err, res) => {
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation failed', errors: messages });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid value for ${err.path}` });
  }
  console.error(err.message);
  return res.status(500).json({ message: 'Internal server error' });
};

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET all
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    handleError(err, res);
  }
});

// GET one
app.get('/api/students/:id', validateId, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    handleError(err, res);
  }
});

// POST create
app.post('/api/students', async (req, res) => {
  try {
    const student = await Student.create(pickFields(req.body));
    res.status(201).json(student);
  } catch (err) {
    handleError(err, res);
  }
});

// PUT update
app.put('/api/students/:id', validateId, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      pickFields(req.body),
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    handleError(err, res);
  }
});

// DELETE
app.delete('/api/students/:id', validateId, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully', id: student._id });
  } catch (err) {
    handleError(err, res);
  }
});

// Unknown routes
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Malformed JSON bodies and any other uncaught errors
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON in request body' });
  }
  console.error(err.message);
  res.status(500).json({ message: 'Internal server error' });
});

// Start listening only after the database connects
const start = async () => {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set. Create a .env file (see .env.example).');
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

start();
