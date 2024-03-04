const fs = require('fs');
const path = require('path');

// 要遍历的文档目录
const docsDir = path.join(__dirname, './');
// 读取 .gensidebarignore 文件
const ignoreFile = path.join(__dirname, '.gensidebarignore');
const ignorePatterns = fs.existsSync(ignoreFile) ? fs.readFileSync(ignoreFile, 'utf8').split('\n') : [];

// 转换 ignorePatterns 为正则表达式
const ignoreRegexps = ignorePatterns.map(pattern => {
    const regex = pattern.replace(/\*/g, '.*').replace(/\//g, '\\/');
    return new RegExp(`^${regex}$`, 'i');
});

// 检查路径是否应该被忽略
function shouldIgnore(path, parentPath) {
    return ignoreRegexps.some(regex => regex.test(path) || regex.test(`${parentPath}/${path}`));
}

// 递归创建侧边栏内容的函数
function createSidebarContent(dir, parentPath = '') {
    let sidebarContent = '';

    fs.readdirSync(dir, { withFileTypes: true }).forEach(file => {
        if (file.isDirectory() && !shouldIgnore(file.name, parentPath)) {
            // 如果是目录且不是 img 文件夹，添加目录项
            const relativeDirPath = path.relative(docsDir, dir);
            const sidebarPath = parentPath ? `${parentPath}/${file.name}` : file.name;
            sidebarContent += `- [${file.name}](/${sidebarPath}/)\n`;

            // 递归调用以处理子目录
            const subSidebarContent = createSidebarContent(path.join(dir, file.name), sidebarPath);
            if (subSidebarContent) {
                sidebarContent += `  ${subSidebarContent}`;
            }
        } else if (file.isFile() && path.extname(file.name) === '.md'&& !shouldIgnore(file.name, parentPath)) {
            // 如果是 Markdown 文件，添加文件项
            const relativeFilePath = path.relative(docsDir, path.join(dir, file.name));
            const parentDirPath = path.dirname(relativeFilePath);
            const markdownLink = parentDirPath ? `${parentDirPath}/${file.name}` : file.name;
            sidebarContent += `  - [${path.basename(file.name, '.md')}](/${markdownLink})\n`;
        }
    });

    return sidebarContent;
}

// 创建统一的侧边栏文件
const sidebarContent = createSidebarContent(docsDir);
const sidebarFilePath = path.join(docsDir, '_sidebar.md');
fs.writeFileSync(sidebarFilePath, `# 前端面试总结\n\n${sidebarContent}`, 'utf8');

console.log('统一的侧边栏文件 _sidebar.md 已生成。');