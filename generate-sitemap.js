const fs = require('fs');
const path = require('path');

const domain = "https://omnnbc.com";
const rootDir = __dirname;

// The folders containing your physical .html files
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
            // This logic creates the WORKING URL:
            // Example: https://omnnbc.com/posts/hanuman-chalisa.html
            if (file.toLowerCase() !== 'index.html') {
                results.push(`${domain}/${folderName}/${file}`);
            }
        }
    });
    return results;
}

try {
    console.log('--- Generating Working Sitemap for Search Console ---');
    
    let xmlLines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <url>',
        `    <loc>${domain}/</loc>`,
        `    <lastmod>${new Date().toISOString()}</lastmod>`,
        '    <priority>1.0</priority>',
        '  </url>'
    ];

    let allLinks = [];

    // Scan each folder and keep the folder name and .html extension
    foldersToScan.forEach(folder => {
        const folderPath = path.join(rootDir, folder);
        if (fs.existsSync(folderPath)) {
            const links = getAllHtmlFiles(folderPath, folder);
            allLinks = allLinks.concat(links);
        }
    });

    // Add unique working URLs to XML
    [...new Set(allLinks)].forEach(link => {
        xmlLines.push('  <url>');
        xmlLines.push(`    <loc>${link}</loc>`);
        xmlLines.push(`    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`);
        xmlLines.push('    <priority>0.8</priority>');
        xmlLines.push('  </url>');
    });

    xmlLines.push('</urlset>');

    // Write to the root sitemap.xml
    fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), xmlLines.join('\n'));
    
    console.log(`SUCCESS: Found ${allLinks.length} working files.`);

} catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
}
