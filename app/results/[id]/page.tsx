"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import ResultsDisplay from '@/app/components/ResultsDisplay';
import { ResultsPageData, ErrorState } from '@/app/types';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const resultsId = params.id as string;

  const [results, setResults] = useState<ResultsPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);

  useEffect(() => {
    if (resultsId) {
      const fetchResults = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axios.get<ResultsPageData>(`/api/recommendations?resultsId=${resultsId}`); 
          if (response.data && 
              response.data.likelyToEnjoy && typeof response.data.likelyToEnjoy.overallStatement === 'string' && Array.isArray(response.data.likelyToEnjoy.books) &&
              response.data.differentTaste && typeof response.data.differentTaste.overallStatement === 'string' && Array.isArray(response.data.differentTaste.books)
          ) {
            setResults(response.data);
          } else {
            console.error("Invalid results format from server. Expected overallStatement and books array.", response.data);
            setError({ message: 'Invalid results format from server.', action: 'Go Home', type: 'application_error' });
          }
        } catch (err) {
          console.error('Error fetching results:', err);
          let errorMessage = 'Could not load your results. They might have expired or the link is invalid.';
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            errorMessage = 'These results could not be found. Perhaps the link is old or incorrect.';
          }
          setError({ message: errorMessage, action: 'Try Quiz Again', type: 'fetch_error' });
        } finally {
          setIsLoading(false);
        }
      };
      fetchResults();
    } else {
      // Should not happen if route is matched correctly, but good to handle
      setIsLoading(false);
      setError({ message: 'No results ID provided.', action: 'Go Home', type: 'application_error' });
    }
  }, [resultsId]);

  const handleReset = () => {
    router.push('/'); // Navigate to home/quiz page
  };
  
  const handleErrorAction = () => {
    if (error?.action === 'Try Quiz Again' || error?.action === 'Go Home') {
      router.push('/');
    }
    // Potentially other actions later
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-8 px-4 bg-lw-bg dark:bg-lw-dark-bg">
        <div className="w-full max-w-xl mx-auto p-8 bg-lw-subtle-bg dark:bg-lw-dark-subtle-bg shadow-2xl rounded-xl border border-lw-border dark:border-lw-dark-border flex flex-col items-center justify-center min-h-[300px]">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-lw-text dark:text-lw-dark-text mb-6 text-center">
            Loading Your Recommendations...
          </h2>
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-lw-border dark:border-lw-dark-border rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-t-4 border-lw-link dark:border-lw-dark-link rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-8 px-4 bg-lw-bg dark:bg-lw-dark-bg">
        <div className="text-center p-8 bg-lw-subtle-bg dark:bg-lw-dark-subtle-bg shadow-xl rounded-lg max-w-md mx-auto border border-lw-border dark:border-lw-dark-border">
          <h2 className="text-2xl font-semibold text-red-500 dark:text-red-400 mb-4">Oops!</h2>
          <p className="text-lw-text dark:text-lw-dark-text mb-6">{error.message}</p>
          <button 
            onClick={handleErrorAction}
            className="px-6 py-2 bg-lw-link text-lw-subtle-bg dark:bg-lw-dark-link dark:text-lw-dark-subtle-bg rounded-md hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-lw-link dark:focus:ring-lw-dark-link shadow-md cursor-pointer"
          >
            {error.action || 'Go Home'}
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    // This case should ideally be covered by isLoading or error states
    return <div className="min-h-screen flex items-center justify-center text-lw-muted-text dark:text-lw-dark-muted-text">No results to display.</div>;
  }

  return <ResultsDisplay 
            likelyToEnjoyData={results.likelyToEnjoy} 
            differentTasteData={results.differentTaste} 
            onReset={handleReset} 
         />;
} 