const fs = require('fs');
const path = require('path');

const domain = "https://omnnbc.com";
const rootDir = __dirname;
const foldersToScan = ['posts', 'pages'];

function getFileData(dir, folderName) {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(getFileData(filePath, folderName));
        } else if (file.endsWith('.html')) {
            if (file.toLowerCase() !== 'index.html') {
                // Get the Last Modified Date from the file itself
                const lastMod = stat.mtime.toISOString().split('T')[0];
                
                // GitHub Pages requires the full folder and .html to avoid 404
                results.push({
                    url: `${domain}/${folderName}/${file}`,
                    date: lastMod
                });
            }
        }
    });
    return results;
}

try {
    console.log('Building GitHub Sitemap...');
    let xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        `  <url><loc>${domain}/</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><priority>1.0</priority></url>`
    ];

    foldersToScan.forEach(folder => {
        const folderPath = path.join(rootDir, folder);
        if (fs.existsSync(folderPath)) {
            getFileData(folderPath, folder).forEach(entry => {
                xml.push('  <url>');
                xml.push(`    <loc>${entry.url}</loc>`);
                xml.push(`    <lastmod>${entry.date}</lastmod>`);
                xml.push('    <priority>0.8</priority>');
                xml.push('  </url>');
            });
        }
    });

    xml.push('</urlset>');
    fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), xml.join('\n'));
    console.log('✅ Success: sitemap.xml created in root folder.');
} catch (err) {
    console.error('❌ Error:', err.message);
}
