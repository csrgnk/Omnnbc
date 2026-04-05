const fs = require('fs');
const path = require('path');

const domain = "https://omnnbc.com";
// Ensure these paths match your GitHub repository structure
const postsPath = path.join(__dirname, 'data', 'posts.json');
const pagesDir = path.join(__dirname, 'pages');

// Vercel serves static files from the 'public' directory
const outputDir = path.join(__dirname, 'public');

try {
    console.log('Starting Sitemap Generation...');
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Add Home Page
    xml += `  <url>\n    <loc>${domain}/</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // 2. Auto-detect Static HTML Pages from "pages" folder
    if (fs.existsSync(pagesDir)) {
        const files = fs.readdirSync(pagesDir);
        files.forEach(file => {
            if (file.endsWith('.html')) {
                const pageName = file.replace('.html', '');
                xml += `  <url>\n    <loc>${domain}/${pageName}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
            }
        });
    } else {
        console.warn('Warning: pages directory not found at', pagesDir);
    }

    // 3. Add Dynamic Posts from posts.json
    if (fs.existsSync(postsPath)) {
        const data = fs.readFileSync(postsPath, 'utf8');
        const posts = JSON.parse(data);
        posts.forEach(post => {
            if (post.url) {
                // Clean URL path by removing folders and extensions
                let cleanPath = post.url.replace(/^posts\//, '').replace(/^pages\//, '').replace('.html', '');
                if (cleanPath.includes('/')) { cleanPath = cleanPath.split('/').pop(); }

                const fullUrl = `${domain}/${cleanPath}`;
                const date = post.publish_date ? post.publish_date.split('T')[0] : new Date().toISOString().split('T')[0];

                xml += `  <url>\n    <loc>${fullUrl}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
            }
        });
    } else {
        console.warn('Warning: posts.json not found at', postsPath);
    }

    xml += `</urlset>`;

    // Create public directory if it does not exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write sitemap.xml into the public folder
    fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), xml);
    console.log('SUCCESS: Sitemap generated successfully in /public/sitemap.xml');

} catch (err) {
    console.error('ERROR during sitemap generation:', err.message);
                    }
                    
