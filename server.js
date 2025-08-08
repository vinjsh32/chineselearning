const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

async function correctText(text) {
  const token = process.env.HF_API_TOKEN;
  if (!token) {
    return { corrected: text, note: 'HF_API_TOKEN not set - returning original text.' };
  }
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/uer/gpt2-chinese-cluecorpussmall', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: text })
    });
    if (!response.ok) {
      return { corrected: text, note: `Model request failed: ${response.status}` };
    }
    const data = await response.json();
    if (Array.isArray(data) && data[0]?.generated_text) {
      return { corrected: data[0].generated_text };
    }
    return { corrected: text, note: 'Model response in unexpected format.' };
  } catch (err) {
    return { corrected: text, note: `Model request error: ${err.message}` };
  }
}

async function askTutor(question) {
  const token = process.env.HF_API_TOKEN;
  if (!token) {
    return { answer: 'HF_API_TOKEN not set - cannot query model.' };
  }
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/Qwen/Qwen1.5-0.5B-Chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: question })
    });
    if (!response.ok) {
      return { answer: `Model request failed: ${response.status}` };
    }
    const data = await response.json();
    if (Array.isArray(data) && data[0]?.generated_text) {
      return { answer: data[0].generated_text };
    }
    return { answer: 'Model response in unexpected format.' };
  } catch (err) {
    return { answer: `Model request error: ${err.message}` };
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // serve static files
  if (req.method === 'GET') {
    const publicDir = path.join(__dirname, 'public');
    let pathname = url.pathname.replace(/^\/+/,'');
    if (pathname === '') {
      pathname = 'index.html';
    } else if (!path.extname(pathname)) {
      pathname += '.html';
    }
    const filePath = path.join(publicDir, pathname);
    if (filePath.startsWith(publicDir) && fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = ext === '.css' ? 'text/css' :
                          ext === '.js' ? 'application/javascript' :
                          'text/html; charset=utf-8';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  if (url.pathname === '/writing' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      let text = '';
      try {
        if (req.headers['content-type'] === 'application/json') {
          const json = JSON.parse(body || '{}');
          text = json.text || '';
        } else {
          const params = new URLSearchParams(body);
          text = params.get('text') || '';
        }
      } catch (e) {
        text = '';
      }
      const result = await correctText(text);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result));
    });
  } else if (url.pathname === '/tutor' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      let question = '';
      try {
        if (req.headers['content-type'] === 'application/json') {
          const json = JSON.parse(body || '{}');
          question = json.question || '';
        } else {
          const params = new URLSearchParams(body);
          question = params.get('question') || '';
        }
      } catch (e) {
        question = '';
      }
      const result = await askTutor(question);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result));
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
