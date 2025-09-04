export interface Location {
  code: string;
  displayName: string;
  url: string;
}

export interface OriginAndDestinationPair {
  destination: Location;
  destinationCity: string;
  origin: Location;
  originCity: string;
}

export interface Segment {
  id: number;
  originAndDestinationPair: OriginAndDestinationPair;
}

export interface BookingData {
  shipReference: string;
  shipToken: string;
  canIssueTicketChecking: boolean;
  expiryTime: string;
  duration: number;
  segments: Segment[];
}

export interface CachedBookingData {
  data: BookingData;
  cachedAt: number;
  expiryTime: number;
}

export interface DataManagerResult<T> {
  data: T | null;
  error?: Error;
  isLoading: boolean;
  isFromCache: boolean;
}