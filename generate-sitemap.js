const fs = require('fs');
const path = require('path');

const domain = "https://omnnbc.com";
// Ensure your posts.json is in 'data' folder
const postsPath = path.join(__dirname, 'data', 'posts.json');

try {
    const data = fs.readFileSync(postsPath, 'utf8');
    const posts = JSON.parse(data);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Add Home Page
    xml += `  <url>\n    <loc>${domain}/</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // 2. Process Posts
    posts.forEach(post => {
        if (post.url) {
            // Clean URL: Remove 'posts/', 'pages/' and '.html'
            let cleanUrl = post.url.replace(/^posts\//, '')
                                   .replace(/^pages\//, '')
                                   .replace('.html', '');
            
            const fullUrl = `${domain}/${cleanUrl}`;
            // Use post date or current date
            const date = post.publish_date || new Date().toISOString();

            xml += `  <url>\n    <loc>${fullUrl}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
        }
    });

    xml += `</urlset>`;

    // Save as sitemap.xml
    fs.writeFileSync('sitemap.xml', xml);
    console.log('Sitemap.xml generated with Clean URLs!');

} catch (err) {
    console.error('Error during sitemap generation:', err);
}
