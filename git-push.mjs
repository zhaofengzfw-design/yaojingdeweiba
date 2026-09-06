import git from 'isomorphic-git';
import fs from 'node:fs';
import http from 'isomorphic-git/http/node/index.js';

const dir = process.cwd();

// 从命令行参数读取：node git-push.mjs <repo-url> <token>
const repoUrl = process.argv[2];
const token = process.argv[3];

if (!repoUrl || !token) {
  console.error('用法: node git-push.mjs <仓库URL> <TOKEN>');
  process.exit(1);
}

// 从 URL 提取用户名
const urlObj = new URL(repoUrl);
const username = urlObj.pathname.split('/')[1];

// 构造带认证的 URL
const authUrl = `https://${username}:${token}@github.com${urlObj.pathname}`;

try {
  await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    url: authUrl,
    branch: 'main',
    onAuth: () => ({ username, password: token }),
  });
  console.log('✅ 推送成功！');
  console.log(`   仓库地址: ${repoUrl.replace('.git', '')}`);
} catch (err) {
  console.error('❌ 推送失败:', err.message);
  process.exit(1);
}
