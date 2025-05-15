"use client";

import { useState } from 'react';
import { ResultsTabSpecificData, Book } from '@/app/types';
import BookCard from './BookCard';

interface ResultsDisplayProps {
  likelyToEnjoyData: ResultsTabSpecificData;
  differentTasteData: ResultsTabSpecificData;
  onReset: () => void;
}

export default function ResultsDisplay({ likelyToEnjoyData, differentTasteData, onReset }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState<'enjoy' | 'different'>('enjoy');
  
  const currentTabData = activeTab === 'enjoy' ? likelyToEnjoyData : differentTasteData;
  const { overallStatement, books: displayBooks } = currentTabData;

  const tabBaseStyle = "font-serif px-4 sm:px-6 py-3 text-md sm:text-lg font-medium focus:outline-none transition-colors duration-200 cursor-pointer";
  const activeTabStyle = "text-lw-link dark:text-lw-dark-link border-b-2 border-lw-link dark:border-lw-dark-link";
  const inactiveTabStyle = "text-lw-muted-text dark:text-lw-dark-muted-text hover:text-lw-text dark:hover:text-lw-dark-text hover:border-b-2 hover:border-lw-text/50 dark:hover:border-lw-dark-text/50";

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-lw-subtle-bg dark:bg-lw-dark-subtle-bg rounded-lg shadow-xl overflow-hidden border border-lw-border dark:border-lw-dark-border">
          <div className="p-6 sm:p-8 text-center">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-lw-text dark:text-lw-dark-text mb-3">
              Your Curated Book Recommendations
            </h1>
            <p className="font-sans text-md sm:text-lg text-lw-text dark:text-lw-dark-text leading-relaxed mb-8 max-w-2xl mx-auto">
              Based on your responses, we've selected these titles we think you'll appreciate. Explore books you're likely to enjoy or discover something new to broaden your horizons.
            </p>
            
            <div className="mb-8 border-b border-lw-border dark:border-lw-dark-border">
              <nav className="-mb-px flex justify-center space-x-2 sm:space-x-4" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('enjoy')}
                  className={`${tabBaseStyle} ${activeTab === 'enjoy' ? activeTabStyle : inactiveTabStyle}`}
                >
                  Likely to Enjoy ({likelyToEnjoyData.books.length})
                </button>
                <button
                  onClick={() => setActiveTab('different')}
                  className={`${tabBaseStyle} ${activeTab === 'different' ? activeTabStyle : inactiveTabStyle}`}
                >
                  Expand Your Taste ({differentTasteData.books.length})
                </button>
              </nav>
            </div>
          </div>

          {overallStatement && (
            <div className="px-6 sm:px-8 pb-6 text-center">
              {overallStatement.includes('\\n') ? (
                <>
                  <p className="font-sans text-lg sm:text-xl font-semibold text-lw-text dark:text-lw-dark-text leading-relaxed mb-2">
                    {overallStatement.split('\\n')[0]}
                  </p>
                  <p className="font-sans text-md sm:text-lg text-lw-text dark:text-lw-dark-text leading-relaxed italic">
                    {overallStatement.split('\\n').slice(1).join('\\n')}
                  </p>
                </>
              ) : (
                <p className="font-sans text-md sm:text-lg text-lw-text dark:text-lw-dark-text leading-relaxed italic">
                  {overallStatement} {/* Fallback if no newline */}
                </p>
              )}
            </div>
          )}

          {displayBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 bg-lw-bg dark:bg-lw-dark-bg">
              {displayBooks.map((book, index) => (
                <BookCard key={book.rank || index} book={book} rank={index + 1} />
              ))}
            </div>
          ) : (
            <p className="font-sans text-center py-12 text-lw-muted-text dark:text-lw-dark-muted-text">
              No recommendations available for this category.
            </p>
          )}
          
          <div className="p-6 sm:p-8 text-center border-t border-lw-border dark:border-lw-dark-border">
            <button
              onClick={onReset}
              className="font-sans px-8 py-3 text-lg rounded-md shadow-md transition-all duration-200 focus:outline-none focus:ring-2 
                         bg-lw-link text-lw-subtle-bg dark:bg-lw-dark-link dark:text-lw-dark-subtle-bg 
                         hover:bg-lw-link-hover dark:hover:bg-lw-dark-link-hover 
                         focus:ring-lw-link dark:focus:ring-lw-dark-link 
                         disabled:bg-lw-border dark:disabled:bg-lw-dark-border 
                         disabled:text-lw-muted-text dark:disabled:text-lw-dark-muted-text 
                         disabled:cursor-not-allowed
                         cursor-pointer"
            >
              Take Quiz Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 