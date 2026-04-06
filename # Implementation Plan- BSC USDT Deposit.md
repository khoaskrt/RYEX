# Implementation Plan: BSC USDT Deposit/Withdraw với Custodial Wallet

## Context

**Tại sao cần feature này:**
Hiện tại ứng dụng RYEX đã có giao diện hoàn chỉnh cho Deposit và Withdraw pages, nhưng đang sử dụng mock data. User không thể:
- Deposit USDT thật vào ví của họ
- Withdraw USDT ra ví bên ngoài
- Xem lịch sử giao dịch thực tế trên blockchain

**Yêu cầu MVP:**
- Hỗ trợ BSC Testnet + USDT (BEP-20 token)
- Custodial wallet: Server quản lý private keys
- Mỗi user có 1 địa chỉ BSC duy nhất
- Tự động detect deposits và credit vào `user_assets`
- Cho phép withdraw với validation và limits

**Outcome mong đợi:**
User có thể deposit USDT testnet từ ví ngoài vào RYEX, số dư cập nhật tự động, và withdraw về ví riêng của họ.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (UI)                            │
│  - DepositModulePage: Hiển thị address + QR code              │
│  - WithdrawModulePage: Form withdraw + validation             │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTP/JSON (Bearer Auth)
┌────────────────▼────────────────────────────────────────────────┐
│                   Next.js API Routes                            │
│  POST /api/v1/wallet/deposit-address                           │
│  GET  /api/v1/wallet/deposit-address                           │
│  POST /api/v1/wallet/withdraw                                  │
│  GET  /api/v1/wallet/transactions                              │
│  GET  /api/v1/wallet/balances                                  │
└────────────────┬────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────┐
│              Business Logic Layer                               │
│  /src/server/wallet/                                           │
│  ├── walletService.js       (deposit/withdraw logic)          │
│  ├── blockchainService.js   (Web3 interactions)               │
│  ├── walletRepository.js    (database queries)                │
│  ├── encryption.js          (AES-256-GCM for keys)            │
│  └── validation.js          (address/amount checks)           │
└────────────────┬────────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐  ┌──────▼─────────────────────────────────────┐
│  PostgreSQL  │  │  Background Services                        │
│  (Supabase)  │  │  /src/server/wallet/depositMonitor.js      │
│              │  │  - Poll BSC every 30s                       │
│  4 tables:   │  │  - Detect USDT deposits                     │
│  - wallets   │  │  - Wait 12 confirmations                    │
│  - txs       │  │  - Auto-credit to user_assets               │
│  - monitor   │  │                                             │
│  - limits    │  │  /src/server/wallet/withdrawProcessor.js    │
└──────────────┘  │  - Process pending withdrawals              │
                  │  - Sign & broadcast transactions            │
                  └────────────────┬────────────────────────────┘
                                   │
                         ┌─────────▼──────────┐
                         │   BSC Testnet      │
                         │   via ethers.js    │
                         │   RPC Provider     │
                         └────────────────────┘
```

---

## Database Schema

### Table 1: `user_wallets`
Lưu địa chỉ BSC và encrypted private key của mỗi user.

```sql
CREATE TABLE public.user_wallets (
  wallet_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES public.users(supa_id) ON DELETE CASCADE,
  chain              TEXT NOT NULL,  -- 'bsc_testnet' hoặc 'bsc_mainnet'
  address            TEXT NOT NULL,  -- BSC address (0x...)
  encrypted_key      TEXT NOT NULL,  -- AES-256-GCM encrypted private key
  iv                 TEXT NOT NULL,  -- Initialization vector for encryption
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at       TIMESTAMPTZ,

  CONSTRAINT user_wallets_user_chain_unique UNIQUE (user_id, chain)
);

CREATE INDEX idx_user_wallets_user_id ON public.user_wallets(user_id);
CREATE INDEX idx_user_wallets_address ON public.user_wallets(address);

-- RLS Policies
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_wallets_select_own ON public.user_wallets
  FOR SELECT USING (auth.uid() = user_id);
