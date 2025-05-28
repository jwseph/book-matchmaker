import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { Book, QuizQuestion, BookRecommendation, OpenAIResponse } from '@/app/types';

// --- Prompt Logging Helper ---
const LOG_FILE_PATH = path.join(process.cwd(), 'logs', 'openai_prompts.log');

async function logPromptToFile(promptName: string, modelName: string, promptContent: string): Promise<void> {
  const logEntry = `
================================================================================
Timestamp: ${new Date().toISOString()}
Prompt Name: ${promptName}
Model: ${modelName}
--- START PROMPT ---
${promptContent}
--- END PROMPT ---
================================================================================
`;
  try {
    const logDir = path.dirname(LOG_FILE_PATH);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(LOG_FILE_PATH, logEntry);
    console.log(`[Debug] Logged prompt: ${promptName} to ${LOG_FILE_PATH}`);
  } catch (error) {
    console.error(`[Debug] Error writing prompt to log file ${LOG_FILE_PATH}:`, error);
  }
}
// --- End Prompt Logging Helper ---

// Ensure API key is available
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OpenAI API key is missing. Please set OPENAI_API_KEY in your .env.local file.');
  // Return a server error response if API key is missing during runtime
  // This check is primarily for build time, but good to have a runtime guard too.
}

const openai = new OpenAI({
  apiKey: apiKey || 'fallback-key-if-really-needed-for-some-reason', // Should rely on env variable
});

// Helper function to format student responses for the prompt
function formatStudentResponses(
  questions: QuizQuestion[],
  answers: Record<string, string | string[]>,
): string {
  return questions
    .map(q => {
      const answer = answers[q.id];
      if (answer === undefined) return null;
      const answerText = Array.isArray(answer) ? answer.join(', ') : answer;
      const questionType = q.type.toUpperCase(); // Get MCQ or FRQ
      return `Question (${questionType}): ${q.question}\\nAnswer: ${answerText}`;
    })
    .filter(Boolean)
    .join('\\n\\n');
}

// Helper function to shuffle an array (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]; // Create a shallow copy to avoid modifying the original
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Swap elements
  }
  return newArray;
}

interface BookForReasoning {
  title: string;
  author: string;
  description: string;
  bookString: string; // "TITLE by AUTHOR"
}

// New type for the result of fetchReasoningsForTab
interface ReasoningAPIResponse {
  overallStatement: string;
  bookReasonings: Record<string, string>;
}

