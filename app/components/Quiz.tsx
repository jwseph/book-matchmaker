"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { Book, QuizQuestion, QuizState, ErrorState } from '@/app/types';
import QuestionCard from './QuestionCard';

const initialQuestions: QuizQuestion[] = [
  {
    id: 'q1_social_person',
    type: 'mcq',
    question: 'Are you a social person?',
    options: [
      'Very social and outgoing',
      'Somewhat social',
      'Mostly introverted',
      'Strongly prefer solitude',
    ],
  },
  {
    id: 'q2_character_dynamics',
    type: 'mcq',
    question: 'How do you feel about character dynamics in friend groups?',
    options: [
      'I enjoy complex group interactions',
      'I prefer focus on a few close relationships',
      'I\'m more interested in individual character development',
      'I don\'t particularly care about social dynamics',
    ],
  },
  {
    id: 'q3_solitary_ensemble',
    type: 'mcq',
    question: 'Do you prefer books with solitary characters or ensemble casts?',
    options: [
      'Strongly prefer solitary protagonists',
      'Prefer small, intimate character groups',
      'Enjoy books with larger ensemble casts',
      'No preference',
    ],
  },
  {
    id: 'q4_writing_style_importance',
    type: 'mcq',
    question: 'How important is the writing style to you?',
    options: [
      'Very important, I value beautiful prose',
      'Somewhat important, but I care more about the story',
      'Not important, I just want a good plot',
      'I prefer straightforward, simple writing',
    ],
  },
  {
    id: 'q5_story_pace',
    type: 'mcq',
    question: 'What pace of storytelling do you prefer?',
    options: [
      'Fast-paced with lots of action',
      'Moderate pace with good balance',
      'Slow, contemplative, and detailed',
      'Varies depending on the genre',
    ],
  },
  {
    id: 'q6_challenging_reads',
    type: 'mcq',
    question: 'How do you feel about challenging or difficult reads?',
    options: [
      'I enjoy being intellectually challenged',
      'I prefer books that make me think occasionally',
      'I read primarily for entertainment, not challenge',
      'I avoid books that require significant effort',
    ],
  },
  {
    id: 'q7_darker_themes_tolerance',
    type: 'mcq',
    question: 'What\'s your tolerance for darker themes?',
    options: [
      'I enjoy exploring dark, disturbing themes',
      'I can handle darkness if it serves the story',
      'I prefer mostly uplifting content with some challenges',
      'I strongly prefer positive, uplifting content',
    ],
  },
  {
    id: 'q8_diverse_perspectives_importance',
    type: 'mcq',
    question: 'How important are diverse perspectives in your reading?',
    options: [
      'Very important, I actively seek diverse voices',
      'Somewhat important, but not my primary concern',
      'I\'m neutral about it',
      'Not a factor in my book selection',
    ],
  },
  {
    id: 'q9_multiple_perspectives_enjoyment',
    type: 'mcq',
    question: 'Do you enjoy books with multiple perspectives/narrators?',
    options: [
      'Yes, I love seeing different viewpoints',
      'Sometimes, if well-executed',
      'I prefer a single consistent narrator',
      'No, multiple perspectives confuse me',
    ],
  },
  {
    id: 'q10_ambiguous_endings_feeling',
    type: 'mcq',
    question: 'How do you feel about ambiguous endings?',
    options: [
      'I love them - they make me think',
      'I can appreciate them in certain books',
      'I prefer closure but can handle some ambiguity',
      'I strongly prefer clear resolution',
    ],
  },
  {
    id: 'q11_frq_favorite_book',
    type: 'frq',
    question: 'What is the name of your favorite book?',
    placeholder: "e.g., 'Pride and Prejudice', 'Dune', 'The Secret History'... don't be shy!",
  },
  {
    id: 'q12_frq_enjoyable_themes',
    type: 'frq',
    question: 'What themes or topics do you most enjoy exploring in books?',
    placeholder: "Think 'found family', 'dystopian societies', 'magical realism', 'coming-of-age angst', etc.",
  },
  {
    id: 'q13_frq_interesting_setting',
    type: 'frq',
    question: 'Is there a time period or setting that particularly interests you?',
    placeholder: "Victorian England? A spaceship? A quiet village with a dark secret? Spill the beans!",
  },
  {
    id: 'q14_frq_unfinished_book_reason',
    type: 'frq',
    question: 'Name one book you couldn\'t finish and explain why.',
    placeholder: "'Moby Dick - too many whale facts!' or 'That popular sci-fi... just didn\'t click.' No judgment!",
  },
  {
    id: 'q15_frq_desired_emotions',
    type: 'frq',
    question: 'What emotions do you hope to experience when reading?',
    placeholder: "Joy? Suspense? A good cry? Intellectual stimulation? Tell me everything!",
  },
  {
    id: 'q16_frq_avoided_topics',
    type: 'frq',
    question: 'Do you have any topics or content you prefer to avoid in books?',
    placeholder: "This helps us steer clear! e.g., 'Excessive gore', 'animal cruelty', 'love triangles'...",
  },
];