```

**Lưu ý security:**
- `encrypted_key` KHÔNG bao giờ được trả về API responses
- Chỉ decrypt trong memory khi cần sign transaction
- IV unique per wallet để tăng security

---

### Table 2: `wallet_transactions`
Track tất cả deposits và withdrawals.

```sql
CREATE TABLE public.wallet_transactions (
  transaction_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES public.users(supa_id) ON DELETE CASCADE,
  wallet_id          UUID NOT NULL REFERENCES public.user_wallets(wallet_id) ON DELETE CASCADE,

  -- Transaction details
  tx_type            TEXT NOT NULL,  -- 'deposit' hoặc 'withdraw'
  symbol             TEXT NOT NULL,  -- 'USDT'
  amount             NUMERIC(36,18) NOT NULL,  -- Số lượng token

  -- Blockchain data
  chain              TEXT NOT NULL,  -- 'bsc_testnet'
  tx_hash            TEXT,           -- Blockchain transaction hash
  from_address       TEXT,           -- Sender address
  to_address         TEXT,           -- Recipient address
  block_number       BIGINT,         -- Block number
  confirmations      INTEGER DEFAULT 0,

  -- Fee & status
  network_fee        NUMERIC(36,18) DEFAULT 0,
  network_fee_symbol TEXT DEFAULT 'BNB',
  status             TEXT NOT NULL,  -- 'pending', 'confirming', 'completed', 'failed'

  -- Metadata
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at       TIMESTAMPTZ,
  completed_at       TIMESTAMPTZ,
  error_message      TEXT,

  CONSTRAINT wallet_transactions_type_check CHECK (tx_type IN ('deposit', 'withdraw')),
  CONSTRAINT wallet_transactions_status_check CHECK (status IN ('pending', 'confirming', 'completed', 'failed'))
);

CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_tx_hash ON public.wallet_transactions(tx_hash);
CREATE INDEX idx_wallet_transactions_status ON public.wallet_transactions(status);

