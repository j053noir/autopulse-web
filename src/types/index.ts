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
  endTime: string;
  imageUrl: string;
}
