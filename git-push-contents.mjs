import fs from 'node:fs';
import path from 'node:path';

const OWNER = 'zhaofengzfw-design';
const REPO = 'yaojingdeweiba';
const TOKEN = process.argv[2];
const BRANCH = 'main';
const API = 'https://api.github.com';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Accept': 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

const IGNORE = new Set(['node_modules', 'dist', '.git', '.agent', 'tmp', 'temp', '.playwright-cli']);
const IGNORE_EXT = new Set(['.log', '.pid', '.seed', '.pid.lock', '.swp', '.swo', '.tsbuildinfo']);

function shouldIgnore(filePath) {
  const parts = filePath.split(path.sep);
  for (const p of parts) {
    if (IGNORE.has(p)) return true;
  }
  const ext = path.extname(filePath).toLowerCase();
  if (IGNORE_EXT.has(ext)) return true;
  // 允许 .github 目录，其他隐藏文件忽略
  if (filePath.startsWith('.') && !filePath.startsWith('.github')) return true;
  return false;
}

function walk(dir, base = '') {
  const results = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    if (shouldIgnore(rel)) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...walk(full, rel));
    } else {
      results.push(rel);
    }
  }
  return results;
}

async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status} ${JSON.stringify(data).slice(0, 300)}`);
  return data;
}

async function main() {
  console.log('📦 扫描文件...');
  const files = walk('.');
  console.log(`   找到 ${files.length} 个文件`);

  let count = 0;
  for (const file of files) {
    count++;
    const content = fs.readFileSync(file).toString('base64');
    try {
      // 检查文件是否已存在
      let sha = null;
      try {
        const existing = await api('GET', `${API}/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(file)}?ref=${BRANCH}`);
        if (existing && existing.sha) sha = existing.sha;
      } catch { /* 不存在，创建新文件 */ }

      const body = {
        message: `init: ${file}`,
        content,
        branch: BRANCH,
      };
      if (sha) body.sha = sha;

      await api('PUT', `${API}/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(file)}`, body);
      process.stdout.write(`\r   上传中... ${count}/${files.length}`);
    } catch (err) {
      console.log(`\n   ⚠️  ${file}: ${err.message}`);
    }
  }
  console.log(`\n✅ 全部上传完成！共 ${count} 个文件`);
}

main().catch((err) => {
  console.error('\n❌ 失败:', err.message);
  process.exit(1);
});