-- RLS
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY wallet_transactions_select_own ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);
```

---

### Table 3: `deposit_monitor_state`
Track block scanning progress cho mỗi wallet.

```sql
CREATE TABLE public.deposit_monitor_state (
  wallet_id          UUID PRIMARY KEY REFERENCES public.user_wallets(wallet_id) ON DELETE CASCADE,
  last_scanned_block BIGINT NOT NULL DEFAULT 0,
  last_scan_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deposit_monitor_updated ON public.deposit_monitor_state(updated_at);
```

---

### Table 4: `withdraw_limits`
Configurable limits per user.

```sql
CREATE TABLE public.withdraw_limits (
  user_id            UUID PRIMARY KEY REFERENCES public.users(supa_id) ON DELETE CASCADE,
  daily_limit_usdt   NUMERIC(18,2) NOT NULL DEFAULT 10000.00,
  per_tx_min_usdt    NUMERIC(18,2) NOT NULL DEFAULT 10.00,
  per_tx_max_usdt    NUMERIC(18,2) NOT NULL DEFAULT 5000.00,
  hourly_tx_limit    INTEGER NOT NULL DEFAULT 5,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## API Endpoints

### 1. POST `/api/v1/wallet/deposit-address`
Tạo hoặc lấy deposit address cho user.

**Auth:** Bearer token (Supabase JWT)

**Request:**
```json
{
  "chain": "bsc_testnet",
  "symbol": "USDT"
}
```

**Response (200):**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "qrCodeDataUrl": "data:image/png;base64,...",
  "network": "BSC Testnet",
  "symbol": "USDT",
  "contractAddress": "0x...",
  "minDeposit": "1.00000000",
  "estimatedArrival": "1-3 phút sau 12 confirmations",
  "createdAt": "2026-04-02T10:30:00Z"
}
```

**Error Codes:**
- `WALLET_UNAUTHORIZED` (401)
- `WALLET_CREATION_FAILED` (500)

---

### 2. GET `/api/v1/wallet/deposit-address`
Retrieve existing deposit address.

**Auth:** Bearer token

**Query params:**
- `chain` (optional): Default `bsc_testnet`

**Response (200):**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "network": "BSC Testnet",
  "createdAt": "2026-04-02T10:30:00Z"
}
```

**Response (404) nếu chưa có wallet:**
```json
{
  "error": {
    "code": "WALLET_NOT_FOUND",
    "message": "No wallet found for this chain"
  }
}
```

---

### 3. POST `/api/v1/wallet/withdraw`
Submit withdrawal request.

**Auth:** Bearer token

**Request:**
```json
{
  "chain": "bsc_testnet",
  "symbol": "USDT",
  "toAddress": "0x123...",
  "amount": "50.00000000",
  "accountType": "funding",
  "network": "bsc_testnet"
}
```

**Validation Rules:**
- Address phải là valid BSC address (checksummed)
- Amount >= `per_tx_min_usdt` (default 10 USDT)
- Amount <= `per_tx_max_usdt` (default 5000 USDT)
- Balance đủ để trừ amount + fee
- Không vượt daily limit
- Không vượt hourly transaction limit
- Không withdraw về chính địa chỉ của mình

**Response (200):**
```json
{
  "transactionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "pending",
  "amount": "50.00000000",
  "networkFee": "0.50000000",
  "receiveAmount": "49.50000000",
  "estimatedTime": "3-10 phút",
  "submittedAt": "2026-04-02T10:45:00Z"
}
```

**Error Codes:**
- `WITHDRAW_INVALID_ADDRESS` (400)
- `WITHDRAW_INSUFFICIENT_BALANCE` (400)
- `WITHDRAW_LIMIT_EXCEEDED` (400)
- `WITHDRAW_AMOUNT_TOO_SMALL` (400)
- `WITHDRAW_AMOUNT_TOO_LARGE` (400)
- `WITHDRAW_RATE_LIMIT` (429)

---

### 4. GET `/api/v1/wallet/transactions`
Fetch transaction history with pagination.

**Auth:** Bearer token

**Query params:**
- `type`: `deposit`, `withdraw`, hoặc `all` (default: `all`)
- `status`: `pending`, `completed`, `failed`, hoặc `all` (default: `all`)
- `limit`: Number (default: 20, max: 100)
- `offset`: Number (default: 0)

**Response (200):**
```json
{
  "transactions": [
    {
      "transactionId": "f47ac10b-...",
      "type": "deposit",
      "symbol": "USDT",
      "amount": "100.00000000",
      "status": "completed",
      "txHash": "0x123...",
      "fromAddress": "0xabc...",
      "toAddress": "0x742d35...",
      "confirmations": 15,
      "blockNumber": 12345678,
      "networkFee": "0.00100000",
      "createdAt": "2026-04-02T08:00:00Z",
      "completedAt": "2026-04-02T08:15:00Z",
      "explorerUrl": "https://testnet.bscscan.com/tx/0x123..."
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0
  }
}
```

---

### 5. GET `/api/v1/wallet/balances`
Fetch real-time on-chain balance (for verification).

**Auth:** Bearer token

**Query params:**
- `chain`: `bsc_testnet` (default)

**Response (200):**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "balances": {
    "BNB": "0.05000000",
    "USDT": "150.00000000"
  },
  "fetchedAt": "2026-04-02T10:50:00Z"
}
```

---

## Critical Files to Implement

### File Structure
```
src/server/wallet/
├── blockchainService.js      # Web3 operations (RPC calls)
├── walletService.js           # Business logic
├── walletRepository.js        # Database queries
├── depositMonitor.js          # Background deposit scanner
├── withdrawProcessor.js       # Background withdraw processor
├── encryption.js              # AES-256-GCM utilities
├── validation.js              # Address/amount validation
└── constants.js               # Network configs, ABIs

src/app/api/v1/wallet/
├── deposit-address/route.js   # POST & GET deposit address
├── withdraw/route.js          # POST withdraw request
├── transactions/route.js      # GET transaction history
├── balances/route.js          # GET on-chain balances
└── qr/route.js                # Generate QR code (optional)

db/migrations/
├── 006_create_user_wallets.sql
├── 007_create_wallet_transactions.sql
├── 008_create_deposit_monitor_state.sql
└── 009_create_withdraw_limits.sql
```

---

### 1. `/src/server/wallet/constants.js`

```javascript
export const CHAINS = {
  BSC_TESTNET: {
    id: 'bsc_testnet',
    name: 'BSC Testnet',
    chainId: 97,
    rpcUrl: process.env.BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545',
    explorerUrl: 'https://testnet.bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
  },
};

