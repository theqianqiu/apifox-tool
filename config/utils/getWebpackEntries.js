const fs = require('fs');
const path = require('path');

/**
 *
 * @param root {string}
 * @returns {string[]}
 */
const getHTMLFiles = (root) => {
    /**
     * @type {string[]}
     */
    const result = [];
    /**
     *
     * @param file {string}
     */
    const getFile = (file) => {
        if (fs.statSync(file).isDirectory()) {
            const children = fs.readdirSync(file);
            children.forEach((item) => {
                getFile(path.join(file, item));
            });
            return;
        }

        if (path.extname(file) === '.html') {
            result.push(file);
        }
    };
    getFile(root);
    return result;
};

const entryExtensions = ['.js', '.ts', '.jsx', '.tsx'];
/**
 *
 * @param htmlFile {string}
 * @returns {string}
 */
const getEntryByHTMLFile = (htmlFile) => {
    let result = '';
    entryExtensions.some((ext) => {
        const file = htmlFile.replace('.html', ext);
        if (fs.existsSync(file)) {
            result = file;
            return true;
        }
        return false;
    });
    return result;
};

/**
 *
 * @param rootPath {string}
 * @returns {{entry: string, entryName: string, html: string}[]}
 */
const getWebpackEntries = (rootPath) => {
    const files = getHTMLFiles(rootPath);
    return files.map((file) => ({
        entryName: path.relative(rootPath, file).replace('.html', ''),
        entry: getEntryByHTMLFile(file),
        html: file,
    }));
};

module.exports = { getWebpackEntries };
