const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

const DATA_FILE = path.join(__dirname, 'requests.json');

// Helper to validate request object
const isValidRequest = (req) => {
  return req && typeof req === 'object' && 'id' in req && 'status' in req;
};

// Initialize data file with empty array if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// GET /api/requests
app.get('/api/requests', async (req, res) => {
  try {
    const data = await fs.promises.readFile(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading requests:', error);
    res.status(500).json({ error: '데이터를 읽어오는데 실패했습니다.' });
  }
});

// POST /api/requests
app.post('/api/requests', async (req, res) => {
  try {
    let requests = req.body;

    // Normalize payload: Handle { requests: [...] } or [...]
    if (!Array.isArray(requests) && requests && Array.isArray(requests.requests)) {
      requests = requests.requests;
    }

    if (!Array.isArray(requests)) {
      console.warn('Invalid payload format received:', req.body);
      return res.status(400).json({ error: '올바른 요청 데이터 형식이 아닙니다 (배열 필요).' });
    }

    // Basic Schema Validation
    if (requests.length > 0 && !isValidRequest(requests[0])) {
      return res.status(400).json({ error: '요청 객체 구성이 올바르지 않습니다.' });
    }

    // Async write to file
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(requests, null, 2));

    console.log(`[API] Saved ${requests.length} requests successfully.`);
    res.json({ success: true, count: requests.length });
  } catch (error) {
    console.error('Error saving requests:', error);
    res.status(500).json({ error: '데이터 저장에 실패했습니다.' });
  }
});

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle Single Page Application (SPA) routing:
// Redirect all requests to index.html so React Router can handle them.
app.get('*', (req, res) => {
  // Disable caching for index.html to ensure users always get the latest version
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`
🚀 Server is running!
🔗 Access locally: http://localhost:${port}
🌍 Access via VM IP: http://<YOUR_VM_EXTERNAL_IP>:${port}

Press Ctrl+C to stop the server.
  `);
});
