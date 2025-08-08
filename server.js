const http = require('http');
const { URL } = require('url');

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

  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Chinese Learning</title></head>
<body>
<h1>Chinese Learning</h1>
<ul>
<li><a href="/grammar">Grammar</a></li>
<li><a href="/reading">Reading</a></li>
<li><a href="/listening">Listening</a></li>
<li><a href="/writing">Writing</a></li>
<li><a href="/characters">Characters</a></li>
<li><a href="/pinyin">Pinyin</a></li>
<li><a href="/tutor">AI Tutor</a></li>
</ul>
</body></html>`);
  } else if (req.method === 'GET' && url.pathname === '/grammar') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Grammar section placeholder');
  } else if (req.method === 'GET' && url.pathname === '/reading') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Reading section placeholder');
  } else if (req.method === 'GET' && url.pathname === '/listening') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Listening section placeholder');
  } else if (req.method === 'GET' && url.pathname === '/characters') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Characters writing section placeholder');
  } else if (req.method === 'GET' && url.pathname === '/pinyin') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Pinyin section placeholder');
  } else if (url.pathname === '/writing') {
    if (req.method === 'POST') {
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
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Writing</title></head>
<body>
<form method="POST" action="/writing">
<textarea name="text" rows="4" cols="50"></textarea><br/>
<button type="submit">Submit</button>
</form>
</body></html>`);
    }
  } else if (url.pathname === '/tutor') {
    if (req.method === 'POST') {
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
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Tutor</title></head>
<body>
<form method="POST" action="/tutor">
<input type="text" name="question" style="width:300px"/><br/>
<button type="submit">Ask</button>
</form>
</body></html>`);
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
