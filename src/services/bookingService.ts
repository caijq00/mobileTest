import { BookingData } from '../types/booking.types';

const mockBookingData = {
  "shipReference": "ABCDEF",
  "shipToken": "AAAABBBCCCCDDD",
  "canIssueTicketChecking": false,
  "expiryTime": "1722409261",
  "duration": 2430,
  "segments": [
    {
      "id": 1,
      "originAndDestinationPair": {
        "destination": {
          "code": "BBB",
          "displayName": "BBB DisplayName",
          "url": "www.ship.com"
        },
        "destinationCity": "AAA",
        "origin": {
          "code": "AAA",
          "displayName": "AAA DisplayName",
          "url": "www.ship.com"
        },
        "originCity": "BBB"
      }
    },
    {
      "id": 2,
      "originAndDestinationPair": {
        "destination": {
          "code": "CCC",
          "displayName": "CCC DisplayName",
          "url": "www.ship.com"
        },
        "destinationCity": "CCC",
        "origin": {
          "code": "BBB",
          "displayName": "BBB DisplayName",
          "url": "www.ship.com"
        },
        "originCity": "BBB"
      }
    }
  ]
};

export class BookingService {
  private static instance: BookingService;
  
  static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService();
    }
    return BookingService.instance;
  }

  async fetchBookingData(): Promise<BookingData> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (Math.random() > 0.1) {
            const dataWithCurrentExpiry = {
              ...mockBookingData,
              expiryTime: String(Math.floor(Date.now() / 1000) + 3600)
            };
            resolve(dataWithCurrentExpiry as BookingData);
          } else {
            reject(new Error('网络请求失败'));
          }
        } catch (error) {
          reject(new Error('服务器错误'));
        }
      }, 1000 + Math.random() * 2000);
    });
  }

  async refreshBookingData(): Promise<BookingData> {
    return this.fetchBookingData();
  }
}