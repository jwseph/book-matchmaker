"use client";

export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import ResultsDisplay from '@/app/components/ResultsDisplay';
import { ResultsPageData, ErrorState } from '@/app/types';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();

  const [results, setResults] = useState<ResultsPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);
  const fetchingIdRef = useRef<string | null>(null);

  const handleReset = () => {
    router.push('/');
  };
  
  const handleErrorAction = () => {
    if (error?.action === 'Retake Quiz' || error?.action === 'Try Quiz Again' || error?.action === 'Go Home') {
      router.push('/');
    } else if (error?.action === 'Retry') {
      if (params.id) {
        setResults(null);
        setError(null);
        router.push('/');
      }
    }
  };

  useEffect(() => {
    const newResultsId = params.id as string;

    if (!newResultsId) {
      setResults(null);
      setError(null);
      setIsLoading(false);
      fetchingIdRef.current = null;
      return;
    }

    if (results && results.resultsId === newResultsId) {
      if (isLoading) {
        setIsLoading(false);
      }
      if (fetchingIdRef.current === newResultsId) {
          fetchingIdRef.current = null;
      }
      return;
    }

    if (fetchingIdRef.current === newResultsId) {
      if(!isLoading) setIsLoading(true);
      return;
    }

    fetchingIdRef.current = newResultsId;
    setIsLoading(true);
    setResults(null);
    setError(null);

    const fetchNewData = async () => {
      try {
        const response = await axios.get<ResultsPageData>(`/api/recommendations?resultsId=${newResultsId}`);
        if (fetchingIdRef.current === newResultsId) {
          setResults(response.data);
        }
      } catch (err: any) {
        if (fetchingIdRef.current === newResultsId) {
          let errMessage = 'Failed to load recommendations. Please try again.';
          let errAction: 'Retry' | 'Retake Quiz' = 'Retry';
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            errMessage = 'These recommendations could not be found. They may have expired or the link is invalid.';
            errAction = 'Retake Quiz';
          } else if (err.response?.data?.error) {
            errMessage = err.response.data.error;
          }
          setError({ message: errMessage, action: errAction, type: 'network' });
        }
      } finally {
        if (fetchingIdRef.current === newResultsId) {
          setIsLoading(false);
          fetchingIdRef.current = null;
        }
      }
    };

    fetchNewData();

    return () => {
      if (fetchingIdRef.current === newResultsId) {
        fetchingIdRef.current = null;
      }
    };
  }, [params.id]);

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
    return <div className="min-h-screen flex items-center justify-center text-lw-muted-text dark:text-lw-dark-muted-text">No results to display.</div>;
  }

  return <ResultsDisplay 
            likelyToEnjoyData={results.likelyToEnjoy} 
            differentTasteData={results.differentTaste} 
            onReset={handleReset} 
         />;
} 