import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const newContent = content.replace(/var\(--theme-/g, 'var(--color-');
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`Updated ${filePath}`);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist') {
                processDirectory(fullPath);
            }
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            replaceInFile(fullPath);
        }
    }
}

processDirectory('/Users/per/Library/CloudStorage/GoogleDrive-p.o.weum@gmail.com/My Drive/Themebuilder/components');
replaceInFile('/Users/per/Library/CloudStorage/GoogleDrive-p.o.weum@gmail.com/My Drive/Themebuilder/App.tsx');
