const fs = require('fs');
const path = require('path');

const domain = "https://omnnbc.com";
// Ensure the script looks into the 'data' folder for posts.json
const postsPath = path.join(__dirname, 'data', 'posts.json');

try {
    console.log("Reading posts.json from:", postsPath);
    const data = fs.readFileSync(postsPath, 'utf8');
    const posts = JSON.parse(data);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Add Home Page
    xml += `  <url>\n    <loc>${domain}/</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // 2. Process all posts to create Clean URLs
    posts.forEach(post => {
        if (post.url) {
            // Remove "posts/", "pages/" and ".html" from the URL path
            let cleanPath = post.url.replace(/^posts\//, '')
                                    .replace(/^pages\//, '')
                                    .replace('.html', '');
            
            const fullUrl = `${domain}/${cleanPath}`;
            
            // Format date to YYYY-MM-DD
            const date = post.publish_date ? post.publish_date.split('T')[0] : new Date().toISOString().split('T')[0];

            xml += `  <url>\n    <loc>${fullUrl}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
        }
    });

    xml += `</urlset>`;

    // Save the final file as sitemap.xml in the root folder
    fs.writeFileSync('sitemap.xml', xml);
    console.log('SUCCESS: Sitemap.xml generated with Clean URLs (No folders, No .html)!');

} catch (err) {
    console.error('ERROR during sitemap generation:', err.message);
}
