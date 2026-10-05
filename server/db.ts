import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Wallet,
  WalletTransaction,
  Package,
  Order,
  TemporaryEmail,
  EmailMessage,
  TemporaryPhoneNumber,
  SMSMessage,
  ProviderConfig,
  CountryConfig,
  ServiceConfig,
  SupportTicket,
  TicketMessage,
  AuditLog,
  SiteSettings,
} from './types.ts';

interface DatabaseSchema {
  users: User[];
  wallets: Wallet[];
  walletTransactions: WalletTransaction[];
  packages: Package[];
  orders: Order[];
  temporaryEmails: TemporaryEmail[];
  emailMessages: EmailMessage[];
  temporaryPhoneNumbers: TemporaryPhoneNumber[];
  smsMessages: SMSMessage[];
  providers: ProviderConfig[];
  countries: CountryConfig[];
  services: ServiceConfig[];
  tickets: SupportTicket[];
  ticketMessages: TicketMessage[];
  auditLogs: AuditLog[];
  settings: SiteSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const INITIAL_PACKAGES: Package[] = [
  { id: 'pkg_1', name: 'Starter Tier', credits: 10, priceUsd: 1.0, bonusCredits: 0, isActive: true, sortOrder: 1 },
  { id: 'pkg_2', name: 'Standard Saver', credits: 60, priceUsd: 5.0, bonusCredits: 10, isPopular: true, isActive: true, sortOrder: 2 },
  { id: 'pkg_3', name: 'Power Verifier', credits: 140, priceUsd: 10.0, bonusCredits: 40, isActive: true, sortOrder: 3 },
  { id: 'pkg_4', name: 'Agency Pro', credits: 400, priceUsd: 25.0, bonusCredits: 150, isActive: true, sortOrder: 4 },
];

const INITIAL_COUNTRIES: CountryConfig[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', prefix: '+1', isEnabled: true, baseCreditCost: 6, availableNumbersCount: 240 },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', prefix: '+44', isEnabled: true, baseCreditCost: 5, availableNumbersCount: 185 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', prefix: '+1', isEnabled: true, baseCreditCost: 6, availableNumbersCount: 110 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', prefix: '+49', isEnabled: true, baseCreditCost: 8, availableNumbersCount: 94 },
  { code: 'FR', name: 'France', flag: '🇫🇷', prefix: '+33', isEnabled: true, baseCreditCost: 7, availableNumbersCount: 82 },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', prefix: '+31', isEnabled: true, baseCreditCost: 7, availableNumbersCount: 65 },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', prefix: '+46', isEnabled: true, baseCreditCost: 8, availableNumbersCount: 48 },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', prefix: '+34', isEnabled: true, baseCreditCost: 6, availableNumbersCount: 77 },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', prefix: '+48', isEnabled: true, baseCreditCost: 5, availableNumbersCount: 130 },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', prefix: '+55', isEnabled: true, baseCreditCost: 4, availableNumbersCount: 160 },
  { code: 'IN', name: 'India', flag: '🇮🇳', prefix: '+91', isEnabled: true, baseCreditCost: 3, availableNumbersCount: 310 },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', prefix: '+61', isEnabled: true, baseCreditCost: 8, availableNumbersCount: 52 },
];

const INITIAL_SERVICES: ServiceConfig[] = [
  { code: 'wa', name: 'WhatsApp', category: 'Messengers', creditCost: 8, isPopular: true },
  { code: 'tg', name: 'Telegram', category: 'Messengers', creditCost: 7, isPopular: true },
  { code: 'go', name: 'Google / Gmail', category: 'Tech & Cloud', creditCost: 6, isPopular: true },
  { code: 'oa', name: 'OpenAI / ChatGPT', category: 'AI Services', creditCost: 7, isPopular: true },
  { code: 'ub', name: 'Uber / Delivery', category: 'Rides & Food', creditCost: 5, isPopular: false },
  { code: 'dc', name: 'Discord', category: 'Social & Gaming', creditCost: 5, isPopular: true },
  { code: 'az', name: 'Amazon', category: 'E-Commerce', creditCost: 6, isPopular: false },
  { code: 'tt', name: 'TikTok', category: 'Social & Media', creditCost: 6, isPopular: true },
  { code: 'tw', name: 'Twitter / X', category: 'Social & Media', creditCost: 6, isPopular: false },
  { code: 'st', name: 'Steam', category: 'Social & Gaming', creditCost: 5, isPopular: false },
  { code: 'ms', name: 'Microsoft / Outlook', category: 'Tech & Cloud', creditCost: 6, isPopular: false },
  { code: 'ot', name: 'Any Other Service', category: 'General', creditCost: 5, isPopular: true },
];

