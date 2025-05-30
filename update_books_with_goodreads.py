import json
import uuid
import time
from googlesearch import search # type: ignore

def find_goodreads_link(title: str, author: str) -> str | None:
    """
    Searches Google for the Goodreads link of a book.

    Args:
        title: The title of the book.
        author: The author of the book.

    Returns:
        The Goodreads URL, or None if not found.
    """
    query = f"goodreads {title} {author}"
    print(f"Searching for: {query}")
    try:
        # Adding a small delay to avoid overwhelming Google search
        time.sleep(2)
        for url in search(query, num=5, lang="en"):
            if "goodreads.com/book/show/" in url:
                print(f"Found: {url}")
                return url
    except Exception as e:
        print(f"An error occurred during search: {e}")
    print("Goodreads link not found.")
    return None

def update_books_with_goodreads_links(file_path: str) -> None:
    """
    Reads a JSON file of books, finds Goodreads links for each,
    and updates the JSON file.

    Args:
        file_path: The path to the JSON file.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            books_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {file_path}")
        return

    if not isinstance(books_data, list):
        print(f"Error: Expected a list of books in {file_path}, but got {type(books_data)}")
        return

    updated_count = 0
    for i, book in enumerate(books_data):
        # Generate a unique ID for logging or future use, as requested
        book_processing_id = uuid.uuid4()
        print(f"\\nProcessing book {i+1}/{len(books_data)} (ID: {book_processing_id})")

        if not isinstance(book, dict):
            print(f"Skipping item at index {i} as it's not a dictionary.")
            continue

        title = book.get("title")
        author = book.get("author")

        if not title or not author:
            print(f"Skipping book due to missing title or author: {book}")
            continue

        # Ensure 'links' key exists and is a dictionary
        if "links" not in book:
            book["links"] = {}
        elif not isinstance(book["links"], dict):
            print(f"Warning: 'links' for '{title}' is not a dictionary. Re-initializing.")
            book["links"] = {}
        
        if "goodreads" in book["links"] and book["links"]["goodreads"]:
            print(f"Goodreads link already exists for '{title}': {book['links']['goodreads']}")
            continue

        goodreads_url = find_goodreads_link(title, author)
        if goodreads_url:
            book["links"]["goodreads"] = goodreads_url
            updated_count += 1
        
        # Add a trailing comma to the links dictionary if it's not empty
        # This is a bit tricky to do directly when serializing to JSON with standard library,
        # as json.dump doesn't offer this specific formatting.
        # However, the structure itself will be valid.
        # Python dictionaries inherently don't store "trailing commas" - it's a source code styling.

    print(f"\\nFinished processing. Updated {updated_count} books with Goodreads links.")

    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(books_data, f, indent=2, ensure_ascii=False)
        print(f"Successfully updated {file_path}")
    except IOError:
        print(f"Error: Could not write updates to {file_path}")

if __name__ == "__main__":
    # Generate a unique ID for this script run
    run_id = uuid.uuid4()
    print(f"Starting script run ID: {run_id}")
    update_books_with_goodreads_links("data/books.json")
    print(f"Script run ID {run_id} finished.")
