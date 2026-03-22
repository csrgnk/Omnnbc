import json
import os
from datetime import datetime

# Configuration
BASE_URL = "https://omnnbc.com/"
POSTS_JSON = "data/posts.json"
PAGES_JSON = "data/pages.json"
OUTPUT_POSTS_XML = "sitemap-posts.xml"
OUTPUT_PAGES_XML = "sitemap-pages.xml"

def create_xml_sitemap(json_path, output_path, is_post=True):
    if not os.path.exists(json_path):
        print(f"Skipping: {json_path} not found.")
        return

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        xml_lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        ]

        for item in data:
            url_slug = item.get('url', '').strip("/")
            # Ensure .html extension if not present
            if url_slug and not url_slug.endswith('.html'):
                url_slug += ".html"
            
            full_url = f"{BASE_URL}{url_slug}"
            
            # Format date: Use publish_date or current date if missing
            raw_date = item.get('publish_date', datetime.now().strftime('%Y-%m-%d'))
            clean_date = raw_date[:10] # Extracts YYYY-MM-DD

            priority = "0.8" if is_post else "1.0"
            changefreq = "weekly" if is_post else "daily"

            xml_lines.append('  <url>')
            xml_lines.append(f'    <loc>{full_url}</loc>')
            xml_lines.append(f'    <lastmod>{clean_date}</lastmod>')
            xml_lines.append(f'    <changefreq>{changefreq}</changefreq>')
            xml_lines.append(f'    <priority>{priority}</priority>')
            xml_lines.append('  </url>')

        xml_lines.append('</urlset>')

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(xml_lines))
        
        print(f"Successfully generated {output_path} with {len(data)} entries.")

    except Exception as e:
        print(f"Error processing {json_path}: {e}")

if __name__ == "__main__":
    # Generate Sitemap for Posts
    create_xml_sitemap(POSTS_JSON, OUTPUT_POSTS_XML, is_post=True)
    
    # Generate Sitemap for Pages (if pages.json exists)
    create_xml_sitemap(PAGES_JSON, OUTPUT_PAGES_XML, is_post=False)
