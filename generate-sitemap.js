const fs = require('fs');
const path = require('path');

const domain = "https://omnnbc.com";
const rootDir = __dirname;

// The physical folders on your GitHub
const foldersToScan = ['posts', 'pages'];

function getAllHtmlFiles(dir, folderName) {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(getAllHtmlFiles(filePath, folderName));
        } else if (file.endsWith('.html')) {
            // Skip index files to avoid duplication
            if (file.toLowerCase() !== 'index.html') {
                // Construct the URL exactly as GitHub Pages expects it
                // Format: domain/folder/filename.html
                results.push(`${domain}/${folderName}/${file}`);
            }
        }
    });
    return results;
}

try {
    console.log('--- Generating Full Path Sitemap ---');
    
    let xml = [];
    const today = new Date().toISOString().split('T')[0];

    xml.push('<?xml version="1.0" encoding="UTF-8"?>');
    xml.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

    // Add Homepage
    xml.push(`  <url>\n    <loc>${domain}/</loc>\n    <lastmod>${today}</lastmod>\n    <priority>1.0</priority>\n  </url>`);

    let allLinks = [];
    foldersToScan.forEach(folder => {
        const folderPath = path.join(rootDir, folder);
        if (fs.existsSync(folderPath)) {
            const links = getAllHtmlFiles(folderPath, folder);
            allLinks = allLinks.concat(links);
        }
    });

    [...new Set(allLinks)].forEach(link => {
        xml.push(`  <url>\n    <loc>${link}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>0.8</priority>\n  </url>`);
    });

    xml.push('</urlset>');
    fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), xml.join('\n'));
    
    console.log(`✅ Done: ${allLinks.length} files indexed.`);
} catch (err) {
    console.error('Error:', err.message);
}
