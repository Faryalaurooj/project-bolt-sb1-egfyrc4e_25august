import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import phoneCallsRoutes from './routes/phone-calls.js';
import usersRoutes from './routes/users.js';
import textingRoutes from './routes/texting.js';
import dotenv from 'dotenv';
import kpiRoutes from './routes/kpi.js'; // 🆕 Import the KPI route
import policiesRoutes from './routes/policies.js';
import chatsRoutes from './routes/chats.js';
import companiesRoutes from './routes/companies.js';
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/phone-calls', phoneCallsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/texting', textingRoutes);
app.use('/api/kpi', kpiRoutes); // 🆕 Add the KPI route
app.use('/api/policies', policiesRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/companies', companiesRoutes);

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// General error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Backend Error:', err);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});
