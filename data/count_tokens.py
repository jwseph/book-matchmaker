import json
import os
import tiktoken # Ensure tiktoken is installed: pip install tiktoken

# --- Configuration ---
# Choose the model for which you want to count tokens (same as in your Next.js API)
MODEL_NAME = "gpt-4.1" 
# Path to your books.json file
BOOKS_JSON_PATH = "data/books.json" 

# Sample quiz data (mimicking the structure of QuizQuestion and answers)
# You might want to make this more dynamic or representative of typical inputs
SAMPLE_QUESTIONS = [
    {
        "id": "social_level", "type": "mcq", 
        "question": "Are you a social person?",
        "options": ["Very social", "Somewhat social", "Mostly introverted", "Prefer solitude"],
    },
    {
        "id": "writing_style_importance", "type": "mcq",
        "question": "How important is the writing style to you?",
        "options": ["Very important", "Somewhat important", "Not important", "Simple writing"],
    },
    {
        "id": "favorite_book", "type": "frq",
        "question": "What is the name of your favorite book?",
    },
    {
        "id": "enjoy_themes", "type": "frq",
        "question": "What themes or topics do you most enjoy exploring in books?",
    },
]

SAMPLE_ANSWERS = {
    "social_level": "Somewhat social",
    "writing_style_importance": "Very important",
    "favorite_book": "To Kill a Mockingbird",
    "enjoy_themes": "Justice, empathy, and historical fiction",
}
# --- End Configuration ---

def format_student_responses_for_prompt(questions, answers):
    lines = []
    for q in questions:
        answer = answers.get(q["id"])
        if answer is None:
            continue
        answer_text = ", ".join(answer) if isinstance(answer, list) else answer
        question_type = q["type"].upper()
        lines.append(f"Question ({question_type}): {q['question']}\\nAnswer: {answer_text}")
    return "\\n\\n".join(lines)

def construct_prompt(formatted_responses, book_list_json_str):
    # This prompt should mirror the structure of `selectionPrompt` in your route.ts
    prompt_text = f"""You are a highly knowledgeable and insightful book recommendation system.
Your goal is to help a student discover books they will genuinely enjoy and also suggest some books that might broaden their literary horizons, based on their survey responses.
Your audience is US 9th graders in Honors English class.

Here are the student's responses to a survey about their reading preferences:
--- START STUDENT RESPONSES ---
{formatted_responses}
--- END STUDENT RESPONSES ---

Here is a list of available books you can recommend from. Each book is a string in the format "TITLE by AUTHOR":
--- START AVAILABLE BOOKS ---
{book_list_json_str}
--- END AVAILABLE BOOKS ---

Based on all the information, please provide book recommendations.
Recommendation tips:
- Listen closely to FRQ answers. They mean more to students than MCQ responses.
- Don't recommend a book that the student has already read.
- You don't need to follow all preferences in each suggestion.
- For variation in your recommendations, prefer fully following subsets of preferences.
- Be bold! in "differentTaste" recommendations.

You MUST respond with a JSON object. The JSON object must have exactly two top-level keys: "likelyToEnjoy" and "differentTaste".
Each of these keys must correspond to an array of book recommendation objects.
Each book recommendation object in these arrays MUST have ONLY the following key:
1.  "bookString": string - The exact "TITLE by AUTHOR" string of the book selected from the provided "AVAILABLE BOOKS" list.

Do NOT include a "reasoning" key in this response.
Provide up to 10 books for "likelyToEnjoy", ranked in order of most likely enjoyment.
Provide up to 10 books for "differentTaste", also ranked.
Do not include any books in your response that are not in the "AVAILABLE BOOKS" list.
Ensure the "bookString" field in your response exactly matches one of the entries in the "AVAILABLE BOOKS" list.
Do not add any extra text or explanation outside of the JSON object.
Your entire response should be a single, valid JSON object."""
    return prompt_text.strip()

def count_tokens_for_prompt(prompt_text, model_name):
    try:
        encoding = tiktoken.encoding_for_model(model_name)
    except KeyError:
        print(f"Warning: Model {model_name} not found. Using cl100k_base encoding as a fallback.")
        encoding = tiktoken.get_encoding("cl100k_base")
    
    tokens = encoding.encode(prompt_text)
    return len(tokens)

def main():
    # Load books data
    try:
        # Ensure the path is relative to the script's directory if needed, or use absolute.
        # For simplicity, assuming it's run from a location where 'data/books.json' is accessible.
        script_dir = os.path.dirname(__file__) # Gets the directory where the script is located.
        books_file_path = os.path.join(script_dir, BOOKS_JSON_PATH) 
        if not os.path.exists(books_file_path): # Corrected path for script location
             # If script is in /data, and BOOKS_JSON_PATH is "data/books.json", this will be wrong.
             # Assuming BOOKS_JSON_PATH is relative to project root, and script is in data/
             project_root = os.path.dirname(script_dir) # one level up from /data
             books_file_path = os.path.join(project_root, BOOKS_JSON_PATH)


        with open(books_file_path, 'r', encoding='utf-8') as f:
            all_books_data = json.load(f)
        if not isinstance(all_books_data, list):
            print(f"Error: Expected a list of books in {books_file_path}, got {type(all_books_data)}")
            return
        book_list_for_openai = [f"{book.get('title', 'Unknown Title')} by {book.get('author', 'Unknown Author')}" for book in all_books_data]
        book_list_json_str = json.dumps(book_list_for_openai)
    except FileNotFoundError:
        print(f"Error: {books_file_path} not found. Please ensure the path is correct and the script is run from the project root or adjust path logic.")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {books_file_path}.")
        return
    except Exception as e:
        print(f"An unexpected error occurred while loading books: {e}")
        return

    # Format student responses
    formatted_responses = format_student_responses_for_prompt(SAMPLE_QUESTIONS, SAMPLE_ANSWERS)
    
    # Construct the full prompt
    full_prompt = construct_prompt(formatted_responses, book_list_json_str)
    
    # Count tokens
    num_tokens = count_tokens_for_prompt(full_prompt, MODEL_NAME)
    
    print(f"--- Prompt for {MODEL_NAME} (Book Selection) ---")
    # print(full_prompt) # Uncomment to see the full prompt
    print("\\n-----------------------------------------------------")
    print(f"Estimated number of tokens for the selection prompt: {num_tokens}")
    print("-----------------------------------------------------")
    print("Details:")
    print(f"  - Number of books in list: {len(book_list_for_openai)}")
    print(f"  - Length of formatted student responses string: {len(formatted_responses)} characters")
    print(f"  - Length of book list JSON string: {len(book_list_json_str)} characters")
    print(f"  - Total prompt length: {len(full_prompt)} characters")
    print("\\nNote: This is an estimate. Actual token count can vary slightly.")

if __name__ == "__main__":
    main() 