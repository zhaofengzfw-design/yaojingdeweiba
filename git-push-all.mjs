import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'node:fs';

const dir = process.cwd();

try {
  // 先把最新修改提交
  await git.add({ fs, dir, filepath: 'sync/fetch-data.mjs' });
  const status = await git.statusMatrix({ fs, dir });
  const changed = status.some(([, , worktree]) => worktree !== 1);
  if (changed) {
    await git.commit({
      fs, dir,
      message: 'fix: 支持 wiki 格式多维表格链接',
      author: { name: 'fairy-tail', email: 'fairy-tail@local' },
    });
    console.log('✅ 已提交最新修改');
  } else {
    console.log('ℹ️  无新改动');
  }

  // 推送到 GitHub
  const token = process.argv[2];
  if (!token) {
    console.error('请提供 Token: node git-push-all.mjs <TOKEN>');
    process.exit(1);
  }

  await git.push({
    fs, http, dir,
    remote: 'origin',
    branch: 'main',
    url: `https://oauth2:${token}@github.com/zhaofengzfw-design/yaojingdeweiba.git`,
  });
  console.log('✅ 推送成功！');
} catch (err) {
  console.error('❌ 失败:', err.message);
  process.exit(1);
}
