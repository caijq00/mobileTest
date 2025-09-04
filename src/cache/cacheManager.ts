import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookingData, CachedBookingData } from '../types/booking.types';

export class CacheManager {
  private static instance: CacheManager;
  private readonly BOOKING_CACHE_KEY = 'booking_data_cache';
  private readonly DEFAULT_CACHE_DURATION = 30 * 60 * 1000; // 30分钟

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  async saveBookingData(data: BookingData, customTTL?: number): Promise<void> {
    try {
      const cachedData: CachedBookingData = {
        data,
        cachedAt: Date.now(),
        expiryTime: Date.now() + (customTTL || this.DEFAULT_CACHE_DURATION),
      };
      
      await AsyncStorage.setItem(
        this.BOOKING_CACHE_KEY,
        JSON.stringify(cachedData)
      );
    } catch (error) {
      console.error('保存缓存数据失败:', error);
      throw new Error('缓存保存失败');
    }
  }

  async getCachedBookingData(): Promise<CachedBookingData | null> {
    try {
      const cachedString = await AsyncStorage.getItem(this.BOOKING_CACHE_KEY);
      
      if (!cachedString) {
        return null;
      }

      const cachedData: CachedBookingData = JSON.parse(cachedString);
      return cachedData;
    } catch (error) {
      console.error('获取缓存数据失败:', error);
      return null;
    }
  }

  async clearBookingCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.BOOKING_CACHE_KEY);
    } catch (error) {
      console.error('清除缓存失败:', error);
      throw new Error('清除缓存失败');
    }
  }

  isCacheExpired(cachedData: CachedBookingData): boolean {
    return Date.now() > cachedData.expiryTime;
  }

  isDataExpired(data: BookingData): boolean {
    const expiryTimestamp = parseInt(data.expiryTime) * 1000;
    return Date.now() > expiryTimestamp;
  }
}