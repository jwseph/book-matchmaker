import json
import re
import os

def parse_html_to_json(html_content):
    books = []
    
    # Regex to find each book item block, targeting <li> tags with "data-book" attribute
    # This regex tries to capture the content within each <li class="list-group-item book-list-item ..."> tag
    book_blocks = re.findall(r'<li class="list-group-item book-list-item.*?data-book="\d+"[^>]*>(.*?)</li>', html_content, re.DOTALL)
    
    for block_content in book_blocks:
        book = {}
        
        # Rank, Title, Author
        title_author_match = re.search(r'<h4>\s*(\d+)\.\s*<a data-turbo-frame="_top".*?href=".*?">(.*?)</a>\s*by\s*<a data-turbo-frame="_top".*?href=".*?">(.*?)</a>\s*</h4>', block_content, re.DOTALL)
        if title_author_match:
            book['rank'] = int(title_author_match.group(1).strip())
            book['title'] = title_author_match.group(2).strip().replace("&amp;", "&")
            book['author'] = title_author_match.group(3).strip().replace("&amp;", "&")
        else:
            # Fallback for slightly different title/author structure if observed
            title_author_match_alt = re.search(r'<h4>\s*(\d+)\.\s*<a.*?>(.*?)</a>\s*</h4>\s*.*?<a.*?>(.*?)</a>', block_content, re.DOTALL)
            if title_author_match_alt:
                 book['rank'] = int(title_author_match_alt.group(1).strip())
                 book['title'] = title_author_match_alt.group(2).strip().replace("&amp;", "&")
                 # Author might be found differently, this part may need adjustment if HTML varies
                 # For now, let's assume author is still captured somehow, or leave it blank if not found by primary regex
                 book['author'] = title_author_match_alt.group(3).strip().replace("&amp;", "&") if len(title_author_match_alt.groups()) > 2 else "Unknown Author"

            else:
                print(f"Skipping block due to missing title/author: {block_content[:200]}")
                continue # Skip if essential info (rank, title, author) is missing

        # Subtitle (Other Names)
        subtitle_match = re.search(r'<h5 class="small_sub_title">(.*?)</h5>', block_content, re.DOTALL)
        if subtitle_match:
            subtitle_text = subtitle_match.group(1).strip().replace("&amp;", "&")
            book['otherNames'] = subtitle_text # Directly assign the stripped string, will be empty if subtitle_text is empty
        else:
            book['otherNames'] = "" # Default to empty string if not found

        # Cover URL
        cover_match = re.search(r'<img.*?alt="Cover of \'(.*?)\' by .*?".*?src="(.*?)"', block_content, re.DOTALL)
        if cover_match:
            # Group 2 should be the src URL
            book['coverUrl'] = cover_match.group(2).strip()
        else:
            # Fallback if alt text format differs
            cover_match_alt = re.search(r'<img.*?src="(.*?)"', block_content, re.DOTALL)
            if cover_match_alt:
                book['coverUrl'] = cover_match_alt.group(1).strip()
            else:
                book['coverUrl'] = ""
                print(f"Could not find cover for: {book.get('title')}")


        # Description
        desc_match = re.search(r'<div class="float-start.*?</div>\s*<div>\s*<p>(.*?)</p>', block_content, re.DOTALL)
        if desc_match:
            description_text = desc_match.group(1).strip()
            description_text = re.sub(r'<[^>]+>', '', description_text) # Basic HTML tag removal
            description_text = description_text.replace("\\r", "").replace("\\n", " ").replace("&amp;", "&").strip()
            description_text = re.sub(r'\s{2,}', ' ', description_text) # Collapse multiple spaces
            book['description'] = description_text
        else:
            book['description'] = ""
            print(f"Could not find description for: {book.get('title')}")
            
        book['links'] = {}
        # Amazon Link
        amazon_match = re.search(r'<a class="purchase-link.*?href="(https?://www.amazon.com[^"]*?)"[^>]*>Amazon</a>', block_content, re.IGNORECASE)
        if amazon_match:
            book['links']['amazon'] = amazon_match.group(1).strip().replace("&amp;", "&")
        else:
            book['links']['amazon'] = ""

        # Bookshop.org Link
        bookshop_match = re.search(r'<a class="purchase-link.*?href="(https?://bookshop.org[^"]*?)"[^>]*>Bookshop\.org</a>', block_content, re.IGNORECASE)
        if bookshop_match:
            book['links']['bookshop'] = bookshop_match.group(1).strip().replace("&amp;", "&")
        else:
            book['links']['bookshop'] = ""
            
        books.append(book)
            
    return books

if __name__ == "__main__":
    html_file_path = os.path.join('data', 'thegreatestbooks.org.html')
    json_file_path = os.path.join('data', 'books.json')

    try:
        # Ensure the 'data' directory exists
        os.makedirs('data', exist_ok=True)

        if not os.path.exists(html_file_path):
            print(f"Error: HTML file not found at {html_file_path}")
            exit()

        with open(html_file_path, 'r', encoding='utf-8') as f:
            html_file_content = f.read()

        extracted_books_data = parse_html_to_json(html_file_content)
        
        with open(json_file_path, 'w', encoding='utf-8') as f:
            json.dump(extracted_books_data, f, indent=2, ensure_ascii=False)
            
        print(f"Successfully extracted {len(extracted_books_data)} books and saved to {json_file_path}")
        if not extracted_books_data:
            print("Warning: No books were extracted. Check the HTML structure and parsing logic.")

    except FileNotFoundError:
        print(f"Error: The file {html_file_path} was not found.")
    except Exception as e:
        print(f"An error occurred: {e}") 