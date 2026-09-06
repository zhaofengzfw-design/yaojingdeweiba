import git from 'isomorphic-git';
import fs from 'node:fs';

const dir = process.cwd();
const repoUrl = 'https://github.com/zhaofengzfw-design/yaojingdeweiba.git';

try {
  await git.addRemote({ fs, dir, remote: 'origin', url: repoUrl, force: true });
  console.log('✅ remote origin 已设置:', repoUrl);
} catch (err) {
  console.error('❌ 错误:', err.message);
}