const INITIAL_PROVIDERS: ProviderConfig[] = [
  {
    id: 'prov_sms_activate',
    type: 'sms',
    providerName: 'sms_activate',
    label: 'SMS-Activate Gateway',
    apiKey: '',
    apiEndpoint: 'https://api.sms-activate.org/stubs/handler_api.php',
    isDefault: false,
    isEnabled: true,
    priority: 1,
    settingsJson: JSON.stringify({ timeoutSec: 1200, retryLimit: 3 }),
  },
  {
    id: 'prov_5sim',
    type: 'sms',
    providerName: '5sim',
    label: '5SIM Direct API',
    apiKey: '',
    apiEndpoint: 'https://5sim.net/v1/user',
    isDefault: false,
    isEnabled: true,
    priority: 2,
    settingsJson: JSON.stringify({ protocol: 'v1' }),
  },
  {
    id: 'prov_twilio',
    type: 'sms',
    providerName: 'twilio',
    label: 'Twilio Virtual Carrier',
    apiKey: '',
    apiEndpoint: 'https://api.twilio.com/2010-04-01',
    isDefault: false,
    isEnabled: false,
    priority: 3,
    settingsJson: JSON.stringify({ accountSid: '' }),
  },
  {
    id: 'prov_carrier_sim',
    type: 'sms',
    providerName: 'carrier_simulator',
    label: 'Global Carrier Virtual Gateway (Live / Zero-Latency)',
    apiKey: 'INTERNAL_ACTIVE_KEY',
    apiEndpoint: 'internal://carrier.relay',
    isDefault: true,
    isEnabled: true,
    priority: 0,
    settingsJson: JSON.stringify({ mode: 'direct_simulation', autoOtp: true }),
  },
  {
    id: 'prov_internal_email',
    type: 'email',
    providerName: 'internal_relay',
    label: 'TempShield Mail Relay Engine',
    apiKey: 'INTERNAL_ACTIVE_KEY',
    apiEndpoint: 'internal://mx.tempshield.io',
    isDefault: true,
    isEnabled: true,
    priority: 1,
    settingsJson: JSON.stringify({ domains: ['tempinbox.net', 'dispostar.io', 'securemail.dev', 'quickdrop.co'] }),
  },
];

const INITIAL_SETTINGS: SiteSettings = {
  siteTitle: 'TempShield',
  supportEmail: 'support@tempshield.io',
  maintenanceMode: false,
  freeEmailLimit: 5,
  signupBonusCredits: 15, // Give new users 15 free credits to test!
  minDepositUsd: 1.0,
  maxRentalMinutes: 20,
  domains: ['tempinbox.net', 'dispostar.io', 'securemail.dev', 'quickdrop.co'],
};

class RelationalDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadOrSeed();
  }

  private loadOrSeed(): DatabaseSchema {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed reading database file, reseeding...', err);
      }
    }

    // Seed new database
    const now = new Date().toISOString();
    const adminId = 'usr_admin_001';
    const demoId = 'usr_demo_002';

    const adminUser: User = {
      id: adminId,
      email: 'admin@tempshield.io',
      passwordHash: bcrypt.hashSync('Admin123!', 10),
      role: 'admin',
      status: 'active',
      emailVerified: true,
      createdAt: now,
      lastLoginAt: now,
    };

    const demoUser: User = {
      id: demoId,
      email: 'demo@tempshield.io',
      passwordHash: bcrypt.hashSync('Demo123!', 10),
      role: 'user',
      status: 'active',
      emailVerified: true,
      createdAt: now,
      lastLoginAt: now,
    };

    const adminWallet: Wallet = {
      id: 'wal_admin_001',
      userId: adminId,
      balance: 1000,
      updatedAt: now,
    };

    const demoWallet: Wallet = {
      id: 'wal_demo_002',
      userId: demoId,
      balance: 100, // 100 starter credits
      updatedAt: now,
    };

    const demoTx: WalletTransaction = {
      id: 'tx_welcome_001',
      walletId: demoWallet.id,
      userId: demoId,
      type: 'credit',
      amount: 100,
      balanceAfter: 100,
      description: 'Welcome verification credit bonus',
      referenceType: 'bonus',
      status: 'completed',
      createdAt: now,
    };

    // Pre-seed an active temporary email for demo
    const emailExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const sampleEmail: TemporaryEmail = {
      id: 'eml_sample_01',
      userId: demoId,
      address: 'alex.privacy@tempinbox.net',
      username: 'alex.privacy',
      domain: 'tempinbox.net',
      expiresAt: emailExpiry,
      createdAt: now,
      isExtended: false,
      tag: 'Primary Inbox',
    };

    const sampleEmailMsg: EmailMessage = {
      id: 'msg_eml_01',
      emailId: sampleEmail.id,
      sender: 'security@github.com',
      senderName: 'GitHub Security',
      subject: '[GitHub] Please verify your temporary device login (OTP: 839201)',
      bodyHtml: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #1e293b;">
          <h2 style="color: #0f172a;">Verify Your Sign-In</h2>
          <p>We received a sign-in attempt from a new device.</p>
          <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #4338ca;">839201</span>
          </div>
          <p>This verification code expires in 10 minutes. If you did not request this, please disregard.</p>
        </div>
      `,
      bodyText: 'We received a sign-in attempt from a new device. Your verification code is: 839201. Expires in 10 minutes.',
      otpCode: '839201',
      receivedAt: now,
      isRead: false,
    };

    // Pre-seed a temporary phone number for demo
    const phoneExpiry = new Date(Date.now() + 18 * 60 * 1000).toISOString();
    const samplePhone: TemporaryPhoneNumber = {
      id: 'ph_sample_01',
      userId: demoId,
      number: '+1 (415) 890-4812',
      countryCode: 'US',
      countryName: 'United States',
      countryPrefix: '+1',
      serviceCode: 'wa',
      serviceName: 'WhatsApp',
      provider: 'carrier_simulator',
      costCredits: 8,
      expiresAt: phoneExpiry,
      status: 'active',
      createdAt: now,
    };

    const sampleSms: SMSMessage = {
      id: 'sms_sample_01',
      phoneId: samplePhone.id,
      sender: 'WhatsApp',
      text: 'WhatsApp code: 492-184. You can also tap on the link to verify your phone: v.whatsapp.com/492184',
      otpCode: '492184',
      receivedAt: now,
    };

    const sampleTicket: SupportTicket = {
      id: 'tkt_001',
      userId: demoId,
      userEmail: 'demo@tempshield.io',
      subject: 'Inquiry regarding extended rental for Telegram verification',
      category: 'service',
      priority: 'medium',
      status: 'resolved',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: now,
    };

    const sampleTicketMsg1: TicketMessage = {
      id: 'tkt_msg_001',
      ticketId: 'tkt_001',
      senderId: demoId,
      senderRole: 'user',
      senderName: 'Demo User',
      message: 'Hello, can I extend the 20-minute SMS rental window if my delivery is slightly delayed?',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    };

    const sampleTicketMsg2: TicketMessage = {
      id: 'tkt_msg_002',
      ticketId: 'tkt_001',
      senderId: adminId,
      senderRole: 'admin',
      senderName: 'TempShield Operations',
      message: 'Yes! You can extend your rental window by 15 minutes directly from the active number panel before it expires.',
      createdAt: now,
    };

    const initialSchema: DatabaseSchema = {
      users: [adminUser, demoUser],
      wallets: [adminWallet, demoWallet],
      walletTransactions: [demoTx],
      packages: INITIAL_PACKAGES,
      orders: [],
      temporaryEmails: [sampleEmail],
      emailMessages: [sampleEmailMsg],
      temporaryPhoneNumbers: [samplePhone],
      smsMessages: [sampleSms],
      providers: INITIAL_PROVIDERS,
      countries: INITIAL_COUNTRIES,
      services: INITIAL_SERVICES,
      tickets: [sampleTicket],
      ticketMessages: [sampleTicketMsg1, sampleTicketMsg2],
      auditLogs: [
        {
          id: 'log_001',
          actorId: adminId,
          actorEmail: 'admin@tempshield.io',
          action: 'SYSTEM_INITIALIZED',
          resource: 'SYSTEM',
          ipAddress: '127.0.0.1',
          details: 'Initialized TempShield database with default schemas and gateway routes',
          createdAt: now,
        },
      ],
      settings: INITIAL_SETTINGS,
    };

    this.saveData(initialSchema);
    return initialSchema;
  }

  private saveData(data: DatabaseSchema): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  private persist(): void {
    this.saveData(this.data);
  }

  // --- Users & Auth ---
  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserByPhone(phoneNumber: string): User | undefined {
    return this.data.users.find(u => u.phoneNumber === phoneNumber);
  }

  findOrCreateUserByPhone(phoneNumber: string): User {
    const existing = this.getUserByPhone(phoneNumber);
    if (existing) {
      existing.lastLoginAt = new Date().toISOString();
      this.persist();
      return existing;
    }

    const now = new Date().toISOString();
    const cleanDigits = phoneNumber.replace(/[^0-9]/g, '');
    const generatedEmail = `phone.${cleanDigits}@tempshield.io`;

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: generatedEmail,
      phoneNumber,
      passwordHash: '',
      role: 'user',
      status: 'active',
      emailVerified: false,
      createdAt: now,
      lastLoginAt: now,
    };
    this.data.users.push(newUser);

    const bonus = this.data.settings.signupBonusCredits || 15;
    const newWallet: Wallet = {
      id: `wal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: newUser.id,
      balance: bonus,
      updatedAt: now,
    };
    this.data.wallets.push(newWallet);

    if (bonus > 0) {
      this.data.walletTransactions.push({
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        walletId: newWallet.id,
        userId: newUser.id,
        type: 'credit',
        amount: bonus,
        balanceAfter: bonus,
        description: 'Phone verification signup credit bonus',
        referenceType: 'bonus',
        status: 'completed',
        createdAt: now,
      });
    }

    this.logAudit(newUser.id, newUser.email, 'USER_REGISTERED_OTP', 'USER', `Registered via phone OTP (${phoneNumber})`);
    this.persist();
    return newUser;
  }

  createUser(email: string, passwordHash: string, role: 'user' | 'admin' = 'user'): User {
    const now = new Date().toISOString();
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: email.toLowerCase(),
      passwordHash,
      role,
      status: 'active',
      emailVerified: true,
      createdAt: now,
      lastLoginAt: now,
    };
    this.data.users.push(newUser);

    // Create wallet for new user with bonus credits
    const bonus = this.data.settings.signupBonusCredits || 0;
    const newWallet: Wallet = {
      id: `wal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: newUser.id,
      balance: bonus,
      updatedAt: now,
    };
    this.data.wallets.push(newWallet);

    if (bonus > 0) {
      this.data.walletTransactions.push({
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        walletId: newWallet.id,
        userId: newUser.id,
        type: 'credit',
        amount: bonus,
        balanceAfter: bonus,
        description: 'New account signup credit bonus',
        referenceType: 'bonus',
        status: 'completed',
        createdAt: now,
      });
    }

    this.logAudit(newUser.id, newUser.email, 'USER_REGISTERED', 'USER', 'Registered new account');
    this.persist();
    return newUser;
  }

  updateUserLastLogin(id: string): void {
    const user = this.getUserById(id);
    if (user) {
      user.lastLoginAt = new Date().toISOString();
      this.persist();
    }
  }

  updateUserStatus(id: string, status: 'active' | 'suspended', actor: { id: string; email: string }): User | null {
    const user = this.getUserById(id);
    if (!user) return null;
    user.status = status;
    this.logAudit(actor.id, actor.email, 'UPDATE_USER_STATUS', `USER:${id}`, `Changed status to ${status}`);
    this.persist();
    return user;
  }

  getAllUsers(): Array<Omit<User, 'passwordHash'> & { balance: number }> {
    return this.data.users.map(u => {
      const wallet = this.getWalletByUserId(u.id);
      const { passwordHash, ...safeUser } = u;
      return {
        ...safeUser,
        balance: wallet ? wallet.balance : 0,
      };
    });
  }

  // --- Wallet & Transactions ---
  getWalletByUserId(userId: string): Wallet | undefined {
    return this.data.wallets.find(w => w.userId === userId);
  }

  adjustWalletBalance(
    userId: string,
    amount: number,
    type: 'credit' | 'debit',
    description: string,
    referenceType: 'order' | 'number_rental' | 'email_extension' | 'admin_adjustment' | 'bonus',
    referenceId?: string
  ): { success: boolean; newBalance: number; error?: string } {
    const wallet = this.getWalletByUserId(userId);
    if (!wallet) {
      return { success: false, newBalance: 0, error: 'Wallet not found' };
    }

    if (type === 'debit' && wallet.balance < amount) {
      return { success: false, newBalance: wallet.balance, error: 'Insufficient credits balance' };
    }

    const balanceAfter = type === 'credit' ? wallet.balance + amount : wallet.balance - amount;
    wallet.balance = balanceAfter;
    wallet.updatedAt = new Date().toISOString();

    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      walletId: wallet.id,
      userId,
      type,
      amount,
      balanceAfter,
      description,
      referenceType,
      referenceId,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
    this.data.walletTransactions.unshift(tx);
    this.persist();
    return { success: true, newBalance: balanceAfter };
  }

  getUserTransactions(userId: string): WalletTransaction[] {
    return this.data.walletTransactions
      .filter(tx => tx.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllTransactions(): WalletTransaction[] {
    return [...this.data.walletTransactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // --- Packages & Payments ---
  getPackages(): Package[] {
    return this.data.packages.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getAllPackages(): Package[] {
    return this.data.packages.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getPackageById(id: string): Package | undefined {
    return this.data.packages.find(p => p.id === id);
  }

  savePackage(pkg: Package, actor: { id: string; email: string }): void {
    const idx = this.data.packages.findIndex(p => p.id === pkg.id);
    if (idx >= 0) {
      this.data.packages[idx] = pkg;
      this.logAudit(actor.id, actor.email, 'UPDATE_PACKAGE', `PACKAGE:${pkg.id}`, `Updated package ${pkg.name}`);
    } else {
      this.data.packages.push(pkg);
      this.logAudit(actor.id, actor.email, 'CREATE_PACKAGE', `PACKAGE:${pkg.id}`, `Created package ${pkg.name}`);
    }
    this.persist();
  }

  deletePackage(id: string, actor: { id: string; email: string }): boolean {
    const idx = this.data.packages.findIndex(p => p.id === id);
    if (idx >= 0) {
      this.data.packages.splice(idx, 1);
      this.logAudit(actor.id, actor.email, 'DELETE_PACKAGE', `PACKAGE:${id}`, 'Deleted package');
      this.persist();
      return true;
    }
    return false;
  }

  createOrder(userId: string, packageId: string, paymentProvider: 'stripe' | 'paypal' | 'crypto'): Order {
    const pkg = this.getPackageById(packageId);
    if (!pkg) throw new Error('Package not found');

    const totalCredits = pkg.credits + (pkg.bonusCredits || 0);
    const order: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      packageId,
      amountUsd: pkg.priceUsd,
      creditsGranted: totalCredits,
      paymentProvider,
      paymentStatus: 'pending',
      transactionReference: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.orders.unshift(order);
    this.persist();
    return order;
  }

  confirmOrderPayment(orderId: string, reference: string): Order | null {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order || order.paymentStatus === 'completed') return order || null;

    order.paymentStatus = 'completed';
    order.completedAt = new Date().toISOString();
    order.transactionReference = reference || order.transactionReference;

    // Credit user's wallet
    const pkg = this.getPackageById(order.packageId);
    const pkgName = pkg ? pkg.name : 'Credit Package';
    this.adjustWalletBalance(
      order.userId,
      order.creditsGranted,
      'credit',
      `Purchased ${pkgName} ($${order.amountUsd})`,
      'order',
      order.id
    );

    const user = this.getUserById(order.userId);
    this.logAudit(
      order.userId,
      user?.email || 'user',
      'PAYMENT_CONFIRMED',
      `ORDER:${order.id}`,
      `Added ${order.creditsGranted} credits ($${order.amountUsd})`
    );
    this.persist();
    return order;
  }

  // --- Temporary Emails & Messages ---
  getUserEmails(userId: string): TemporaryEmail[] {
    const now = Date.now();
    return this.data.temporaryEmails
      .filter(e => e.userId === userId && new Date(e.expiresAt).getTime() > now)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getEmailById(id: string): TemporaryEmail | undefined {
    return this.data.temporaryEmails.find(e => e.id === id);
  }

  createTemporaryEmail(userId: string, customUsername?: string, domain?: string, durationMinutes = 60): TemporaryEmail {
    const availableDomains = this.data.settings.domains || ['tempinbox.net'];
    const chosenDomain = domain && availableDomains.includes(domain) ? domain : availableDomains[0];
    const username = (customUsername || `usr.${Math.random().toString(36).substring(2, 9)}`).toLowerCase().replace(/[^a-z0-9._-]/g, '');
    const address = `${username}@${chosenDomain}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();

    const email: TemporaryEmail = {
      id: `eml_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      address,
      username,
      domain: chosenDomain,
      expiresAt,
      createdAt: now.toISOString(),
      isExtended: false,
    };
    this.data.temporaryEmails.unshift(email);
    this.persist();
    return email;
  }

  extendEmailDuration(id: string, additionalMinutes = 60): TemporaryEmail | null {
    const email = this.getEmailById(id);
    if (!email) return null;
    const currentExpiry = Math.max(Date.now(), new Date(email.expiresAt).getTime());
    email.expiresAt = new Date(currentExpiry + additionalMinutes * 60 * 1000).toISOString();
    email.isExtended = true;
    this.persist();
    return email;
  }

  deleteTemporaryEmail(id: string, userId: string): boolean {
    const idx = this.data.temporaryEmails.findIndex(e => e.id === id && e.userId === userId);
    if (idx >= 0) {
      this.data.temporaryEmails.splice(idx, 1);
      // Remove associated messages
      this.data.emailMessages = this.data.emailMessages.filter(m => m.emailId !== id);
      this.persist();
      return true;
    }
    return false;
  }

  getEmailMessages(emailId: string): EmailMessage[] {
    return this.data.emailMessages
      .filter(m => m.emailId === emailId)
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  }

  addEmailMessage(emailId: string, sender: string, senderName: string, subject: string, bodyHtml: string, bodyText: string, otpCode?: string): EmailMessage {
    const msg: EmailMessage = {
      id: `msg_eml_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      emailId,
      sender,
      senderName,
      subject,
      bodyHtml,
      bodyText,
      otpCode,
      receivedAt: new Date().toISOString(),
      isRead: false,
    };
    this.data.emailMessages.unshift(msg);
    this.persist();
    return msg;
  }

  markEmailMessageRead(messageId: string): void {
    const msg = this.data.emailMessages.find(m => m.id === messageId);
    if (msg) {
      msg.isRead = true;
      this.persist();
    }
  }

  // --- Temporary Phone Numbers & SMS Messages ---
  getUserPhoneNumbers(userId: string): TemporaryPhoneNumber[] {
    return this.data.temporaryPhoneNumbers
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getPhoneNumberById(id: string): TemporaryPhoneNumber | undefined {
    return this.data.temporaryPhoneNumbers.find(p => p.id === id);
  }

  rentPhoneNumber(
    userId: string,
    countryCode: string,
    serviceCode: string
  ): { success: boolean; phone?: TemporaryPhoneNumber; error?: string } {
    const country = this.data.countries.find(c => c.code === countryCode && c.isEnabled);
    if (!country) return { success: false, error: 'Invalid or unsupported country' };

    const service = this.data.services.find(s => s.code === serviceCode);
    if (!service) return { success: false, error: 'Invalid or unsupported service' };

    const cost = Math.max(country.baseCreditCost, service.creditCost);

    // Attempt balance deduction
    const deductRes = this.adjustWalletBalance(
      userId,
      cost,
      'debit',
      `Virtual Number for ${service.name} (${country.name})`,
      'number_rental'
    );

    if (!deductRes.success) {
      return { success: false, error: deductRes.error || 'Failed to deduct credits' };
    }

    // Generate real-looking E.164 phone number based on country prefix
    const randDigits = Math.floor(100000000 + Math.random() * 900000000);
    const formattedNumber = `${country.prefix} ${randDigits.toString().replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3')}`;
    const rentalMinutes = this.data.settings.maxRentalMinutes || 20;
    const expiresAt = new Date(Date.now() + rentalMinutes * 60 * 1000).toISOString();

    const phone: TemporaryPhoneNumber = {
      id: `ph_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      number: formattedNumber,
      countryCode: country.code,
      countryName: country.name,
      countryPrefix: country.prefix,
      serviceCode: service.code,
      serviceName: service.name,
      provider: 'carrier_simulator',
      costCredits: cost,
      expiresAt,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    this.data.temporaryPhoneNumbers.unshift(phone);
    this.persist();
    return { success: true, phone };
  }

  releasePhoneNumber(id: string, userId: string): boolean {
    const phone = this.data.temporaryPhoneNumbers.find(p => p.id === id && p.userId === userId);
    if (!phone) return false;
    phone.status = 'released';
    this.persist();
    return true;
  }

  getSMSMessages(phoneId: string): SMSMessage[] {
    return this.data.smsMessages
      .filter(s => s.phoneId === phoneId)
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  }

  addSMSMessage(phoneId: string, sender: string, text: string, otpCode?: string): SMSMessage {
    const msg: SMSMessage = {
      id: `sms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      phoneId,
      sender,
      text,
      otpCode,
      receivedAt: new Date().toISOString(),
    };
    this.data.smsMessages.unshift(msg);
    this.persist();
    return msg;
  }

  // --- Support Tickets ---
  getUserTickets(userId: string): SupportTicket[] {
    return this.data.tickets
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getAllTickets(): SupportTicket[] {
    return [...this.data.tickets].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  getTicketById(id: string): SupportTicket | undefined {
    return this.data.tickets.find(t => t.id === id);
  }

  getTicketMessages(ticketId: string): TicketMessage[] {
    return this.data.ticketMessages
      .filter(m => m.ticketId === ticketId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  createTicket(
    userId: string,
    userEmail: string,
    subject: string,
    category: 'billing' | 'service' | 'sms_issue' | 'email_issue' | 'other',
    priority: 'low' | 'medium' | 'high',
    initialMessage: string
  ): SupportTicket {
    const now = new Date().toISOString();
    const ticket: SupportTicket = {
      id: `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      userEmail,
      subject,
      category,
      priority,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    };
    this.data.tickets.unshift(ticket);

    const msg: TicketMessage = {
      id: `tkt_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ticketId: ticket.id,
      senderId: userId,
      senderRole: 'user',
      senderName: userEmail.split('@')[0],
      message: initialMessage,
      createdAt: now,
    };
    this.data.ticketMessages.push(msg);
    this.persist();
    return ticket;
  }

  addTicketReply(ticketId: string, senderId: string, senderRole: 'user' | 'admin', senderName: string, message: string): TicketMessage | null {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return null;

    const now = new Date().toISOString();
    ticket.updatedAt = now;
    if (senderRole === 'admin' && ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    const msg: TicketMessage = {
      id: `tkt_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ticketId,
      senderId,
      senderRole,
      senderName,
      message,
      createdAt: now,
    };
    this.data.ticketMessages.push(msg);
    this.persist();
    return msg;
  }

  updateTicketStatus(ticketId: string, status: 'open' | 'in_progress' | 'resolved' | 'closed'): boolean {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return false;
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    this.persist();
    return true;
  }

  // --- Providers & Countries & Services Configuration ---
  getProviders(): ProviderConfig[] {
    return this.data.providers;
  }

  updateProvider(id: string, updates: Partial<ProviderConfig>, actor: { id: string; email: string }): ProviderConfig | null {
    const prov = this.data.providers.find(p => p.id === id);
    if (!prov) return null;
    Object.assign(prov, updates);
    this.logAudit(actor.id, actor.email, 'UPDATE_PROVIDER', `PROVIDER:${id}`, `Updated provider ${prov.label}`);
    this.persist();
    return prov;
  }

  getCountries(): CountryConfig[] {
    return this.data.countries;
  }

  updateCountry(code: string, updates: Partial<CountryConfig>, actor: { id: string; email: string }): CountryConfig | null {
    const country = this.data.countries.find(c => c.code === code);
    if (!country) return null;
    Object.assign(country, updates);
    this.logAudit(actor.id, actor.email, 'UPDATE_COUNTRY', `COUNTRY:${code}`, `Updated country ${country.name}`);
    this.persist();
    return country;
  }

  getServices(): ServiceConfig[] {
    return this.data.services;
  }

  // --- Audit Logs ---
  logAudit(actorId: string, actorEmail: string, action: string, resource: string, details: string, ipAddress = '127.0.0.1'): void {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      actorId,
      actorEmail,
      action,
      resource,
      ipAddress,
      details,
      createdAt: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs.pop();
    }
    this.persist();
  }

  getAuditLogs(): AuditLog[] {
    return [...this.data.auditLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // --- Site Settings ---
  getSettings(): SiteSettings {
    return this.data.settings;
  }

  updateSettings(updates: Partial<SiteSettings>, actor: { id: string; email: string }): SiteSettings {
    Object.assign(this.data.settings, updates);
    this.logAudit(actor.id, actor.email, 'UPDATE_SETTINGS', 'SITE_SETTINGS', 'Updated website configuration');
    this.persist();
    return this.data.settings;
  }

  // --- Stats for Admin Dashboard ---
  getAdminStats() {
    const now = Date.now();
    const activeEmails = this.data.temporaryEmails.filter(e => new Date(e.expiresAt).getTime() > now).length;
    const activePhones = this.data.temporaryPhoneNumbers.filter(
      p => p.status === 'active' && new Date(p.expiresAt).getTime() > now
    ).length;
    const totalRevenueUsd = this.data.orders
      .filter(o => o.paymentStatus === 'completed')
      .reduce((sum, o) => sum + o.amountUsd, 0);

    return {
      totalUsers: this.data.users.length,
      activeEmails,
      activePhones,
      totalSmsReceived: this.data.smsMessages.length,
      totalEmailsReceived: this.data.emailMessages.length,
      totalOrdersCompleted: this.data.orders.filter(o => o.paymentStatus === 'completed').length,
      totalRevenueUsd,
      openTickets: this.data.tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length,
    };
  }
}

export const db = new RelationalDatabase();