// New helper function to fetch reasonings for an entire tab using gpt-4.1
async function fetchReasoningsForTab(
  studentResponsesText: string,
  booksForTab: BookForReasoning[],
  recommendationType: 'likelyToEnjoy' | 'differentTaste',
): Promise<ReasoningAPIResponse | undefined> {
  if (!apiKey) {
    console.error("[Debug] OpenAI API key is missing for fetchReasoningsForTab.");
    return undefined;
  }
  if (booksForTab.length === 0) {
    return { overallStatement: "", bookReasonings: {} };
  }

  console.log(`[Debug] fetchReasoningsForTab called for type: ${recommendationType} with ${booksForTab.length} books.`);

  const bookListForPrompt = booksForTab.map(b => {
    const descriptionSnippet = b.description.split(' ').slice(0, 35).join(' ') + (b.description.split(' ').length > 35 ? '...' : '');
    return `- "${b.title}" by ${b.author} (Key info: ${descriptionSnippet})`;
  }).join('\\\\n');

  let specificInstructions = '';
  let openingPhraseExample = '';
  if (recommendationType === 'likelyToEnjoy') {
    specificInstructions = `For each book, sell it to the student. Focus on specific, concrete nuggets from the book that align directly with their stated preferences or previous positive experiences mentioned in their survey responses. Frame each reasoning as "Why you'll love this book: [reasoning]".`;
    openingPhraseExample = "Why you'll love this book:";
  } else { // differentTaste
    specificInstructions = `For each book, highlight specific, concrete aspects that could offer a surprising new perspective, a unique learning opportunity, or an unexpected appeal that might challenge their current tastes positively. Frame each reasoning as "Why this book might surprise you: [reasoning]" or "Why you'll like this book more than you think: [reasoning]".`;
    openingPhraseExample = "Why this book might surprise you:";
  }

  // Updated tone and structure for the overall statement
  const overallStatementNarrativePrompt = recommendationType === 'likelyToEnjoy'
    ? "Based on your survey responses, your preferences appear to align with [ADAPTIVE SUMMARY OF PREFERENCES - e.g., intellectually stimulating narratives, perhaps with a focus on character-driven stories or specific thematic elements]. The following selections have been chosen with these aspects in mind."
    : "To help broaden your literary horizons, these selections, while resonating with some of your stated preferences such as [ADAPTIVE SUMMARY - e.g., engaging plots or familiar genres], also introduce new elements like [ADAPTIVE EXAMPLES - e.g., different narrative styles, thematic explorations, or genres] that you might find unexpectedly compelling.";

  const reasoningPrompt = `\\
A student provided the following survey responses about their reading preferences:
--- START STUDENT RESPONSES ---
${studentResponsesText}
--- END STUDENT RESPONSES ---

You are recommending a set of books for this student under the category: "${recommendationType === 'likelyToEnjoy' ? "Books You'll Likely Enjoy" : "Books to Expand Your Taste"}".
Your tone should be that of an insightful and engaging literary companion: knowledgeable, friendly, and subtly enthusiastic.

Your first task is to analyze the student's responses and identify a primary literary genre that best reflects their tastes. This should be a recognizable genre category. Examples include: "Classic Psychological Fiction," "Modern Dystopian Literature," "Character-Driven Historical Drama," "Fast-Paced Sci-Fi Adventure," or "Literary Fantasy with Complex World-Building."

Your second task is to generate an engaging overall narrative for this category. This narrative should incorporate the primary literary genre you just identified.
It should start with "**Primary Genre Focus: [Generated Primary Literary Genre]**."
Then, on a new line, continue with a paragraph that thoughtfully summarizes why this collection of books is being presented, using the following template and adapting it intelligently to the student's specific responses:
"${overallStatementNarrativePrompt}"

Next, for each book in the list below, your task is to provide a BRIEF (1-2 tight sentences, ABSOLUTE MAXIMUM 40 words per reasoning) and UNIQUE justification.
The student already has access to the full title, author, and general summary for each book. DO NOT repeat these elements in your reasoning.

Here are the books in this set:
${bookListForPrompt}

The primary goal for individual book reasonings is to make each distinct and compelling, helping the student differentiate effectively.
Focus on CONCRETE details, evocative questions, or intriguing specific aspects of each book. Avoid vague adjectives or generic themes.
Make the reasoning specific to *this student's* survey responses. Hook the reader with tone and specificity.

${specificInstructions}

IMPORTANT STYLE GUIDELINES (for individual book reasonings):
- Each reasoning MUST be unique to its book and distinct from others in this batch.
- Start each reasoning *directly* with the suggested framing phrase (e.g., "${openingPhraseExample} ...").
- Do NOT reiterate the book's title or author in the reasoning itself.
- Be succinct and impactful. Sacrifice generality for specificity.
- Ensure your reasoning for one book doesn't sound like it could apply to another book in the list.
- Aim to be an insightful guide for a 9th-grade Honors English student.
- Use rhetorical devices thoughtfully: rhetorical questions, parallelisms, anastrophe, etc.
- Maintain an engaging, knowledgeable, and subtly enthusiastic tone.
- What specific preferences in the student's responses led to this recommendation? As a student I want to know why you recommended this book!
- Remember: Listen closely to FRQ answers. They mean more to students than MCQ responses.

OUTPUT FORMAT:
You MUST respond with a single JSON object. This object must have exactly two top-level keys:
1. "overallStatement": string - This string must begin with "**Primary Genre Focus: [Generated Primary Literary Genre]**.", followed by a newline character (\\\\n), and then the longer narrative paragraph you generated.
2. "bookReasonings": object - This object should map each exact "TITLE by AUTHOR" string (from the input book list) to its unique, concrete reasoning string (max 40 words, following style guidelines).

Example JSON structure:
{
  "overallStatement": "Primary Genre Focus: Classic Detective Fiction.\\\\nBased on your enjoyment of intricate plots and historical settings, these classic detective novels offer a wealth of suspense and clever deduction for you to explore.",
  "bookReasonings": {
    "Book One Title by Author A": "${openingPhraseExample} [Unique, concrete, and evocative reasoning for Book One...]",
    "Book Two Title by Author B": "${recommendationType === 'likelyToEnjoy' ? "Why you'll love this book:" : "Why this book might surprise you:"} [Unique, concrete, and evocative reasoning for Book Two...]"
  }
}
Ensure the keys in the "bookReasonings" object exactly match the "TITLE by AUTHOR" strings of the books.
Your entire response must be only this JSON object.
`;
  const modelForReasoning = "gpt-4.1";
  await logPromptToFile(`reasoningPrompt_${recommendationType}`, modelForReasoning, reasoningPrompt);

  try {
    console.log(`[Debug] Calling OpenAI API for reasonings for ${recommendationType}. Prompt length: ${reasoningPrompt.length}`);
    const response = await openai.chat.completions.create({
      model: modelForReasoning,
      messages: [{ role: "user", content: reasoningPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.9, 
      max_tokens: 1800, // Increased slightly for overall statement + 10 reasonings
    });
    
    console.log("[Debug] Full OpenAI response for reasonings:", JSON.stringify(response, null, 2));
    
    if (response.choices[0]?.message?.content) {
      const parsedResponse = JSON.parse(response.choices[0].message.content) as ReasoningAPIResponse;
      // Basic validation
      if (parsedResponse && typeof parsedResponse.overallStatement === 'string' && typeof parsedResponse.bookReasonings === 'object') {
        console.log(`[Debug] Parsed response for ${recommendationType}:`, parsedResponse);
        return parsedResponse;
      }
      console.error("[Debug] OpenAI response for reasonings has incorrect structure:", parsedResponse);
      return undefined;
    }
    console.error("[Debug] OpenAI did not return content for reasonings.");
    return undefined;
  } catch (error: any) {
    console.error(`[Debug] Error fetching reasonings for ${recommendationType} tab:`, error);
    if (error.response) {
      console.error("[Debug] Error response details:", JSON.stringify(error.response, null, 2));
    }
    return undefined;
  }
}

// Augment the global type for Node.js to include our mock cache
declare global {
  var mockResultsCache_recommendations: Map<string, any> | undefined;
}

// THIS IS A TEMPORARY IN-MEMORY CACHE FOR DEMONSTRATION AND TESTING ONLY.
// NOT SUITABLE FOR PRODUCTION. Replace with a proper database or persistent store.
// Initialize if not already present
global.mockResultsCache_recommendations = global.mockResultsCache_recommendations || new Map<string, any>();

export async function POST(request: NextRequest) {
  if (!apiKey) {
    // This check is crucial at runtime if the key wasn't found at startup.
    return NextResponse.json(
      { 
        error: 'OpenAI API key is not configured on the server.',
        errorType: 'configuration',
      },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const { questions: studentQuestions, answers: studentAnswers } = body;

    if (!studentQuestions || !studentAnswers) {
      return NextResponse.json(
        { error: 'Missing questions or answers in the request body.' },
        { status: 400 },
      );
    }

    const booksPath = path.join(process.cwd(), 'data', 'books.json');
    if (!fs.existsSync(booksPath)) {
      return NextResponse.json(
        { 
          error: 'Book database (books.json) not found.',
          errorType: 'database',
        },
        { status: 500 },
      );
    }

    const booksData = fs.readFileSync(booksPath, 'utf-8');
    if (booksData === '[]') {
        return NextResponse.json(
            {
              error: 'Book database is empty. Please run the book scraper first.',
              errorType: 'database',
            },
            { status: 500 },
          );
    }
    const allBooks: Book[] = JSON.parse(booksData);

    // Prepare data for OpenAI
    const formattedStudentResponses = formatStudentResponses(studentQuestions, studentAnswers);
    
    // Shuffle the books before creating the list for OpenAI
    const shuffledBooks = shuffleArray(allBooks);
    // Format for token efficiency: "TITLE by AUTHOR"
    const bookListForOpenAI = shuffledBooks.map(book => `${book.title} by ${book.author}`);

    // Prompt for gpt-4.1 (Book Selection)
    const selectionPrompt = `\
You are a highly knowledgeable and insightful book recommendation system.
Your goal is to help a student discover books they will genuinely enjoy and also suggest some books that might broaden their literary horizons, based on their survey responses.
Your audience is US 9th graders in Honors English class.

Here are the student's responses to a survey about their reading preferences:
--- START STUDENT RESPONSES ---
${formattedStudentResponses}
--- END STUDENT RESPONSES ---

Here is a list of available books you can recommend from. Each book is a string in the format "TITLE by AUTHOR":
--- START AVAILABLE BOOKS ---
${JSON.stringify(bookListForOpenAI)}
--- END AVAILABLE BOOKS ---

Based on all the information, please provide book recommendations.
Recommendation tips:
- Listen closely to FRQ answers. They mean more to students than MCQ responses.
- Don't recommend a book that the student has already read.
- You don't need to follow all preferences in each suggestion.
- For variation in your recommendations, prefer fully following subsets of preferences.
- Be bold! in "differentTaste" recommendations.
- Any book from the list is fine! As long as it's a good fit. Feel free to recommend niche, not-as-popular books.
- Aim for a chunk of books to be less known.

For the "differentTaste" category, first internally select a random subset of approximately 1/4 of the "AVAILABLE BOOKS". Then, make your recommendations for "differentTaste" *only* from this smaller internal subset. The "likelyToEnjoy" category should still consider all "AVAILABLE BOOKS".

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
Your entire response should be a single, valid JSON object.
    `;
    const modelForSelection = "gpt-4.1"; // Consistent with existing code
    await logPromptToFile("selectionPrompt", modelForSelection, selectionPrompt);

    const selectionResponse = await openai.chat.completions.create({
      model: modelForSelection,
      messages: [{ role: "user", content: selectionPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.9,
    });

    if (!selectionResponse.choices[0].message.content) {
      return NextResponse.json(
        { error: 'OpenAI (selection) did not return any content.', errorType: 'openai' },
        { status: 500 },
      );
    }
    
    // Type for the response from the selection model (before reasoning is added)
    interface BookSelectionResponse {
      likelyToEnjoy: { bookString: string }[];
      differentTaste: { bookString: string }[];
    }
    const bookSelections = JSON.parse(selectionResponse.choices[0].message.content) as BookSelectionResponse;

    // New type for the result of processAndFetchReasoning
    interface TabReasoningResult {
      overallStatement: string;
      recommendationsWithReasoning: BookRecommendation[];
    }

    // Updated function to process selections and fetch all reasonings for a tab at once
    const processAndFetchReasoning = async (
      selections: { bookString: string }[],
      studentRespText: string,
      allBooksFromDb: Book[],
      recommendationType: 'likelyToEnjoy' | 'differentTaste',
    ): Promise<TabReasoningResult | undefined> => {
      if (!selections || selections.length === 0) {
        return { overallStatement: "", recommendationsWithReasoning: [] };
      }

      const booksForReasoningPrompt: BookForReasoning[] = selections.map(sel => {
        const bookDetailsMatch = sel.bookString.match(/(.*?) by (.*)/i);
        let title = sel.bookString;
        let author = "";
        if (bookDetailsMatch && bookDetailsMatch.length >= 3) {
          title = bookDetailsMatch[1].trim();
          author = bookDetailsMatch[2].trim();
        }
        
        // Find the full book details from allBooksFromDb
        // This simplified find should be okay as mapSelectionsToBooks later does robust matching.
        // For the prompt, we primarily need title, author, description from a reasonably matched book.
        const foundBook = allBooksFromDb.find(
          dbBook => 
            dbBook.title.toLowerCase() === title.toLowerCase() &&
            (author === "" || dbBook.author.toLowerCase().includes(author.toLowerCase()))
        );

        return {
          title: foundBook?.title || title,
          author: foundBook?.author || author,
          // Use full description for the AI's context, snippet generation is inside fetchReasoningsForTab
          description: foundBook?.description || "No description available.", 
          bookString: sel.bookString,
        };
      }).filter(b => b.title && b.author);
      
      if (booksForReasoningPrompt.length === 0 && selections.length > 0) {
        console.warn(`[Debug] No valid books found for reasoning in ${recommendationType} after filtering, though selections existed.`);
         return { overallStatement: "Could not prepare books for reasoning.", recommendationsWithReasoning: [] };
      }
      
      const reasoningData = await fetchReasoningsForTab(studentRespText, booksForReasoningPrompt, recommendationType);

      if (!reasoningData || !reasoningData.bookReasonings) {
        console.error(`[Debug] Failed to fetch or parse reasonings for ${recommendationType}`);
        // Fallback: return selections without individual reasonings, but try to get an overall statement if it exists
        const fallbackRecommendations = selections.map(sel => ({
          bookString: sel.bookString,
          reasoning: "Could not load reasoning for this book.",
        }));
        return { 
          overallStatement: reasoningData?.overallStatement || "We encountered an issue generating personalized insights for this section, but here are your book suggestions!",
          recommendationsWithReasoning: fallbackRecommendations,
        };
      }

      const recommendationsWithReasoning: BookRecommendation[] = selections.map(sel => ({
        bookString: sel.bookString,
        reasoning: reasoningData.bookReasonings[sel.bookString] || "No specific reasoning provided.",
      }));
      
      return {
        overallStatement: reasoningData.overallStatement,
        recommendationsWithReasoning,
      };
    };

    const likelyToEnjoyData = await processAndFetchReasoning(
      bookSelections.likelyToEnjoy,
      formattedStudentResponses,
      allBooks,
      'likelyToEnjoy',
    );

    const differentTasteData = await processAndFetchReasoning(
      bookSelections.differentTaste,
      formattedStudentResponses,
      allBooks,
      'differentTaste',
    );

    // Helper function to map selections to full Book objects
    const mapSelectionsToBooks = (
      processedRecommendations: BookRecommendation[], 
      bookList: Book[],
    ): Book[] => {
      return processedRecommendations.map(rec => {
        const match = rec.bookString.match(/(.*?) by (.*)/i);
        if (!match || match.length < 3) {
          console.warn(`Could not parse bookString: ${rec.bookString}`);
          return null;
        }
        const recommendedTitle = match[1].trim().toLowerCase();
        const recommendedAuthor = match[2].trim().toLowerCase();

        let foundBook = bookList.find(
          b =>
            b.title.toLowerCase() === recommendedTitle &&
            b.author.toLowerCase().includes(recommendedAuthor),
        );
        
        if (!foundBook) {
          // Fallback: try a more flexible search if exact match fails
          console.warn(`Book not found for parsed recommendation: Title='${recommendedTitle}', Author='${recommendedAuthor}'. Original bookString: '${rec.bookString}'. Trying flexible search.`);
          foundBook = bookList.find(
            b =>
              b.title.toLowerCase().includes(recommendedTitle) ||
              (recommendedTitle.includes(b.title.toLowerCase()) && b.title.length > 5), // Heuristic for partial match
          );
        }

        if (foundBook) {
          return { ...foundBook, aiReasoning: rec.reasoning }; // aiReasoning comes from gpt-4.1
        }
        console.warn(`Book still not found after flexible search: '${rec.bookString}'`);
        return null;
      }).filter(Boolean) as Book[];
    };

    const likelyToEnjoyBooks = mapSelectionsToBooks(likelyToEnjoyData?.recommendationsWithReasoning || [], allBooks);
    const differentTasteBooks = mapSelectionsToBooks(differentTasteData?.recommendationsWithReasoning || [], allBooks);

    // New structure for cached data
    interface CachedTabData {
      overallStatement: string;
      books: Book[]; // Book objects will include their individual 'reasoning' field
    }
    interface CachedResultsData {
      quizAnswers: Record<string, string | string[]>;
      quizQuestions: QuizQuestion[];
      likelyToEnjoy: CachedTabData;
      differentTaste: CachedTabData;
      timestamp: string;
      resultsId: string;
    }

    const resultsData: CachedResultsData = {
      quizAnswers: studentAnswers,
      quizQuestions: studentQuestions,
      likelyToEnjoy: {
        overallStatement: likelyToEnjoyData?.overallStatement || "Here are some books you might enjoy!",
        books: likelyToEnjoyBooks,
      },
      differentTaste: {
        overallStatement: differentTasteData?.overallStatement || "Here are some books to expand your taste!",
        books: differentTasteBooks,
      },
      timestamp: new Date().toISOString(),
      resultsId: crypto.randomUUID(),
    };

    (global.mockResultsCache_recommendations as Map<string, any>).set(resultsData.resultsId, resultsData);

    // Return only the resultsId to the client
    return NextResponse.json({ resultsId: resultsData.resultsId });

  } catch (error: any) {
    console.error("[API Route Error] Error in recommendations POST handler:", error);
    let errorMessage = 'Failed to generate recommendations.';
    let errorType = 'unknown_post_error';

    if (error.response?.data?.error) { 
        errorMessage = error.response.data.error.message;
        errorType = 'openai_api_error';
    } else if (error instanceof SyntaxError) {
        errorMessage = 'Failed to parse response from AI. AI might have returned invalid JSON.';
        errorType = 'json_parsing_error';
    } else if (error.message) {
        errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage, errorType: errorType, details: error.stack },
      { status: 500 },
    );
  }
}

// GET HANDLER TO RETRIEVE MOCK RESULTS
export async function GET(request: NextRequest) {
  const resultsId = request.nextUrl.searchParams.get('resultsId');

  if (!resultsId) {
    return NextResponse.json({ error: 'Missing resultsId parameter' }, { status: 400 });
  }

  const results = (global.mockResultsCache_recommendations as Map<string, any>)?.get(resultsId);

  if (results) {
    // Return the full results structure, which now includes overallStatement
    return NextResponse.json(results);
  } else {
    return NextResponse.json({ error: 'Results not found or expired' }, { status: 404 });
  }
} 