export default function Quiz() {
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    questions: initialQuestions,
    answers: {},
    results: null,
    isLoading: false,
    error: null,
  });

  const router = useRouter();
  const isSubmittingRef = useRef(false);

  const handleAnswerSubmit = (questionId: string, answer: string | string[]) => {
    setState(prev => {
      const newAnswers = {
        ...prev.answers,
        [questionId]: answer,
      };
      
      if (prev.currentQuestionIndex === prev.questions.length - 1) {
        const updatedState = {
          ...prev,
          answers: newAnswers,
          isLoading: true,
          error: null,
        };
        getRecommendations(newAnswers);
        return updatedState;
      }
      
      return {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        answers: newAnswers,
      };
    });
  };

  const getRecommendations = async (answers: Record<string, string | string[]>) => {
    if (isSubmittingRef.current) {
      console.log('[Debug] Submission already in progress, skipping duplicate call to getRecommendations.');
      return;
    }
    isSubmittingRef.current = true;

    try {
      const response = await axios.post('/api/recommendations', {
        questions: initialQuestions.map(({id, type, question, options, allowMultiple}) => ({id, type, question, options, allowMultiple})),
        answers,
      });
      
      if (response.data && response.data.resultsId) {
        router.push(`/results/${response.data.resultsId}`);
      } else {
        console.error('API did not return a resultsId');
        setState(prev => ({
          ...prev,
          error: {
            message: 'Could not generate a shareable link for your results. Please try again.',
            action: 'Retry Fetching Recommendations',
            type: 'application_error',
          }
        }));
      }
    } catch (err: unknown) {
      console.error('Error getting recommendations:', err);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      let errorAction = 'Retry Fetching Recommendations';
      let errorType = 'unknown';
      
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError<{ error: string; errorType: string; details?: string }>;      
        if (error.response?.data) {
          errorMessage = error.response.data.error || errorMessage;
          errorType = error.response.data.errorType || errorType;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      if (errorType === 'configuration') {
        errorMessage = 'Server configuration error. Please contact support.';
        errorAction = 'Reload Page';
      } else if (errorType === 'database') {
        errorMessage = 'Could not access book data. Please try again later.';
        errorAction = 'Retry Fetching Recommendations';
      } else if (errorType === 'openai' || errorType === 'openai_api_error') {
        errorMessage = 'Could not get recommendations from our AI. Please try again.';
        errorAction = 'Retry Fetching Recommendations';
      }
      
      setState(prev => ({ 
        ...prev, 
        error: {
          message: errorMessage,
          action: errorAction,
          type: errorType as ErrorState['type'],
        }
      }));
    } finally {
      isSubmittingRef.current = false;
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const resetQuiz = () => {
    setState({
      currentQuestionIndex: 0,
      questions: initialQuestions.map(q => ({ ...q, answer: undefined })),
      answers: {},
      results: null,
      isLoading: false,
      error: null,
    });
  };

  const handleErrorAction = () => {
    if (state.error?.action === 'Reload Page') {
      window.location.reload();
    } else if (state.error?.action === 'Retry Fetching Recommendations') {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      getRecommendations(state.answers);
    } else {
      resetQuiz();
    }
  };

  if (state.error) {
    return (
      <div className="w-full max-w-xl mx-auto p-4 sm:p-8 bg-lw-subtle-bg dark:bg-lw-dark-subtle-bg shadow-2xl rounded-xl border border-lw-border dark:border-lw-dark-border flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-center p-8">
          <h2 className="text-2xl font-semibold text-red-500 dark:text-red-400 mb-4">Oops! Something went wrong.</h2>
          <p className="text-lw-text dark:text-lw-dark-text mb-6">{state.error.message}</p>
          <button 
            onClick={handleErrorAction}
            className="px-6 py-2 bg-lw-link text-lw-subtle-bg dark:bg-lw-dark-link dark:text-lw-dark-subtle-bg rounded-md hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-lw-link dark:focus:ring-lw-dark-link shadow-md cursor-pointer"
          >
            {state.error.action || 'Try Again'}
          </button>
        </div>
      </div>
    );
  }
  
  if (state.isLoading) {
    return (
      <div className="w-full max-w-xl mx-auto p-4 sm:p-8 bg-lw-subtle-bg dark:bg-lw-dark-subtle-bg shadow-2xl rounded-xl border border-lw-border dark:border-lw-dark-border flex flex-col items-center justify-center min-h-[300px]">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-lw-text dark:text-lw-dark-text mb-6 text-center">
          Finding Your Perfect Reads...
        </h2>
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-lw-border dark:border-lw-dark-border rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-t-4 border-lw-link dark:border-lw-dark-link rounded-full animate-spin"></div>
        </div>
        <p className="font-sans text-lw-muted-text dark:text-lw-dark-muted-text mt-6">
          Please wait a moment, we're consulting the literary spirits! (estimated time: 30 seconds)
        </p>
      </div>
    );
  }

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const progressPercentage = Math.round(((state.currentQuestionIndex + 1) / state.questions.length) * 100);

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-8 bg-lw-subtle-bg dark:bg-lw-dark-subtle-bg shadow-2xl rounded-xl border border-lw-border dark:border-lw-dark-border">
      <div className="flex justify-between items-center mb-2">
        <span className="font-sans text-sm font-medium text-lw-muted-text dark:text-lw-dark-muted-text">
          Question {state.currentQuestionIndex + 1} of {state.questions.length}
        </span>
        <span className="font-sans text-sm font-medium text-lw-link dark:text-lw-dark-link">
          {progressPercentage}%
        </span>
      </div>
      <div className="w-full bg-lw-border dark:bg-lw-dark-border rounded-full h-2.5 mb-8">
        <div
          className="bg-lw-link dark:bg-lw-dark-link h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <QuestionCard
        question={currentQuestion}
        onSubmit={handleAnswerSubmit}
      />
    </div>
  );
} 