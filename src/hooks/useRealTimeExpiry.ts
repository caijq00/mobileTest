import { useState, useEffect } from 'react';
import { BookingData } from '../types/booking.types';
import { ExpiryHandler } from '../utils/expiryHandler';

interface ExpiryInfo {
  isExpired: boolean;
  timeUntilExpiry: number;
  warningThreshold: boolean;
  formattedTime: string;
  formattedRemainingTime: string;
  remainingMinutes: number;
  remainingHours: number;
}

export const useRealTimeExpiry = (data: BookingData | null, updateInterval: number = 1000): ExpiryInfo | null => {
  const [expiryInfo, setExpiryInfo] = useState<ExpiryInfo | null>(null);

  useEffect(() => {
    if (!data) {
      setExpiryInfo(null);
      return;
    }

    const updateExpiryInfo = () => {
      const info = ExpiryHandler.checkDataExpiry(data);
      const formattedTime = ExpiryHandler.formatTimeUntilExpiry(info.timeUntilExpiry);
      const formattedRemainingTime = ExpiryHandler.formatRemainingTime(info.timeUntilExpiry);
      
      // 计算剩余分钟数和小时数
      const remainingMinutes = Math.max(0, Math.floor(info.timeUntilExpiry / (1000 * 60)));
      const remainingHours = Math.max(0, Math.floor(remainingMinutes / 60));
      
      setExpiryInfo({
        ...info,
        formattedTime,
        formattedRemainingTime,
        remainingMinutes,
        remainingHours
      });
    };

    // 立即更新一次
    updateExpiryInfo();

    // 设置定时更新
    const timer = setInterval(updateExpiryInfo, updateInterval);

    return () => {
      clearInterval(timer);
    };
  }, [data, updateInterval]);

  return expiryInfo;
};