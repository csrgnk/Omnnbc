const fs = require('fs');
const path = require('path');

const domain = "https://omnnbc.com";
const rootDir = __dirname;

// Folders containing your physical HTML files
const foldersToScan = ['posts', 'pages'];

/**
 * Recursively find all HTML files in a directory
 * @param {string} dir - Directory to scan
 * @param {string} folderName - The parent folder name for the URL path
 */
function getAllHtmlFiles(dir, folderName) {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            // Recursive call for subdirectories
            results = results.concat(getAllHtmlFiles(filePath, folderName));
        } else if (file.endsWith('.html')) {
            // We skip index.html as the homepage is handled separately
            if (file.toLowerCase() !== 'index.html') {
                // IMPORTANT: We keep the folder and .html so GitHub Pages finds the file
                results.push(`${domain}/${folderName}/${file}`);
            }
        }
    });

    return results;
}

try {
    console.log('--- Starting Sitemap Generation (Full Path Version) ---');

    let xml = [];
    const today = new Date().toISOString().split('T')[0];

    // XML Header
    xml.push('<?xml version="1.0" encoding="UTF-8"?>');
    xml.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

    // 1. Add Homepage
    xml.push(`
  <url>
    <loc>${domain}/</loc>
    <lastmod>${today}</lastmod>
    <priority>1.0</priority>
  </url>`);

    let allLinks = [];

    // 2. Scan Target Folders
    foldersToScan.forEach(folder => {
        const folderPath = path.join(rootDir, folder);

        if (fs.existsSync(folderPath)) {
            console.log(`Scanning: ${folder}`);
            const links = getAllHtmlFiles(folderPath, folder);
            allLinks = allLinks.concat(links);
        }
    });

    // 3. Remove Duplicates and Add to XML
    const uniqueLinks = [...new Set(allLinks)];

    uniqueLinks.forEach(link => {
        xml.push(`
  <url>
    <loc>${link}</loc>
    <lastmod>${today}</lastmod>
    <priority>0.8</priority>
  </url>`);
    });

    // XML Footer
    xml.push('</urlset>');

    // 4. Write to sitemap.xml in the root directory
    fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), xml.join('\n'));

    console.log(`✅ SUCCESS: Created sitemap.xml with ${uniqueLinks.length} working URLs.`);

} catch (err) {
    console.error('❌ Error generating sitemap:', err.message);
    process.exit(1);
}
