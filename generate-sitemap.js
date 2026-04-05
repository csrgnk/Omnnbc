const fs = require('fs');
const path = require('path');

const domain = "https://omnnbc.com";
const postsPath = path.join(__dirname, 'data', 'posts.json');
const pagesDir = path.join(__dirname, 'pages');

try {
    console.log('Generating Sitemap for Omnnbc...');
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Home Page
    xml += `  <url>\n    <loc>${domain}/</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // 2. Static Pages
    if (fs.existsSync(pagesDir)) {
        const files = fs.readdirSync(pagesDir);
        files.forEach(file => {
            if (file.endsWith('.html')) {
                const pageName = file.replace('.html', '');
                xml += `  <url>\n    <loc>${domain}/${pageName}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
            }
        });
    }

    // 3. 360+ Posts from posts.json
    if (fs.existsSync(postsPath)) {
        const data = fs.readFileSync(postsPath, 'utf8');
        const posts = JSON.parse(data);
        posts.forEach(post => {
            if (post.url) {
                let cleanPath = post.url.replace(/^posts\//, '').replace(/^pages\//, '').replace('.html', '');
                if (cleanPath.includes('/')) { cleanPath = cleanPath.split('/').pop(); }

                const fullUrl = `${domain}/${cleanPath}`;
                const date = post.publish_date ? post.publish_date.split('T')[0] : new Date().toISOString().split('T')[0];

                xml += `  <url>\n    <loc>${fullUrl}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
            }
        });
    }

    xml += `</urlset>`;
    fs.writeFileSync('./sitemap.xml', xml);
    console.log('SUCCESS: sitemap.xml updated for GitHub Pages!');
} catch (err) {
    console.error('ERROR:', err.message);
}
