/**
 * Servidor local sem dependências.
 *
 *   npm start            → http://localhost:4173
 *   PORT=8080 npm start  → outra porta
 *
 * Serve os arquivos desta pasta. Necessário porque o app usa módulos
 * JavaScript (import/export), que o navegador não carrega abrindo o
 * index.html direto do disco.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORTA = Number(process.env.PORT) || 4173;
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8'
};

createServer(async (req, res) => {
  const caminho = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const relativo = normalize(caminho).replace(/^([/\\])+/, '') || 'index.html';
  const arquivo = join(RAIZ, relativo.endsWith('/') ? relativo + 'index.html' : relativo);
  if (!arquivo.startsWith(RAIZ)) { res.writeHead(403).end('Acesso negado'); return; }
  try {
    const conteudo = await readFile(arquivo);
    res.writeHead(200, { 'Content-Type': TIPOS[extname(arquivo)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(conteudo);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Arquivo não encontrado');
  }
}).listen(PORTA, () => {
  console.log(`Meu Plan rodando em http://localhost:${PORTA}`);
});
