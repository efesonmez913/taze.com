/*
 * Akol Emlak Gayrimenkul — sıfır bağımlılıklı geliştirme sunucusu
 * Çalıştırma: npm run dev
 * - Statik dosya sunumu + SSE canlı yenileme
 * - Port doluysa otomatik sonraki portu dener
 * - Açılışta tarayıcıyı açar (PORT env setliyse veya NO_OPEN=1 ise açmaz)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ROOT = __dirname;
const BASE_PORT = parseInt(process.env.PORT, 10) || 5190;
const AUTO_OPEN = !process.env.PORT && process.env.NO_OPEN !== '1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

const sseClients = new Set();

function watchTree(dir) {
  try {
    fs.watch(dir, { recursive: true }, (evt, file) => {
      if (!file) return;
      if (file.includes('node_modules') || file.startsWith('.git')) return;
      const ext = path.extname(file).toLowerCase();
      if (!['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) return;
      for (const res of sseClients) res.write('data: reload\n\n');
    });
  } catch (e) {
    /* recursive watch her platformda yoksa sessiz geç */
  }
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

  if (urlPath === '/__livereload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Connection: 'keep-alive'
    });
    res.write('retry: 1000\n\n');
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  let filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('403'); return;
  }
  if (urlPath === '/' || urlPath === '') filePath = path.join(ROOT, 'index.html');

  fs.stat(filePath, (err, st) => {
    if (!err && st.isDirectory()) filePath = path.join(filePath, 'index.html');
    fs.readFile(filePath, (err2, data) => {
      if (err2) {
        // uzantısız istekleri .html'e düşür (ör. /portfoy -> portfoy.html)
        if (!path.extname(filePath)) {
          fs.readFile(filePath + '.html', (err3, data3) => {
            if (err3) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('404 — sayfa bulunamadı'); }
            else serveHtml(res, data3);
          });
          return;
        }
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 — dosya bulunamadı');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.html') { serveHtml(res, data); return; }
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      res.end(data);
    });
  });
});

function serveHtml(res, data) {
  const inject = '<script>(function(){try{var e=new EventSource("/__livereload");e.onmessage=function(){location.reload()}}catch(_){}})();</script>';
  let html = data.toString('utf8');
  html = html.includes('</body>') ? html.replace('</body>', inject + '</body>') : html + inject;
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  res.end(html);
}

function listen(port, attempt) {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempt < 10) {
      console.log('Port ' + port + ' dolu, ' + (port + 1) + ' deneniyor...');
      listen(port + 1, attempt + 1);
    } else {
      console.error('Sunucu başlatılamadı:', err.message);
      process.exit(1);
    }
  });
  server.listen(port, () => {
    const url = 'http://localhost:' + port + '/';
    console.log('');
    console.log('  AKOL EMLAK GAYRİMENKUL — geliştirme sunucusu');
    console.log('  ' + url);
    console.log('  Durdurmak için Ctrl+C');
    console.log('');
    watchTree(ROOT);
    if (AUTO_OPEN) {
      const cmd = process.platform === 'win32' ? 'start "" "' + url + '"'
        : process.platform === 'darwin' ? 'open "' + url + '"'
        : 'xdg-open "' + url + '"';
      exec(cmd, () => {});
    }
  });
}

listen(BASE_PORT, 0);
