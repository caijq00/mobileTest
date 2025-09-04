import { BookingData } from '../types/booking.types';

export class ExpiryHandler {
  static checkDataExpiry(data: BookingData): {
    isExpired: boolean;
    timeUntilExpiry: number;
    warningThreshold: boolean;
  } {
    const expiryTimestamp = parseInt(data.expiryTime) * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTimestamp - currentTime;
    const isExpired = timeUntilExpiry <= 0;
    
    const warningThreshold = timeUntilExpiry < (10 * 60 * 1000);

    return {
      isExpired,
      timeUntilExpiry,
      warningThreshold
    };
  }

  static shouldRefreshData(data: BookingData): boolean {
    const expiryInfo = this.checkDataExpiry(data);
    return expiryInfo.isExpired || expiryInfo.warningThreshold;
  }

  static formatTimeUntilExpiry(timeInMs: number): string {
    if (timeInMs <= 0) {
      return '已过期';
    }

    const minutes = Math.floor(timeInMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}小时${remainingMinutes}分钟后过期`;
    }

    return `${minutes}分钟后过期`;
  }

  static mergeBookingData(cachedData: BookingData, newData: BookingData): BookingData {
    return {
      ...cachedData,
      ...newData,
      segments: this.mergeSegments(cachedData.segments, newData.segments)
    };
  }

  private static mergeSegments(cachedSegments: any[], newSegments: any[]): any[] {
    const segmentMap = new Map();
    
    cachedSegments.forEach(segment => {
      segmentMap.set(segment.id, segment);
    });
    
    newSegments.forEach(segment => {
      segmentMap.set(segment.id, segment);
    });
    
    return Array.from(segmentMap.values()).sort((a, b) => a.id - b.id);
  }
}