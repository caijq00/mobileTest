import { useState, useEffect, useCallback } from 'react';
import { BookingDataManager } from '../managers/bookingDataManager';
import { BookingData, DataManagerResult } from '../types/booking.types';
import { ErrorHandler, BookingError } from '../utils/errorHandler';

interface UseBookingDataResult {
  data: BookingData | null;
  isLoading: boolean;
  error: BookingError | null;
  isFromCache: boolean;
  refresh: () => Promise<void>;
  clearCache: () => Promise<void>;
}

export const useBookingData = (autoFetch: boolean = true): UseBookingDataResult => {
  const [data, setData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<BookingError | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);

  const dataManager = BookingDataManager.getInstance();

  const fetchData = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const result: DataManagerResult<BookingData> = await dataManager.getBookingData(forceRefresh);
      
      setData(result.data);
      setIsFromCache(result.isFromCache);
      
      if (result.error) {
        setError(ErrorHandler.handleError(result.error));
      }
    } catch (err) {
      const handledError = ErrorHandler.handleError(err);
      setError(handledError);
      console.error('useBookingData: 获取数据失败', handledError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(async () => {
    try {
      await dataManager.clearCache();
      setData(null);
      setIsFromCache(false);
      await fetchData(true);
    } catch (err) {
      const handledError = ErrorHandler.handleError(err);
      setError(handledError);
    }
  }, [fetchData]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    isLoading,
    error,
    isFromCache,
    refresh,
    clearCache
  };
};