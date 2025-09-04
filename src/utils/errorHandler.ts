export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  DATA_EXPIRED = 'DATA_EXPIRED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

export class BookingError extends Error {
  public type: ErrorType;
  public timestamp: number;

  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN_ERROR) {
    super(message);
    this.name = 'BookingError';
    this.type = type;
    this.timestamp = Date.now();
  }
}

export class ErrorHandler {
  static handleError(error: unknown): BookingError {
    if (error instanceof BookingError) {
      return error;
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('network') || message.includes('fetch')) {
        return new BookingError(error.message, ErrorType.NETWORK_ERROR);
      }
      
      if (message.includes('cache') || message.includes('storage')) {
        return new BookingError(error.message, ErrorType.CACHE_ERROR);
      }
      
      if (message.includes('expired')) {
        return new BookingError(error.message, ErrorType.DATA_EXPIRED);
      }
      
      return new BookingError(error.message, ErrorType.UNKNOWN_ERROR);
    }

    return new BookingError('发生未知错误', ErrorType.UNKNOWN_ERROR);
  }

  static getErrorMessage(error: BookingError): string {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        return '网络连接失败，请检查网络设置';
      case ErrorType.CACHE_ERROR:
        return '缓存读取失败，数据可能需要重新加载';
      case ErrorType.DATA_EXPIRED:
        return '数据已过期，请刷新获取最新信息';
      case ErrorType.SERVICE_UNAVAILABLE:
        return '服务暂时不可用，请稍后重试';
      default:
        return error.message || '发生未知错误';
    }
  }

  static shouldRetry(error: BookingError): boolean {
    return [
      ErrorType.NETWORK_ERROR,
      ErrorType.SERVICE_UNAVAILABLE
    ].includes(error.type);
  }

  static getRetryDelay(attemptCount: number): number {
    return Math.min(1000 * Math.pow(2, attemptCount), 10000);
  }
}