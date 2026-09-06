import git from 'isomorphic-git';
import fs from 'node:fs';

const dir = process.cwd();

try {
  // 初始化仓库
  await git.init({ fs, dir, defaultBranch: 'main' });
  console.log('✅ git init 完成');

  // 添加所有文件
  await git.add({ fs, dir, filepath: '.' });
  console.log('✅ git add 完成');

  // 提交
  const sha = await git.commit({
    fs,
    dir,
    message: 'init: 妖精的尾巴家族招募页',
    author: { name: 'fairy-tail', email: 'fairy-tail@local' },
  });
  console.log('✅ git commit 完成:', sha.substring(0, 8));
} catch (err) {
  console.error('❌ 错误:', err.message);
  process.exit(1);
}