export const TOKENS = {
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 18,
    contractAddress: {
      bsc_testnet: process.env.USDT_CONTRACT_ADDRESS_TESTNET || '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
    },
  },
};

export const DEPOSIT_CONFIG = {
  REQUIRED_CONFIRMATIONS: 12,
  POLL_INTERVAL_MS: 30000, // 30 seconds
  MIN_DEPOSIT_AMOUNT: '1.00000000',
};

export const WITHDRAW_CONFIG = {
  MIN_AMOUNT_USDT: 10.0,
  MAX_AMOUNT_USDT: 5000.0,
  DAILY_LIMIT_USDT: 10000.0,
  HOURLY_TX_LIMIT: 5,
  GAS_LIMIT: 100000,
};

// ERC-20 ABI (simplified)
export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
];
```

---

### 2. `/src/server/wallet/encryption.js`

```javascript
import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits

/**
 * Get encryption key from environment (must be 32 bytes hex)
 */
function getEncryptionKey() {
  const key = process.env.WALLET_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('WALLET_ENCRYPTION_KEY not set in environment');
  }
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt private key with AES-256-GCM
 * @param {string} privateKey - Hex private key (with or without 0x prefix)
 * @returns {Object} { encryptedData, iv, authTag }
 */
export function encryptPrivateKey(privateKey) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16); // 128-bit IV
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;

  let encrypted = cipher.update(cleanKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypt private key
 * @param {string} encryptedData - Hex encrypted data
 * @param {string} ivHex - Hex IV
 * @param {string} authTagHex - Hex auth tag
 * @returns {string} Decrypted private key (without 0x prefix)
 */
export function decryptPrivateKey(encryptedData, ivHex, authTagHex) {
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

**Security Notes:**
- Encryption key phải 32 bytes (64 hex chars)
- Generate key: `openssl rand -hex 32`
- Store trong `.env`, NEVER commit to git
- Future: Migrate to AWS KMS or HashiCorp Vault

---

### 3. `/src/server/wallet/validation.js`

```javascript
import { ethers } from 'ethers';

/**
 * Validate Ethereum/BSC address
 */
export function isValidAddress(address) {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Get checksummed address
 */
export function toChecksumAddress(address) {
  if (!isValidAddress(address)) {
    throw new Error('Invalid address');
  }
  return ethers.getAddress(address);
}

/**
 * Validate withdraw amount
 */
export function validateWithdrawAmount(amount, balance, limits) {
  const numAmount = Number.parseFloat(amount);
  const numBalance = Number.parseFloat(balance);

  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, error: 'Invalid amount' };
  }

  if (numAmount < limits.minAmount) {
    return { valid: false, error: `Minimum amount is ${limits.minAmount} USDT` };
  }

  if (numAmount > limits.maxAmount) {
    return { valid: false, error: `Maximum amount is ${limits.maxAmount} USDT` };
  }

  if (numAmount > numBalance) {
    return { valid: false, error: 'Insufficient balance' };
  }

  return { valid: true };
}

/**
 * Check if withdraw to same address
 */
export function isSelfTransfer(fromAddress, toAddress) {
  try {
    const from = toChecksumAddress(fromAddress);
    const to = toChecksumAddress(toAddress);
    return from === to;
  } catch {
    return false;
  }
}
```

---

### 4. `/src/server/wallet/blockchainService.js`

```javascript
import { ethers } from 'ethers';
import { CHAINS, TOKENS, ERC20_ABI } from './constants.js';

/**
 * Get RPC provider for a chain
 */
export function getProvider(chainId) {
  const chain = Object.values(CHAINS).find((c) => c.id === chainId);
  if (!chain) throw new Error(`Unsupported chain: ${chainId}`);

  return new ethers.JsonRpcProvider(chain.rpcUrl);
}

/**
 * Generate new wallet
 */
export function generateWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey, // With 0x prefix
  };
}

/**
 * Get USDT balance for address
 */
export async function getUSDTBalance(chainId, address) {
  const provider = getProvider(chainId);
  const contractAddress = TOKENS.USDT.contractAddress[chainId];

  const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
  const balance = await contract.balanceOf(address);

  return ethers.formatUnits(balance, TOKENS.USDT.decimals);
}

/**
 * Get BNB balance
 */
export async function getBNBBalance(chainId, address) {
  const provider = getProvider(chainId);
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

/**
 * Get current block number
 */
export async function getCurrentBlockNumber(chainId) {
  const provider = getProvider(chainId);
  return await provider.getBlockNumber();
}

/**
 * Get transaction receipt
 */
export async function getTransactionReceipt(chainId, txHash) {
  const provider = getProvider(chainId);
  return await provider.getTransactionReceipt(txHash);
}

/**
 * Send USDT transaction
 */
export async function sendUSDT(chainId, privateKey, toAddress, amount) {
  const provider = getProvider(chainId);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contractAddress = TOKENS.USDT.contractAddress[chainId];

  const contract = new ethers.Contract(contractAddress, ERC20_ABI, wallet);
  const amountWei = ethers.parseUnits(amount, TOKENS.USDT.decimals);

  const tx = await contract.transfer(toAddress, amountWei);
  return tx;
}

/**
 * Estimate gas for USDT transfer
 */
export async function estimateUSDTTransferGas(chainId, fromAddress, toAddress, amount) {
  const provider = getProvider(chainId);
  const contractAddress = TOKENS.USDT.contractAddress[chainId];
  const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);

  const amountWei = ethers.parseUnits(amount, TOKENS.USDT.decimals);
  const gasLimit = await contract.transfer.estimateGas(toAddress, amountWei);

  const feeData = await provider.getFeeData();
  const gasCost = gasLimit * feeData.gasPrice;

  return {
    gasLimit: gasLimit.toString(),
    gasPrice: ethers.formatUnits(feeData.gasPrice, 'gwei'),
    gasCostBNB: ethers.formatEther(gasCost),
  };
}
```

---

### 5. `/src/server/wallet/walletRepository.js`
(Theo pattern của `assetsRepository.js`)

```javascript
import { createClient } from '../../shared/lib/supabase/server.js';
import { encryptPrivateKey, decryptPrivateKey } from './encryption.js';

/**
 * Get or create wallet for user
 */
export async function getOrCreateWallet(userId, chainId, address, privateKey) {
  const supabase = await createClient();

  // Check if wallet exists
  const { data: existing } = await supabase
    .from('user_wallets')
    .select('wallet_id, address, encrypted_key, iv')
    .eq('user_id', userId)
    .eq('chain', chainId)
    .single();

  if (existing) {
    return {
      walletId: existing.wallet_id,
      address: existing.address,
    };
  }

  // Encrypt private key
  const { encryptedData, iv, authTag } = encryptPrivateKey(privateKey);

  // Store combined encrypted_key (data + authTag)
  const encryptedKey = `${encryptedData}:${authTag}`;

  // Insert new wallet
  const { data: wallet, error } = await supabase
    .from('user_wallets')
    .insert({
      user_id: userId,
      chain: chainId,
      address,
      encrypted_key: encryptedKey,
      iv,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    walletId: wallet.wallet_id,
    address: wallet.address,
  };
}

/**
 * Get decrypted private key (USE WITH CAUTION)
 */
export async function getDecryptedPrivateKey(walletId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_wallets')
    .select('encrypted_key, iv')
    .eq('wallet_id', walletId)
    .single();

  if (error || !data) throw new Error('Wallet not found');

  const [encryptedData, authTag] = data.encrypted_key.split(':');
  const privateKey = decryptPrivateKey(encryptedData, data.iv, authTag);

  return `0x${privateKey}`;
}

/**
 * Create transaction record
 */
export async function createTransaction(txData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('wallet_transactions')
    .insert(txData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(txId, updates) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('wallet_transactions')
    .update(updates)
    .eq('transaction_id', txId);

  if (error) throw error;
}

/**
 * Get transactions for user
 */
export async function getUserTransactions(userId, filters = {}) {
  const supabase = await createClient();

  let query = supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (filters.type && filters.type !== 'all') {
    query = query.eq('tx_type', filters.type);
  }

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  const limit = Math.min(filters.limit || 20, 100);
  const offset = filters.offset || 0;

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return { transactions: data, total: count };
}

/**
 * Check withdraw limits
 */
export async function checkWithdrawLimits(userId, amount) {
  const supabase = await createClient();

  // Get user limits
  const { data: limits } = await supabase
    .from('withdraw_limits')
    .select('*')
    .eq('user_id', userId)
    .single();

  const userLimits = limits || {
    daily_limit_usdt: 10000,
    per_tx_min_usdt: 10,
    per_tx_max_usdt: 5000,
    hourly_tx_limit: 5,
  };

  // Check daily total
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentWithdraws } = await supabase
    .from('wallet_transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('tx_type', 'withdraw')
    .gte('created_at', oneDayAgo)
    .in('status', ['pending', 'confirming', 'completed']);

  const dailyTotal = recentWithdraws?.reduce((sum, tx) => sum + parseFloat(tx.amount), 0) || 0;

  if (dailyTotal + parseFloat(amount) > userLimits.daily_limit_usdt) {
    return {
      allowed: false,
      reason: `Daily limit exceeded. Remaining: ${userLimits.daily_limit_usdt - dailyTotal} USDT`,
    };
  }

  // Check hourly tx count
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: hourlyCount } = await supabase
    .from('wallet_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('tx_type', 'withdraw')
    .gte('created_at', oneHourAgo);

  if (hourlyCount >= userLimits.hourly_tx_limit) {
    return {
      allowed: false,
      reason: `Hourly transaction limit reached (${userLimits.hourly_tx_limit} withdrawals/hour)`,
    };
  }

  return { allowed: true, limits: userLimits };
}
```

---

### 6. `/src/app/api/v1/wallet/deposit-address/route.js`

```javascript
import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import QRCode from 'qrcode';
import { createClient } from '../../../../../shared/lib/supabase/server.js';
import { generateWallet, getProvider } from '../../../../../server/wallet/blockchainService.js';
import { getOrCreateWallet } from '../../../../../server/wallet/walletRepository.js';
import { CHAINS, TOKENS } from '../../../../../server/wallet/constants.js';

export const runtime = 'nodejs';

function extractBearerToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return '';
  return authHeader.split('Bearer ')[1];
}

async function verifyUser(request) {
  const token = extractBearerToken(request);
  if (!token) return null;

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error || !user ? null : user;
}

/**
 * POST /api/v1/wallet/deposit-address
 * Create or get deposit address
 */
export async function POST(request) {
  const requestId = crypto.randomUUID();

  try {
    const user = await verifyUser(request);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'WALLET_UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const chainId = body.chain || 'bsc_testnet';

    // Generate wallet if not exists
    const { address: newAddress, privateKey } = generateWallet();
    const { address } = await getOrCreateWallet(user.id, chainId, newAddress, privateKey);

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(address, {
      width: 300,
      margin: 2,
    });

    const chain = CHAINS[chainId.toUpperCase().replace('_', '_')] || CHAINS.BSC_TESTNET;

    return NextResponse.json({
      address,
      qrCodeDataUrl,
      network: chain.name,
      symbol: 'USDT',
      contractAddress: TOKENS.USDT.contractAddress[chainId],
      minDeposit: '1.00000000',
      estimatedArrival: '1-3 phút sau 12 confirmations',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[deposit-address][${requestId}]`, error);
    return NextResponse.json(
      { error: { code: 'WALLET_CREATION_FAILED', message: 'Failed to create wallet' } },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/wallet/deposit-address
 * Get existing deposit address
 */
export async function GET(request) {
  const requestId = crypto.randomUUID();

  try {
    const user = await verifyUser(request);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'WALLET_UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const chainId = url.searchParams.get('chain') || 'bsc_testnet';

    const supabase = await createClient();
    const { data: wallet } = await supabase
      .from('user_wallets')
      .select('address, created_at')
      .eq('user_id', user.id)
      .eq('chain', chainId)
      .single();

    if (!wallet) {
      return NextResponse.json(
        { error: { code: 'WALLET_NOT_FOUND', message: 'No wallet found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      address: wallet.address,
      network: CHAINS.BSC_TESTNET.name,
      createdAt: wallet.created_at,
    });
  } catch (error) {
    console.error(`[deposit-address][${requestId}]`, error);
    return NextResponse.json(
      { error: { code: 'WALLET_FETCH_FAILED', message: 'Failed to fetch wallet' } },
      { status: 500 }
    );
  }
}
```

---

## Implementation Phases

### **Phase 1: Foundation (Week 1)**
**Goal:** Database + encryption + basic wallet generation

Tasks:
1. Create 4 database migrations
2. Implement `encryption.js` with tests
3. Implement `validation.js` with tests
4. Set up environment variables
5. Install dependencies (`ethers`, `qrcode`)

**Verification:**
- [ ] Migrations run successfully
- [ ] Can encrypt/decrypt private key
- [ ] Address validation works

---

### **Phase 2: Deposit Address API (Week 2)**
**Goal:** Users can get deposit addresses

Tasks:
1. Implement `blockchainService.js` (wallet generation, balance checks)
2. Implement `walletRepository.js` (CRUD operations)
3. Implement `constants.js` (network configs)
4. Create API route `POST /api/v1/wallet/deposit-address`
5. Create API route `GET /api/v1/wallet/deposit-address`
6. Update `DepositModulePage.js` to call API and display address + QR

**Verification:**
- [ ] Can generate wallet via API
- [ ] Address + QR code displayed in UI
- [ ] Private key encrypted in database

---

### **Phase 3: Deposit Monitoring (Week 3)**
**Goal:** Auto-detect deposits and credit user_assets

Tasks:
1. Implement `depositMonitor.js`:
   - Poll BSC RPC every 30s
   - Check USDT balance changes
   - Track last scanned block
   - Wait for 12 confirmations
   - Create transaction record
   - Update `user_assets` table
2. Add start script in `package.json`
3. Test with testnet USDT transfers

**Verification:**
- [ ] Monitor detects test deposits
- [ ] Balance updates in `user_assets`
- [ ] Transaction history shows deposit

---

### **Phase 4: Withdrawal API (Week 4)**
**Goal:** Users can submit withdrawals

Tasks:
1. Implement withdrawal validation in `walletService.js`
2. Implement `withdrawProcessor.js`:
   - Process pending withdrawals
   - Decrypt private key
   - Sign transaction
   - Broadcast to BSC
   - Update transaction status
3. Create API route `POST /api/v1/wallet/withdraw`
4. Implement rate limiting middleware
5. Update `WithdrawModulePage.js` to call API

**Verification:**
- [ ] Can submit withdrawal via UI
- [ ] Transaction signed and broadcast
- [ ] Receives USDT in external wallet

---

### **Phase 5: Transaction History (Week 5)**
**Goal:** Display real transaction history

Tasks:
1. Create API route `GET /api/v1/wallet/transactions`
2. Create API route `GET /api/v1/wallet/balances`
3. Update UI to fetch and display real history
4. Add BSCscan links
5. Add pagination

**Verification:**
- [ ] History shows real deposits/withdrawals
- [ ] BSCscan links work
- [ ] Pagination works

---

### **Phase 6: Security & Testing (Week 6)**
**Goal:** Production-ready security

Tasks:
1. Security audit:
   - Review private key handling
   - Test SQL injection vectors
   - Test auth bypass attempts
2. Add rate limiting to all endpoints
3. Add logging and monitoring
4. Load testing (100 concurrent users)
5. Write comprehensive documentation
6. Set up alerts for low gas balance

**Verification:**
- [ ] Security audit passed
- [ ] Load test passed (500 req/min)
- [ ] Documentation complete

---

## Security Best Practices

### Private Key Management
1. **Encryption:** AES-256-GCM with unique IV per wallet
2. **Storage:** Encrypted in PostgreSQL, never in logs
3. **Access:** Decrypt only in memory during signing
4. **Future:** Migrate to AWS KMS or HashiCorp Vault

### API Security
1. **Authentication:** JWT Bearer tokens for all endpoints
2. **RLS:** Row-level security on all tables
3. **Rate limiting:**
   - Deposit address: 10 req/min per user
   - Withdraw: 5 req/hour per user
4. **Input validation:** Strict validation on all inputs

### Transaction Security
1. **Withdrawal validation:**
   - Min/max amounts
   - Daily/hourly limits
   - Address validation
   - Balance checks with pessimistic locking
2. **Confirmations:** 12 blocks before crediting deposits
3. **Gas management:** Dynamic gas estimation with caps

### Operational Security
1. **Monitoring:** Alert on:
   - Failed transactions
   - Low gas wallet balance
   - Unusual withdraw patterns
2. **Logging:** Log all wallet operations (except private keys)
3. **Backup:** Regular encrypted backups of `user_wallets` table
4. **Separation:** Use separate gas wallet for broadcast transactions

---

## Testing Strategy

### Unit Tests
- [ ] Encryption/decryption functions
- [ ] Address validation
- [ ] Amount validation
- [ ] Gas estimation

### Integration Tests
- [ ] Wallet creation flow
- [ ] Deposit detection with mocked RPC
- [ ] Withdrawal submission with mocked blockchain

### Testnet E2E Tests
1. Create wallet via API
2. Send testnet USDT to address
3. Verify deposit detection after 12 blocks
4. Verify `user_assets` updated
5. Submit withdrawal via API
6. Verify USDT received in external wallet

### Load Testing
- 100 concurrent users
- 500 requests/minute
- Monitor response times and error rates

---

## Environment Variables

Add to `.env`:

```bash
# Blockchain
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
USDT_CONTRACT_ADDRESS_TESTNET=0x337610d27c682E347C9cD60BD4b3b107C9d34dDd

# Security (CRITICAL: Generate securely)
WALLET_ENCRYPTION_KEY=<run: openssl rand -hex 32>
GAS_WALLET_PRIVATE_KEY=<testnet wallet for gas fees>

# Configuration
DEPOSIT_MONITOR_INTERVAL_MS=30000
WITHDRAW_MIN_AMOUNT_USDT=10
WITHDRAW_DAILY_LIMIT_USDT=10000
```

---

## Dependencies to Add

```bash
npm install ethers@^6.11.0 qrcode@^1.5.3
```

---

## Future Enhancements (Post-MVP)

1. **Mainnet support:** Add BSC mainnet configuration
2. **Multi-chain:** Support Ethereum, Polygon, Arbitrum
3. **Multi-token:** Support BNB, BUSD, other BEP-20 tokens
4. **KMS integration:** Use AWS KMS for key management
5. **Webhook notifications:** Real-time deposit notifications
6. **Admin panel:** Monitor all wallets and transactions
7. **Manual withdrawal approval:** For large amounts
8. **Address whitelist:** Allow users to whitelist addresses
9. **2FA for withdrawals:** Additional security layer
10. **Blockchain indexer:** Use The Graph or Moralis for faster deposits

---

## Risk Mitigation

### Technical Risks
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Private key compromise | Critical | AES-256-GCM encryption, future KMS migration |
| RPC downtime | High | Retry logic, fallback to multiple RPC providers |
| Blockchain reorg | Medium | Wait 12 confirmations before crediting |
| Gas price spike | Low | Dynamic gas estimation with 20% buffer + max cap |

### Operational Risks
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Monitor crashes | High | PM2 auto-restart, health check endpoint, alerts |
| Gas wallet empty | Medium | Alert when balance < 0.1 BNB |
| Withdrawal stuck | Medium | Manual retry endpoint for admins |
| Database corruption | Critical | Daily encrypted backups to S3 |

---

## Success Criteria

MVP is complete when:
- [ ] User can generate BSC testnet deposit address
- [ ] QR code displayed correctly
- [ ] Test USDT deposit detected within 10 minutes
- [ ] Balance updates in Assets page
- [ ] User can withdraw USDT to external wallet
- [ ] Transaction history shows real data
- [ ] All security checks pass
- [ ] Load test passes (100 concurrent users)

---

## Notes

- **Start with testnet:** Test thoroughly before mainnet
- **Gas wallet:** Create dedicated wallet for gas fees (keep 1 BNB testnet)
- **Backup encryption key:** Store in 1Password/LastPass
- **Monitor closely:** Watch first 10 real user deposits/withdrawals
- **Document everything:** Keep detailed logs for debugging
