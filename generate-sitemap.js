const fs = require('fs');
const path = require('path');

const domain = "https://omnnbc.com";
const rootDir = __dirname;

// Folders to scan
const folders = ['posts', 'pages'];

function scanFolders(dir, folderName) {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat && stat.isDirectory()) {
            results = results.concat(scanFolders(filePath, folderName));
        } else if (file.endsWith('.html')) {
            // REMOVE .html and REMOVE folder name for Clean URL
            const slug = file.replace('.html', '');
            if (slug !== 'index') {
                results.push(`${domain}/${slug}`);
            }
        }
    });
    return results;
}

try {
    console.log('Starting Clean URL Scan...');
    let xmlLines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <url>',
        `    <loc>${domain}/</loc>`,
        `    <lastmod>${new Date().toISOString()}</lastmod>`,
        '    <priority>1.0</priority>',
        '  </url>'
    ];

    let allUrls = [];

    // Scan each folder but generate clean top-level URLs
    folders.forEach(f => {
        const folderPath = path.join(rootDir, f);
        const discovered = scanFolders(folderPath, f);
        allUrls = allUrls.concat(discovered);
    });

    // Add unique clean URLs to XML
    [...new Set(allUrls)].forEach(url => {
        xmlLines.push('  <url>');
        xmlLines.push(`    <loc>${url}</loc>`);
        xmlLines.push(`    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`);
        xmlLines.push('    <priority>0.8</priority>');
        xmlLines.push('  </url>');
    });

    xmlLines.push('</urlset>');

    fs.writeFileSync('./sitemap.xml', xmlLines.join('\n'));
    console.log(`SUCCESS: Generated sitemap with ${allUrls.length} clean URLs.`);
} catch (err) {
    console.error('Error:', err.message);
}
