const fs = require('fs');
const path = require('path');

const domain = "https://omnnbc.com";
const rootDir = __dirname;

// Folders where your HTML files exist
const foldersToScan = ['posts', 'pages'];

// Convert filename → clean SEO URL
function getCleanUrl(file) {
    let name = file.replace('.html', '');

    // remove index (optional)
    if (name.toLowerCase() === 'index') return '';

    return name;
}

function getAllHtmlFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(getAllHtmlFiles(filePath));
        } else if (file.endsWith('.html')) {
            results.push(file);
        }
    });

    return results;
}

try {
    console.log('--- Generating CLEAN Sitemap for Google ---');

    let xml = [];
    const today = new Date().toISOString().split('T')[0];

    xml.push('<?xml version="1.0" encoding="UTF-8"?>');
    xml.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

    // Homepage
    xml.push(`
  <url>
    <loc>${domain}/</loc>
    <lastmod>${today}</lastmod>
    <priority>1.0</priority>
  </url>`);

    let allLinks = [];

    foldersToScan.forEach(folder => {
        const folderPath = path.join(rootDir, folder);

        if (fs.existsSync(folderPath)) {
            const files = getAllHtmlFiles(folderPath);

            files.forEach(file => {
                const slug = getCleanUrl(file);

                if (slug !== '') {
                    allLinks.push(`${domain}/${slug}`);
                }
            });
        }
    });

    // Remove duplicates
    allLinks = [...new Set(allLinks)];

    allLinks.forEach(link => {
        xml.push(`
  <url>
    <loc>${link}</loc>
    <lastmod>${today}</lastmod>
    <priority>0.8</priority>
  </url>`);
    });

    xml.push('</urlset>');

    fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), xml.join('\n'));

    console.log(`✅ SUCCESS: ${allLinks.length} URLs added (CLEAN URLs)`);

} catch (err) {
    console.error('❌ Error:', err.message);
}
