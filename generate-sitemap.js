const fs = require('fs');
const path = require('path');

const domain = "https://omnnbc.com";
const rootDir = __dirname;

// Folders to scan automatically
const foldersToScan = ['posts', 'pages']; 

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.html')) {
                // Create the clean URL path
                let relativePath = path.join(dirPath, file).replace(rootDir, '').replace(/\\/g, '/');
                if (relativePath.startsWith('/')) relativePath = relativePath.substring(1);
                
                // Remove .html for clean URLs
                let urlPath = relativePath.replace('.html', '');
                // If it's index, it's just the folder path
                if (urlPath.endsWith('index')) urlPath = urlPath.replace('index', '');

                arrayOfFiles.push(`${domain}/${urlPath}`);
            }
        }
    });

    return arrayOfFiles;
}

try {
    console.log('Starting automatic folder scan...');
    let allUrls = [`${domain}/`]; // Start with Home Page

    // 1. Scan specific folders automatically
    foldersToScan.forEach(folder => {
        const folderPath = path.join(rootDir, folder);
        if (fs.existsSync(folderPath)) {
            console.log(`Scanning folder: ${folder}`);
            const folderFiles = getAllFiles(folderPath);
            allUrls = allUrls.concat(folderFiles);
        }
    });

    // 2. Scan root directory for any top-level HTML files (like about.html)
    const rootFiles = fs.readdirSync(rootDir);
    rootFiles.forEach(file => {
        if (file.endsWith('.html') && !['index.html', 'sitemap-tool.html'].includes(file)) {
            allUrls.push(`${domain}/${file.replace('.html', '')}`);
        }
    });

    // 3. Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Remove duplicates and generate XML tags
    const uniqueUrls = [...new Set(allUrls)];
    uniqueUrls.forEach(url => {
        xml += `  <url>\n    <loc>${url}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>\n`;
    });

    xml += `</urlset>`;

    fs.writeFileSync('./sitemap.xml', xml);
    console.log(`SUCCESS: Found ${uniqueUrls.length} links automatically. sitemap.xml updated.`);

} catch (err) {
    console.error('Scan Error:', err.message);
}
