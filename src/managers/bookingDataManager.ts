import { BookingService } from '../services/bookingService';
import { CacheManager } from '../cache/cacheManager';
import { ExpiryHandler } from '../utils/expiryHandler';
import { BookingData, DataManagerResult, CachedBookingData } from '../types/booking.types';

export class BookingDataManager {
  private static instance: BookingDataManager;
  private bookingService: BookingService;
  private cacheManager: CacheManager;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<BookingData> | null = null;

  constructor() {
    this.bookingService = BookingService.getInstance();
    this.cacheManager = CacheManager.getInstance();
  }

  static getInstance(): BookingDataManager {
    if (!BookingDataManager.instance) {
      BookingDataManager.instance = new BookingDataManager();
    }
    return BookingDataManager.instance;
  }

  async getBookingData(forceRefresh: boolean = false): Promise<DataManagerResult<BookingData>> {
    console.log('BookingDataManager: 获取预订数据');
    
    try {
      if (forceRefresh) {
        return await this.fetchFreshData();
      }

      const cachedData = await this.cacheManager.getCachedBookingData();
      
      if (cachedData && !this.cacheManager.isCacheExpired(cachedData)) {
        console.log('BookingDataManager: 使用有效缓存数据');
        
        if (ExpiryHandler.shouldRefreshData(cachedData.data)) {
          console.log('BookingDataManager: 数据即将过期，后台刷新');
          this.refreshInBackground();
        }
        
        return {
          data: cachedData.data,
          isLoading: false,
          isFromCache: true
        };
      }

      console.log('BookingDataManager: 缓存无效或不存在，获取新数据');
      return await this.fetchFreshData();

    } catch (error) {
      console.error('BookingDataManager: 获取数据失败', error);
      
      const fallbackCachedData = await this.getFallbackCachedData();
      if (fallbackCachedData) {
        console.log('BookingDataManager: 使用过期缓存数据作为降级方案');
        return {
          data: fallbackCachedData.data,
          error: error as Error,
          isLoading: false,
          isFromCache: true
        };
      }

      return {
        data: null,
        error: error as Error,
        isLoading: false,
        isFromCache: false
      };
    }
  }

  async refreshBookingData(): Promise<DataManagerResult<BookingData>> {
    console.log('BookingDataManager: 手动刷新数据');
    return await this.fetchFreshData();
  }

  private async fetchFreshData(): Promise<DataManagerResult<BookingData>> {
    if (this.isRefreshing && this.refreshPromise) {
      console.log('BookingDataManager: 等待正在进行的刷新操作');
      try {
        const data = await this.refreshPromise;
        return {
          data,
          isLoading: false,
          isFromCache: false
        };
      } catch (error) {
        return {
          data: null,
          error: error as Error,
          isLoading: false,
          isFromCache: false
        };
      }
    }

    this.isRefreshing = true;
    this.refreshPromise = this.bookingService.fetchBookingData();

    try {
      const freshData = await this.refreshPromise;
      
      const cachedData = await this.cacheManager.getCachedBookingData();
      let finalData = freshData;
      
      if (cachedData && !this.cacheManager.isCacheExpired(cachedData)) {
        console.log('BookingDataManager: 合并缓存数据和新数据');
        finalData = ExpiryHandler.mergeBookingData(cachedData.data, freshData);
      }

      await this.cacheManager.saveBookingData(finalData);
      console.log('BookingDataManager: 成功获取并缓存新数据');

      return {
        data: finalData,
        isLoading: false,
        isFromCache: false
      };
    } catch (error) {
      console.error('BookingDataManager: 获取新数据失败', error);
      throw error;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private refreshInBackground(): void {
    if (this.isRefreshing) {
      return;
    }

    setTimeout(async () => {
      try {
        await this.fetchFreshData();
      } catch (error) {
        console.warn('BookingDataManager: 后台刷新失败', error);
      }
    }, 100);
  }

  private async getFallbackCachedData(): Promise<CachedBookingData | null> {
    return await this.cacheManager.getCachedBookingData();
  }

  async clearCache(): Promise<void> {
    console.log('BookingDataManager: 清除缓存');
    await this.cacheManager.clearBookingCache();
  }

  getDataExpiryInfo(data: BookingData) {
    return ExpiryHandler.checkDataExpiry(data);
  }
}