const fs = require('fs');
const path = require('path');

const domain = "https://omnnbc.com";
const rootDir = __dirname;

// Folders to scan for your .html files
const targetFolders = ['posts', 'pages'];

function getCleanUrls(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            results = results.concat(getCleanUrls(filePath));
        } else if (file.endsWith('.html')) {
            // MAGIC STEP: Remove .html and remove the folder name for Search Console
            const cleanSlug = file.replace('.html', '');
            if (cleanSlug !== 'index') {
                results.push(`${domain}/${cleanSlug}`);
            }
        }
    });
    return results;
}

try {
    console.log('Generating Clean Sitemap for Search Console...');
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Add Home Page
    xml += `  <url>\n    <loc>${domain}/</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <priority>1.0</priority>\n  </url>\n`;

    // 2. Scan all folders and add clean URLs
    let allLinks = [];
    targetFolders.forEach(folder => {
        const folderPath = path.join(rootDir, folder);
        allLinks = allLinks.concat(getCleanUrls(folderPath));
    });

    // Remove any duplicates and write to XML
    [...new Set(allLinks)].forEach(link => {
        xml += `  <url>\n    <loc>${link}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    // Save as sitemap.xml in the main folder
    fs.writeFileSync('./sitemap.xml', xml);
    console.log(`SUCCESS: Created sitemap.xml with ${allLinks.length} clean links.`);
} catch (err) {
    console.error('Error:', err.message);
}
