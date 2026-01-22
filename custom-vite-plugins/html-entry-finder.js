import { resolve, relative } from 'path';
import * as fs from 'fs';

// Recursively finds all index.html files inside the src folder to build input for RollupOptions
function findHtmlFiles(dir, srcRoot) {
  let htmlFiles = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {

    const fullPath = resolve(dir, entry.name);

    if (entry.isDirectory()) {
      htmlFiles = htmlFiles.concat(findHtmlFiles(fullPath, srcRoot));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      if (dir === srcRoot) {
        htmlFiles.push(fullPath);
      } else if (entry.name === 'index.html') {
        htmlFiles.push(fullPath);
      }
    }
  }
  return htmlFiles;
}

export function getHtmlEntries(srcRoot) {

  const files = findHtmlFiles(srcRoot, srcRoot);
  const entries = {};

  for (const file of files) {
    const relativePath = relative(srcRoot, file);

    let key;
    if (relativePath === 'index.html') {
      key = 'main';
    } else if (relativePath.endsWith('/index.html')) {
      key = relativePath.substring(0, relativePath.lastIndexOf('/index.html'));
    } else {
      key = relativePath.substring(0, relativePath.lastIndexOf('.html'));
    }

    const entryKey = key.replace(/\//g, '-');
    entries[entryKey] = file;
  }
  return entries;
}


