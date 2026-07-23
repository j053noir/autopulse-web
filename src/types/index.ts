export interface User {
  id: string;
  email: string;
  userName: string;
  permissions: string[];
}

export interface AuthDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  currentBid: number;
  currency: string;
  endTime: string;
  imageUrl: string;
  year?: number;
  mileage?: number;
  vin?: string;
  marquee?: string;
  model?: string;
  lastBidderName?: string;
  isActive?: boolean;
  vehicleTitle?: string;
  vehicleBasePrice?: number;
  minimumBidIncrement?: number;
  category?: string;
  documentStorageKey?: string;
}

export interface BidDto {
  id: string;
  bidderName: string;
  amount: number;
  currencyCode: string;
  createdAt: string;
}

export interface AuctionDashboardDto {
  id: string;
  title: string;
  startingPrice: number;
  startingCurrency: string;
  historicBids: BidDto[];
}

export interface CreateAuctionCommand {
  vin: string;
  marquee: string;
  model: string;
  year: number;
  margin?: number;
  mileage: number;
  title?: string;
  basePrice?: number;
  minimumBidIncrement?: number;
  category?: string;
  documentStorageKey?: string;
  auctioneerId?: string; // Seteado por claims en backend
  startingPrice: number;
  currency: string;
  endTime: string;
  idempotencyKey: string;
}

export interface PreSignedUrlResponseDto {
  uploadUrl: string;
  storageKey: string;
}

export interface CreateAuctionBidCommand {
  auctionId?: string; // Seteado desde la ruta en backend
  auctioneerId?: string; // Seteado por claims en backend
  amount: number;
  currency: string;
  idempotencyKey: string;
}

export interface TelemetryBenchmarkResult {
  iterations: number;
  naive: {
    timeMs: number;
    gen0Collections: number;
    gen1Collections: number;
    gen2Collections: number;
  };
  span: {
    timeMs: number;
    gen0Collections: number;
    gen1Collections: number;
    gen2Collections: number;
  };
  improvement: {
    timeSavingPercent: number;
    garbageReductionPercent: number;
  };
}

export interface UserBid {
  bidId: string;
  auctionId: string;
  vehicleName: string;
  bidAmount: number;
  currency: string;
  bidDate: string;
  currentAuctionPrice: number;
  isAuctionActive: boolean;
}
