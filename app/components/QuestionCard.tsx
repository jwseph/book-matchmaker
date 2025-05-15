"use client";

import { useState, useEffect } from 'react';
import { QuizQuestion } from '@/app/types';

interface QuestionCardProps {
  question: QuizQuestion;
  onSubmit: (questionId: string, answer: string | string[]) => void;
}

export default function QuestionCard({ question, onSubmit }: QuestionCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [frqAnswer, setFrqAnswer] = useState('');

  // Reset local state when question changes
  useEffect(() => {
    setSelectedOptions([]);
    setFrqAnswer('');
  }, [question.id]);

  const handleOptionChange = (option: string) => {
    let newSelectedOptions: string[];
    if (question.allowMultiple) {
      newSelectedOptions = selectedOptions.includes(option)
        ? selectedOptions.filter(o => o !== option)
        : [...selectedOptions, option];
      setSelectedOptions(newSelectedOptions);
    } else {
      // For single-choice MCQ, submit immediately on selection
      setSelectedOptions([option]);
      onSubmit(question.id, option); 
    }
  };

  const handleSubmit = () => {
    // This function is now primarily for FRQ and multi-select MCQ
    if (question.type === 'frq') {
      onSubmit(question.id, frqAnswer);
    } else if (question.type === 'mcq' && question.allowMultiple) {
      // Ensure at least one option is selected for multi-select before submitting
      if (selectedOptions.length > 0) {
        onSubmit(question.id, selectedOptions);
      }
    }
    // Single-select MCQs are handled by handleOptionChange
  };

  // Determine if submit button should be shown and if it's disabled
  const showSubmitButton = question.type === 'frq' || question.allowMultiple;
  const isSubmitDisabled = 
    question.type === 'frq' 
      ? frqAnswer.trim() === '' 
      : question.allowMultiple 
        ? selectedOptions.length === 0
        : true; // Should not be relevant if button isn't shown for single MCQ

  const handleFrqKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent newline on Enter
      if (frqAnswer.trim() !== '') {
        handleSubmit();
      }
    }
  };

  return (
    // Removed outer border/bg/shadow from this div, it will inherit from Quiz.tsx container
    <div>
      <h2 className="font-serif text-xl sm:text-2xl font-bold mb-6 text-lw-text dark:text-lw-dark-text">
        {question.question}
      </h2>

      {question.type === 'mcq' && (
        <div className="space-y-4 mb-8">
          {question.options?.map(option => (
            <label
              key={option}
              className={`font-sans flex items-center p-4 rounded-md border cursor-pointer transition-all duration-200 
                          ${selectedOptions.includes(option)
                            ? 'bg-lw-link/10 dark:bg-lw-dark-link/20 border-lw-link dark:border-lw-dark-link ring-2 ring-lw-link dark:ring-lw-dark-link text-lw-link dark:text-lw-dark-link'
                            : 'bg-lw-bg dark:bg-lw-dark-bg border-lw-border dark:border-lw-dark-border hover:border-lw-link/70 dark:hover:border-lw-dark-link/70 text-lw-text dark:text-lw-dark-text'}
                         `}
            >
              <input
                type={question.allowMultiple ? 'checkbox' : 'radio'}
                name={question.id}
                value={option}
                checked={selectedOptions.includes(option)}
                onChange={() => handleOptionChange(option)}
                // Attempting to make radio/checkbox bg slightly lighter in dark mode for better visibility of the control itself
                className={`form-radio h-5 w-5 focus:ring-lw-link/50 dark:focus:ring-lw-dark-link/50 border-lw-border dark:border-lw-dark-border bg-lw-subtle-bg dark:bg-lw-dark-border mr-3 
                            ${selectedOptions.includes(option) ? 'text-lw-link dark:text-lw-dark-link' : 'text-lw-muted-text dark:text-lw-dark-muted-text'}`}
              />
              <span className="flex-grow">{option}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'frq' && (
        <div className="mb-8">
          <textarea
            value={frqAnswer}
            onChange={e => setFrqAnswer(e.target.value)}
            onKeyDown={handleFrqKeyDown}
            rows={4}
            className="font-sans block w-full p-3 border-lw-border dark:border-lw-dark-border rounded-md shadow-sm focus:ring-lw-link dark:focus:ring-lw-dark-link focus:border-lw-link dark:focus:border-lw-dark-link bg-lw-subtle-bg dark:bg-lw-dark-subtle-bg text-lw-text dark:text-lw-dark-text placeholder-lw-muted-text dark:placeholder-lw-dark-muted-text"
            placeholder={question.placeholder || "Spill the tea! What's on your mind? (e.g., 'Loved the way Dune made giant worms kinda cool', or 'Hated Twilight, too sparkly')"}
          />
        </div>
      )}

      {showSubmitButton && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="font-sans w-full px-6 py-3 text-lg font-medium rounded-md shadow-md transition-all duration-200 focus:outline-none focus:ring-2 
                    bg-lw-link text-lw-subtle-bg dark:bg-lw-dark-link dark:text-lw-dark-subtle-bg 
                    hover:bg-lw-link-hover dark:hover:bg-lw-dark-link-hover 
                    focus:ring-lw-link dark:focus:ring-lw-dark-link 
                    disabled:bg-lw-border dark:disabled:bg-lw-dark-border 
                    disabled:text-lw-muted-text dark:disabled:text-lw-dark-muted-text 
                    disabled:cursor-not-allowed
                    cursor-pointer" // Explicitly add cursor-pointer for non-disabled state
        >
          {/* Adjust button text if needed based on context, e.g., for multi-select vs FRQ */}
          {question.type === 'frq' ? 'Submit Response' : 'Submit Selections'}
        </button>
      )}
    </div>
  );
} 