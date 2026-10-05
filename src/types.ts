export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Wallet {
  balance: number;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  balanceAfter: number;
  description: string;
  referenceType: 'order' | 'number_rental' | 'email_extension' | 'admin_adjustment' | 'bonus';
  referenceId?: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

export interface Package {
  id: string;
  name: string;
  credits: number;
  priceUsd: number;
  bonusCredits: number;
  isPopular?: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface TemporaryEmail {
  id: string;
  userId: string;
  address: string;
  username: string;
  domain: string;
  expiresAt: string;
  createdAt: string;
  isExtended: boolean;
  tag?: string;
}

export interface EmailMessage {
  id: string;
  emailId: string;
  sender: string;
  senderName: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  otpCode?: string;
  receivedAt: string;
  isRead: boolean;
}

export interface TemporaryPhoneNumber {
  id: string;
  userId: string;
  number: string;
  countryCode: string;
  countryName: string;
  countryPrefix: string;
  serviceCode: string;
  serviceName: string;
  provider: string;
  costCredits: number;
  expiresAt: string;
  status: 'active' | 'expired' | 'released' | 'completed';
  createdAt: string;
}

export interface SMSMessage {
  id: string;
  phoneId: string;
  sender: string;
  text: string;
  otpCode?: string;
  receivedAt: string;
}

export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  prefix: string;
  isEnabled: boolean;
  baseCreditCost: number;
  availableNumbersCount: number;
}

export interface ServiceConfig {
  code: string;
  name: string;
  category: string;
  creditCost: number;
  isPopular: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  category: 'billing' | 'service' | 'sms_issue' | 'email_issue' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: 'user' | 'admin';
  senderName: string;
  message: string;
  createdAt: string;
}

export interface ProviderConfig {
  id: string;
  type: 'sms' | 'email';
  providerName: string;
  label: string;
  apiKey: string;
  apiEndpoint: string;
  isDefault: boolean;
  isEnabled: boolean;
  priority: number;
  settingsJson: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  resource: string;
  ipAddress: string;
  details: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeEmails: number;
  activePhones: number;
  totalSmsReceived: number;
  totalEmailsReceived: number;
  totalOrdersCompleted: number;
  totalRevenueUsd: number;
  openTickets: number;
}
