export interface Book {
  id: string;
  rank?: number;
  title: string;
  author: string;
  description?: string;
  otherNames?: string;
  coverUrl?: string;
  genres?: string[];
  tags?: string[];
  series?: string;
  seriesOrder?: number;
  publicationYear?: number;
  rating?: number;
  numRatings?: number;
  pages?: number;
  isbn?: string;
  links?: {
    amazon?: string;
    bookshop?: string;
    goodreads?: string;
  };
  aiReasoning?: string;
  isCorrect?: boolean | null;
  userAnswer?: string | null;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'frq';
  question: string;
  options?: string[];
  allowMultiple?: boolean;
  answer?: string | string[];
  placeholder?: string;
}

export interface ErrorState {
  message: string;
  action: string;
  type: string;
}

export interface QuizState {
  currentQuestionIndex: number;
  questions: QuizQuestion[];
  answers: Record<string, string | string[]>;
  results: {
    likelyToEnjoy: Book[];
    differentTaste: Book[];
  } | null;
  isLoading: boolean;
  error: ErrorState | null;
}

export interface OpenAIResponse {
  likelyToEnjoy: BookRecommendation[];
  differentTaste: BookRecommendation[];
}

export interface BookRecommendation {
  bookString: string;
  reasoning?: string;
}

// Types for the results page data structure
export interface ResultsTabSpecificData {
  overallStatement: string;
  books: Book[]; // The Book type already includes aiReasoning for individual book reasonings
}

export interface ResultsPageData {
  quizAnswers: Record<string, string | string[]>;
  quizQuestions: QuizQuestion[];
  likelyToEnjoy: ResultsTabSpecificData;
  differentTaste: ResultsTabSpecificData;
  timestamp: string;
  resultsId: string;
} 