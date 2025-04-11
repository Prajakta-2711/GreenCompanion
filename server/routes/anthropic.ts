import { Router } from 'express';

// Create a router for Anthropic API endpoints
const router = Router();

// Create an endpoint to get the API key
router.get('/api/anthropic-key', (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  
  if (!apiKey) {
    return res.status(400).json({
      error: 'ANTHROPIC_API_KEY not found in environment variables'
    });
  }

  // Return the API key
  res.json({ apiKey });
});

export default router;