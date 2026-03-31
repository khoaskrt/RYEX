#!/usr/bin/env node
/**
 * Khôi phục cài đặt khi npm bị ENOTEMPTY / node_modules hỏng (thường do npm ci bị Ctrl+C).
 * Bước 1: xóa .next
 * Bước 2: gỡ node_modules — ưu tiên rename (nhanh, tránh ETIMEDOUT khi scandir trên iCloud/Desktop),
 *         nếu không được mới dùng fs.rmSync.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');

function rmDir(name) {
  const target = path.join(root, name);
  if (!fs.existsSync(target)) {
    console.log(`skip (missing): ${name}`);
    return;
  }
  console.log(`removing: ${name}`);
  fs.rmSync(target, { recursive: true, force: true });
}

function retireNodeModules() {
  const nm = path.join(root, 'node_modules');
  if (!fs.existsSync(nm)) {
    console.log('skip (missing): node_modules');
    return;
  }

  const trashName = `node_modules._trash_${Date.now()}`;
  const trashPath = path.join(root, trashName);

  try {
    fs.renameSync(nm, trashPath);
    console.log(`renamed node_modules -> ${trashName} (xóa thư mục này sau khi npm ci xong, khi máy rảnh)`);
    return;
  } catch (renameErr) {
    console.warn('rename node_modules failed, trying rmSync:', renameErr.message);
  }

  try {
    console.log('removing: node_modules (recursive)');
    fs.rmSync(nm, { recursive: true, force: true });
  } catch (rmErr) {
    console.error(rmErr);
    console.error(
      '\nKhông xóa được node_modules. Thử: (1) đóng Cursor/dev server, (2) tắt sync iCloud cho thư mục project, (3) xóa node_modules bằng Finder, (4) clone repo ra ~/Projects (không nằm Desktop).'
    );
    process.exit(1);
  }
}

try {
  rmDir('.next');
  retireNodeModules();
} catch (err) {
  console.error(err);
  process.exit(1);
}

console.log('running: npm ci');
execSync('npm ci', { cwd: root, stdio: 'inherit' });
