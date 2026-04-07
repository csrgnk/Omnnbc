const fs = require('fs');
const path = require('path');

const DOMAIN = "https://omnnbc.com";
const postsDir = path.join(__dirname, 'posts');

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// 1. Home Page
xml += `  <url><loc>${DOMAIN}/</loc><priority>1.0</priority></url>\n`;

// 2. Add Posts from Folder (Without .html and Without /posts/)
if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir);
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const cleanName = file.replace('.html', '');
            xml += `  <url><loc>${DOMAIN}/${cleanName}</loc><priority>0.8</priority></url>\n`;
        }
    });
}

xml += `</urlset>`;
fs.writeFileSync('sitemap.xml', xml);
console.log("Sitemap created successfully!");
