import json
import os
from datetime import datetime

# Settings
DOMAIN = "https://omnnbc.com"
POSTS_JSON = "data/posts.json"
SITEMAP_FILE = "sitemap.xml"

def build_sitemap():
    # Start the XML structure
    xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]

    # 1. Add Home Page
    xml.append(f'  <url><loc>{DOMAIN}/</loc><lastmod>{datetime.now().strftime("%Y-%m-%d")}</lastmod><priority>1.0</priority></url>')

    # 2. Process all 175 posts
    if os.path.exists(POSTS_JSON):
        with open(POSTS_JSON, 'r', encoding='utf-8') as f:
            posts = json.load(f)
            for post in posts:
                url_slug = post.get('url', '').strip("/")
                
                # IMPORTANT: To avoid 404 in Search Console, 
                # link directly to the .html file in the posts folder
                if not url_slug.endswith('.html'):
                    clean_url = f"{DOMAIN}/posts/{url_slug}.html"
                else:
                    clean_url = f"{DOMAIN}/{url_slug}"

                # Get date from JSON or use today
                raw_date = post.get('publish_date', datetime.now().strftime('%Y-%m-%d'))
                date_only = raw_date[:10]

                xml.append('  <url>')
                xml.append(f'    <loc>{clean_url}</loc>')
                xml.append(f'    <lastmod>{date_only}</lastmod>')
                xml.append('    <priority>0.8</priority>')
                xml.append('  </url>')

    xml.append('</urlset>')

    # Write the file
    with open(SITEMAP_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(xml))
    
    print(f"✅ Sitemap updated: {len(posts)} posts included.")

if __name__ == "__main__":
    build_sitemap()
