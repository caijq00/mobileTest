import { BookingData } from '../types/booking.types';
import bookingData from '../data/booking.json';

interface BookingServiceConfig {
  defaultExpiryDuration: number;
  refreshThreshold: number;
  maxRetries: number;
  retryDelay: number;
}

interface DataValidityInfo {
  isValid: boolean;
  needsRefresh: boolean;
  timeUntilExpiry: number;
  expiryTime: number;
}

export class BookingService {
  private static instance: BookingService;
  private cachedData: BookingData | null = null;
  private lastFetchTime: number = 0;
  private config: BookingServiceConfig = {
    defaultExpiryDuration: 3600,
    refreshThreshold: 300,
    maxRetries: 3,
    retryDelay: 1000
  };
  
  static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService();
    }
    return BookingService.instance;
  }

  async fetchBookingData(): Promise<BookingData> {
    return this.fetchDataWithRetry();
  }

  async refreshBookingData(): Promise<BookingData> {
    this.invalidateCache();
    return this.fetchDataWithRetry();
  }

  async getValidBookingData(): Promise<BookingData> {
    const validityInfo = this.checkDataValidity();
    
    if (this.cachedData && validityInfo.isValid && !validityInfo.needsRefresh) {
      return this.cachedData;
    }
    
    if (this.cachedData && validityInfo.isValid && validityInfo.needsRefresh) {
      this.refreshInBackground();
      return this.cachedData;
    }
    
    return this.fetchBookingData();
  }

  checkDataValidity(data?: BookingData): DataValidityInfo {
    const targetData = data || this.cachedData;
    
    if (!targetData) {
      return {
        isValid: false,
        needsRefresh: true,
        timeUntilExpiry: 0,
        expiryTime: 0
      };
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const expiryTime = parseInt(targetData.expiryTime);
    const timeUntilExpiry = expiryTime - currentTime;
    const isValid = timeUntilExpiry > 0;
    const needsRefresh = timeUntilExpiry <= this.config.refreshThreshold;

    return {
      isValid,
      needsRefresh,
      timeUntilExpiry,
      expiryTime
    };
  }

  setConfig(config: Partial<BookingServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): BookingServiceConfig {
    return { ...this.config };
  }

  private async fetchDataWithRetry(retryCount: number = 0, preserveExpiryTime: boolean = false): Promise<BookingData> {
    return new Promise((resolve, reject) => {
      const timeout = Math.random() * 2000 + 1000;
      
      setTimeout(async () => {
        try {
          if (Math.random() > 0.1) {
            const currentTime = Math.floor(Date.now() / 1000);
            
            // 如果要保持现有过期时间且有缓存数据，使用原过期时间
            let expiryTime: string;
            if (preserveExpiryTime && this.cachedData) {
              expiryTime = this.cachedData.expiryTime;
            } else {
              // 只有在没有缓存数据或强制刷新时才设置新的过期时间
              expiryTime = String(currentTime + this.config.defaultExpiryDuration);
            }
            
            const dataWithExpiry = {
              ...bookingData,
              expiryTime: expiryTime
            };
            
            this.cachedData = dataWithExpiry as BookingData;
            this.lastFetchTime = Date.now();
            
            resolve(dataWithExpiry as BookingData);
          } else {
            throw new Error('网络请求失败');
          }
        } catch (error) {
          if (retryCount < this.config.maxRetries) {
            console.log(`BookingService: 重试第 ${retryCount + 1} 次`);
            setTimeout(() => {
              this.fetchDataWithRetry(retryCount + 1, preserveExpiryTime)
                .then(resolve)
                .catch(reject);
            }, this.config.retryDelay * (retryCount + 1));
          } else {
            reject(new Error(`服务器错误，已重试 ${this.config.maxRetries} 次`));
          }
        }
      }, timeout);
    });
  }

  private refreshInBackground(): void {
    setTimeout(async () => {
      try {
        console.log('BookingService: 后台刷新数据');
        // 后台刷新时保持现有的过期时间
        await this.fetchDataWithRetry(0, true);
      } catch (error) {
        console.warn('BookingService: 后台刷新失败', error);
      }
    }, 100);
  }

  private invalidateCache(): void {
    this.cachedData = null;
    this.lastFetchTime = 0;
  }

  getCachedData(): BookingData | null {
    return this.cachedData;
  }

  getLastFetchTime(): number {
    return this.lastFetchTime;
  }
}