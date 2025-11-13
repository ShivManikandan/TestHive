import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { retrieveHandler } from './routes/retrieve';
import { refineHandler } from './routes/refine';
import { analyzeStoryHandler } from './routes/analyze';
import { generateAcceptanceCriteriaHandler } from './routes/generateAcceptanceCriteria';

// Disable SSL certificate validation globally (for corporate networks with self-signed certs)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'TestHive API is running' });
});

// Main retrieval endpoint
app.post('/api/retrieve', retrieveHandler);

// Query refinement endpoint
app.post('/api/refine-query', refineHandler);

// Comprehensive story analysis endpoint (ICE POT Implementation)
app.post('/api/analyze', analyzeStoryHandler);

// Acceptance criteria generation endpoint
app.post('/api/generate-acceptance-criteria', generateAcceptanceCriteriaHandler);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TestHive Backend running on http://localhost:${PORT}`);
});

