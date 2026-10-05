export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number; // credits
  updatedAt: string;
}

export type TransactionType = 'credit' | 'debit';
export type TransactionReference = 'order' | 'number_rental' | 'email_extension' | 'admin_adjustment' | 'bonus';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceType: TransactionReference;
  referenceId?: string;
  status: TransactionStatus;
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

export type PaymentProvider = 'stripe' | 'paypal' | 'crypto';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Order {
  id: string;
  userId: string;
  packageId: string;
  amountUsd: number;
  creditsGranted: number;
  paymentProvider: PaymentProvider;
  paymentStatus: PaymentStatus;
  transactionReference: string;
  createdAt: string;
  completedAt?: string;
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

export type NumberStatus = 'active' | 'expired' | 'released' | 'completed';

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
  status: NumberStatus;
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

export interface ProviderConfig {
  id: string;
  type: 'sms' | 'email';
  providerName: 'sms_activate' | '5sim' | 'twilio' | 'carrier_simulator' | 'mailgun' | 'internal_relay';
  label: string;
  apiKey: string;
  apiEndpoint: string;
  isDefault: boolean;
  isEnabled: boolean;
  priority: number;
  settingsJson: string;
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

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  category: 'billing' | 'service' | 'sms_issue' | 'email_issue' | 'other';
  priority: TicketPriority;
  status: TicketStatus;
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

export interface SiteSettings {
  siteTitle: string;
  supportEmail: string;
  maintenanceMode: boolean;
  freeEmailLimit: number;
  signupBonusCredits: number;
  minDepositUsd: number;
  maxRentalMinutes: number;
  domains: string[];
}
