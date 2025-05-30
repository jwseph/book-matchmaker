"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Book } from '@/app/types';
import { FaBookOpen, FaShoppingCart, FaAmazon, FaGoodreads } from 'react-icons/fa';

interface BookCardProps {
  book: Book;
  rank?: number;
}

export default function BookCard({ book, rank }: BookCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-lw-subtle-bg dark:bg-lw-dark-subtle-bg shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col h-full border border-lw-border dark:border-lw-dark-border relative">
      {rank && (
        <span 
          className="absolute top-2 left-2 z-10 text-xs font-semibold text-lw-link dark:text-lw-dark-link bg-lw-subtle-bg dark:bg-lw-dark-subtle-bg px-1.5 py-0.5 rounded-full border border-lw-link dark:border-lw-dark-link shadow-sm flex items-center justify-center"
        >
          #{rank}
        </span>
      )}

      <div className="flex p-4 pt-6 space-x-3 items-start">
        <div className="w-20 h-32 flex-shrink-0 relative shadow-md rounded">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded"
              unoptimized={book.coverUrl.includes('books.google.com')}
            />
          ) : (
            <div className="w-full h-full bg-lw-border dark:bg-lw-dark-border flex items-center justify-center rounded">
              <FaBookOpen className="text-3xl text-lw-muted-text dark:text-lw-dark-muted-text" />
            </div>
          )}
        </div>

        <div className="flex-grow min-w-0">
          <h3 className="text-lg font-serif font-bold mb-1 line-clamp-2 text-lw-text dark:text-lw-dark-text leading-tight">
            {book.title}
          </h3>
          <p className="text-sm font-sans text-lw-muted-text dark:text-lw-dark-muted-text mb-2">
            By {book.author}
          </p>
        </div>
      </div>

      <div className="p-4 pt-0 flex-grow flex flex-col overflow-hidden">
        <div 
          className={`font-serif text-sm text-lw-text dark:text-lw-dark-text flex-grow transition-all duration-500 ease-in-out overflow-hidden ${expanded ? 'max-h-screen' : 'max-h-20'}`}
        >
          {book.description}
        </div>
        
        {book.description && book.description.length > 100 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 font-sans text-sm text-lw-link dark:text-lw-dark-link hover:text-lw-link-hover dark:hover:text-lw-dark-link-hover self-start focus:outline-none"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
        
        {book.aiReasoning && (
          <div className="mt-3 pt-3 border-t border-lw-border dark:border-lw-dark-border">
            <p className="font-serif text-xs font-semibold text-lw-muted-text dark:text-lw-dark-muted-text mb-1">
              Why this book?
            </p>
            <p className="font-serif text-sm italic text-lw-text dark:text-lw-dark-text">
              {book.aiReasoning}
            </p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-lw-border dark:border-lw-dark-border bg-lw-bg dark:bg-lw-dark-bg mt-auto">
        <div className="flex space-x-3">
          {book.links?.bookshop && (
            <a
              href={book.links.bookshop}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans flex items-center justify-center px-3 py-2 text-xs bg-lw-link text-lw-subtle-bg dark:bg-lw-dark-link dark:text-lw-dark-subtle-bg rounded-md hover:bg-opacity-80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-lw-link dark:focus:ring-lw-dark-link shadow"
            >
              <FaShoppingCart className="mr-1.5" /> Bookshop.org
            </a>
          )}
          {book.links?.amazon && (
            <a
              href={book.links.amazon}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans flex items-center justify-center px-3 py-2 text-xs bg-lw-muted-text text-lw-subtle-bg dark:bg-lw-dark-muted-text dark:text-lw-dark-subtle-bg rounded-md hover:bg-opacity-80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-lw-link dark:focus:ring-lw-dark-link shadow"
            >
              <FaAmazon className="mr-1.5" /> Amazon
            </a>
          )}
          {book.links?.goodreads && (
            <a
              href={book.links.goodreads}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans flex items-center justify-center px-3 py-2 text-xs bg-[#382110] text-white dark:bg-[#F4F1EA] dark:text-[#382110] rounded-md hover:bg-opacity-80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#382110] dark:focus:ring-[#F4F1EA] shadow"
            >
              <FaGoodreads className="mr-1.5" /> Goodreads
            </a>
          )}
        </div>
      </div>
    </div>
  );
} 