const fs = require('fs');
const path = require('path');

const domain = "https://omnnbc.com";
const rootDir = __dirname;

// The folders containing your physical .html files
const foldersToScan = ['posts', 'pages'];

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
            // This logic cleans the URL:
            // 1. Removes .html
            // 2. Removes the folder prefix (posts/ or pages/)
            // Result: https://omnnbc.com/your-post-title
            const slug = file.replace('.html', '');
            
            // Skip 'index' files as they represent the root or folder home
            if (slug.toLowerCase() !== 'index') {
                results.push(`${domain}/${slug}`);
            }
        }
    });
    return results;
}

try {
    console.log('--- Starting Automated Clean Sitemap Generation ---');
    
    // 1. Initialize XML structure with Home Page
    let xmlLines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <url>',
        `    <loc>${domain}/</loc>`,
        `    <lastmod>${new Date().toISOString()}</lastmod>`,
        '    <priority>1.0</priority>',
        '  </url>'
    ];

    let allDiscoveredUrls = [];

    // 2. Scan each target folder
    foldersToScan.forEach(folder => {
        const folderPath = path.join(rootDir, folder);
        if (fs.existsSync(folderPath)) {
            console.log(`Scanning folder: ${folder}...`);
            const links = getAllHtmlFiles(folderPath);
            allDiscoveredUrls = allDiscoveredUrls.concat(links);
        }
    });

    // 3. Remove duplicates and add to XML lines
    const uniqueUrls = [...new Set(allDiscoveredUrls)];
    uniqueUrls.forEach(url => {
        xmlLines.push('  <url>');
        xmlLines.push(`    <loc>${url}</loc>`);
        xmlLines.push(`    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`);
        xmlLines.push('    <priority>0.8</priority>');
        xmlLines.push('  </url>');
    });

    // 4. Close XML tag
    xmlLines.push('</urlset>');

    // 5. Write the final file to the root directory
    const finalXml = xmlLines.join('\n');
    fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), finalXml);
    
    console.log(`--- SUCCESS ---`);
    console.log(`Total Clean URLs generated: ${uniqueUrls.length}`);
    console.log(`File saved at: ${path.join(rootDir, 'sitemap.xml')}`);

} catch (err) {
    console.error('--- ERROR GENERATING SITEMAP ---');
    console.error(err.message);
    process.exit(1);
}
