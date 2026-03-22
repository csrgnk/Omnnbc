import json
import os
from datetime import datetime

# Configuration
BASE_URL = "https://omnnbc.com/"
CONFIG = [
    {"json": "data/posts.json", "xml": "sitemap-posts.xml", "priority": "0.8", "freq": "weekly"},
    {"json": "data/pages.json", "xml": "sitemap-pages.xml", "priority": "1.0", "freq": "daily"}
]

def generate():
    for entry in CONFIG:
        if not os.path.exists(entry["json"]):
            print(f"File not found: {entry['json']}")
            continue

        try:
            with open(entry["json"], 'r', encoding='utf-8') as f:
                data = json.load(f)

            xml_lines = [
                '<?xml version="1.0" encoding="UTF-8"?>',
                '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
            ]

            for item in data:
                url_slug = item.get('url', '').strip("/")
                # Add .html if it's missing (common for GitHub Pages)
                if url_slug and not url_slug.endswith('.html'):
                    url_slug += ".html"
                
                # Handle home page empty slug
                full_url = f"{BASE_URL}{url_slug}" if url_slug else BASE_URL
                
                # Date formatting
                raw_date = item.get('publish_date', datetime.now().strftime('%Y-%m-%d'))
                clean_date = raw_date[:10] 

                xml_lines.append('  <url>')
                xml_lines.append(f'    <loc>{full_url}</loc>')
                xml_lines.append(f'    <lastmod>{clean_date}</lastmod>')
                xml_lines.append(f'    <changefreq>{entry["freq"]}</changefreq>')
                xml_lines.append(f'    <priority>{entry["priority"]}</priority>')
                xml_lines.append('  </url>')

            xml_lines.append('</urlset>')

            with open(entry["xml"], 'w', encoding='utf-8') as f:
                f.write('\n'.join(xml_lines))
            print(f"Generated {entry['xml']} with {len(data)} entries.")

        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    generate()
                
