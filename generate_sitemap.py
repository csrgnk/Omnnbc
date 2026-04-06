import json
import os
from datetime import datetime

# --- Configuration ---
DOMAIN = "https://omnnbc.com"
POSTS_JSON = "data/posts.json"
PAGES_JSON = "data/pages.json"
OUTPUT_FILE = "sitemap.xml"

def get_today():
    return datetime.now().strftime("%Y-%m-%d")

def create_url_node(url, date, priority="0.8"):
    """Helper to create XML URL nodes"""
    return (
        "  <url>\n"
        f"    <loc>{url}</loc>\n"
        f"    <lastmod>{date}</lastmod>\n"
        f"    <priority>{priority}</priority>\n"
        "  </url>"
    )

def generate():
    print(f"🚀 Starting Sitemap Generation for {len(POSTS_JSON)} structure...")
    
    # Start XML Header
    xml_content = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]

    # 1. Add Home Page (Highest Priority)
    xml_content.append(create_url_node(f"{DOMAIN}/", get_today(), "1.0"))

    # 2. Process Posts from JSON
    if os.path.exists(POSTS_JSON):
        with open(POSTS_JSON, 'r', encoding='utf-8') as f:
            posts = json.load(f)
            for post in posts:
                slug = post.get('url', '').strip("/")
                
                # CRITICAL: Append .html to bypass the 404 router for Google
                if not slug.endswith('.html'):
                    # If your files are in a 'posts' folder:
                    full_url = f"{DOMAIN}/posts/{slug}.html"
                else:
                    full_url = f"{DOMAIN}/{slug}"

                # Handle Date
                raw_date = post.get('publish_date', get_today())
                clean_date = raw_date[:10] # Ensure YYYY-MM-DD format

                xml_content.append(create_url_node(full_url, clean_date))
        print(f"✅ Added {len(posts)} devotional posts.")

    # 3. Process Pages from JSON (Optional)
    if os.path.exists(PAGES_JSON):
        with open(PAGES_JSON, 'r', encoding='utf-8') as f:
            pages = json.load(f)
            for page in pages:
                p_slug = page.get('url', '').strip("/")
                p_url = f"{DOMAIN}/{p_slug}.html"
                xml_content.append(create_url_node(p_url, get_today(), "0.5"))

    # Close XML
    xml_content.append('</urlset>')

    # Write to File
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(xml_content))
    
    print(f"✨ Success: {OUTPUT_FILE} created in root directory.")

if __name__ == "__main__":
    generate()
