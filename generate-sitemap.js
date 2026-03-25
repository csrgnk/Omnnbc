const fs = require('fs');
const path = require('path');

const domain = "https://omnnbc.com";
const postsPath = path.join(__dirname, 'data', 'posts.json');

try {
    const data = fs.readFileSync(postsPath, 'utf8');
    const posts = JSON.parse(data);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Home Page
    xml += `  <url>\n    <loc>${domain}/</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // 2. Clean URL Logic
    posts.forEach(post => {
        if (post.url) {
            // Removes 'posts/', 'pages/' and '.html'
            let cleanPath = post.url.replace(/^posts\//, '').replace(/^pages\//, '').replace('.html', '');
            
            // Final check to get only the last part of the URL
            if (cleanPath.includes('/')) { cleanPath = cleanPath.split('/').pop(); }

            const fullUrl = `${domain}/${cleanPath}`;
            const date = post.publish_date ? post.publish_date.split('T')[0] : new Date().toISOString().split('T')[0];

            xml += `  <url>\n    <loc>${fullUrl}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
        }
    });

    xml += `</urlset>`;
    fs.writeFileSync('./sitemap.xml', xml);
    console.log('Clean Sitemap.xml generated!');
} catch (err) {
    console.error('Error:', err.message);
}
