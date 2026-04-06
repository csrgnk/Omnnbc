const fs = require('fs');
const path = require('path');

const domain = "https://omnnbc.com";
const rootDir = __dirname;
const foldersToScan = ['posts', 'pages'];

/**
 * Scans folders and returns file data including real creation dates
 */
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
            // Skips index.html to prevent duplicate home links
            if (file.toLowerCase() !== 'index.html') {
                // Extracts the actual creation date (YYYY-MM-DD)
                const fileDate = (stat.birthtime || stat.mtime).toISOString().split('T')[0];
                
                results.push({
                    url: `${domain}/${folderName}/${file}`,
                    date: fileDate
                });
            }
        }
    });
    return results;
}

try {
    console.log('--- Generating Sitemap with Original Dates & Full Paths ---');
    
    let xml = [];
    xml.push('<?xml version="1.0" encoding="UTF-8"?>');
    xml.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

    // 1. Add Home Page (Uses current date)
    const today = new Date().toISOString().split('T')[0];
    xml.push('  <url>');
    xml.push(`    <loc>${domain}/</loc>`);
    xml.push(`    <lastmod>${today}</lastmod>`);
    xml.push('    <priority>1.0</priority>');
    xml.push('  </url>');

    // 2. Scan Target Folders (posts & pages)
    let allEntries = [];
    foldersToScan.forEach(folder => {
        const folderPath = path.join(rootDir, folder);
        if (fs.existsSync(folderPath)) {
            console.log(`Processing folder: ${folder}`);
            allEntries = allEntries.concat(getFileData(folderPath, folder));
        }
    });

    // 3. Add entries to XML
    allEntries.forEach(entry => {
        xml.push('  <url>');
        xmlLines = `    <loc>${entry.url}</loc>`; // This ensures the link is /posts/name.html
        xml.push(xmlLines);
        xml.push(`    <lastmod>${entry.date}</lastmod>`);
        xml.push('    <priority>0.8</priority>');
        xml.push('  </url>');
    });

    xml.push('</urlset>');

    // 4. Save sitemap.xml to the root directory
    fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), xml.join('\n'));
    
    console.log(`✅ SUCCESS: Created sitemap.xml with ${allEntries.length} unique URLs.`);

} catch (err) {
    console.error('❌ Error generating sitemap:', err.message);
    process.exit(1);
}
