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

// 忽略的文件/目录
const IGNORE = new Set(['node_modules', 'dist', '.git', '.agent', 'tmp', 'temp', '.playwright-cli']);
const IGNORE_EXT = new Set(['.log', '.pid', '.seed', '.pid.lock', '.swp', '.swo', '.tsbuildinfo']);

function shouldIgnore(filePath) {
  const parts = filePath.split(path.sep);
  for (const p of parts) {
    if (IGNORE.has(p)) return true;
  }
  const ext = path.extname(filePath).toLowerCase();
  if (IGNORE_EXT.has(ext)) return true;
  if (filePath.startsWith('.')) return true;
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
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status} ${JSON.stringify(data).slice(0, 200)}`);
  return data;
}

async function main() {
  console.log('📦 扫描文件...');
  const files = walk('.');
  console.log(`   找到 ${files.length} 个文件`);

  // 获取当前分支的 SHA（如果仓库非空）
  let baseTree = null;
  let parentSha = null;
  try {
    const ref = await api('GET', `${API}/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`);
    parentSha = ref.object.sha;
    const commit = await api('GET', `${API}/repos/${OWNER}/${REPO}/git/commits/${parentSha}`);
    baseTree = commit.tree.sha;
    console.log(`   仓库已有 commit: ${parentSha.substring(0, 8)}`);
  } catch {
    console.log('   仓库为空，将创建首个 commit');
  }

  // 上传所有文件为 blob，构建 tree
  console.log('⬆️  上传文件...');
  const tree = [];
  for (const file of files) {
    const content = fs.readFileSync(file);
    const blob = await api('POST', `${API}/repos/${OWNER}/${REPO}/git/blobs`, {
      content: content.toString('base64'),
      encoding: 'base64',
    });
    tree.push({
      path: file,
      mode: '100644',
      type: 'blob',
      sha: blob.sha,
    });
  }

  // 创建 tree
  console.log('🌳 创建 tree...');
  const treeRes = await api('POST', `${API}/repos/${OWNER}/${REPO}/git/trees`, {
    tree,
    base_tree: baseTree,
  });

  // 创建 commit
  console.log('📝 创建 commit...');
  const commit = await api('POST', `${API}/repos/${OWNER}/${REPO}/git/commits`, {
    message: 'init: 妖精的尾巴家族招募页',
    tree: treeRes.sha,
    parents: parentSha ? [parentSha] : [],
  });

  // 更新分支
  console.log('🔗 更新分支...');
  if (parentSha) {
    await api('PATCH', `${API}/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
      sha: commit.sha,
      force: true,
    });
  } else {
    await api('POST', `${API}/repos/${OWNER}/${REPO}/git/refs`, {
      ref: `refs/heads/${BRANCH}`,
      sha: commit.sha,
    });
  }

  console.log(`✅ 推送成功！commit: ${commit.sha.substring(0, 8)}`);
}

main().catch((err) => {
  console.error('❌ 失败:', err.message);
  process.exit(1);
});
