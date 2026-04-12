export type NodeType = "category" | "intent"
export type NodeStatus = "approved" | "pending"

export interface KBNode {
  id: string
  label: string
  type: NodeType
  category: string
  answer: string
  exampleQueries: string[]
  status: NodeStatus
  hitCount: number
  lastUpdated: string
}

export interface KBEdge {
  id: string
  source: string
  target: string
  type: "hierarchy" | "related"
}

export interface SimNode extends KBNode {
  x: number
  y: number
  vx: number
  vy: number
  pinned: boolean
}

export const CATEGORY_META: Record<string, { color: string; bg: string; label: string }> = {
  "account-login":         { color: "#2E86C1", bg: "#D6EAF8", label: "Account & Login" },
  "transfers-payments":    { color: "#1A5276", bg: "#D0E8F2", label: "Transfers & Payments" },
  "verification-security": { color: "#7D3C98", bg: "#E8DAEF", label: "Verification & Security" },
  "billing-statements":    { color: "#1E8449", bg: "#D5F5E3", label: "Billing & Statements" },
  "technical-app":         { color: "#CA6F1E", bg: "#FAE5D3", label: "Technical & App" },
  "payflow-business":      { color: "#C0392B", bg: "#FADBD8", label: "PayFlow Business" },
  "contact-support":       { color: "#0E6655", bg: "#D1F2EB", label: "Contact & Support" },
}

export const PAYFLOW_NODES: KBNode[] = [
  // ── Categories ──────────────────────────────────────────────────────────────
  {
    id: "account-login", label: "Account & Login", type: "category",
    category: "account-login",
    answer: "Account management, login issues, and profile settings.",
    exampleQueries: [], status: "pending", hitCount: 0, lastUpdated: "2026-03-01",
  },
  {
    id: "transfers-payments", label: "Transfers & Payments", type: "category",
    category: "transfers-payments",
    answer: "Sending money, fees, limits, and payment management.",
    exampleQueries: [], status: "pending", hitCount: 0, lastUpdated: "2026-03-01",
  },
  {
    id: "verification-security", label: "Verification & Security", type: "category",
    category: "verification-security",
    answer: "Identity verification, 2FA, and fraud protection.",
    exampleQueries: [], status: "pending", hitCount: 0, lastUpdated: "2026-03-01",
  },
  {
    id: "billing-statements", label: "Billing & Statements", type: "category",
    category: "billing-statements",
    answer: "Transaction history, statements, and tax information.",
    exampleQueries: [], status: "pending", hitCount: 0, lastUpdated: "2026-03-01",
  },
  {
    id: "technical-app", label: "Technical & App Issues", type: "category",
    category: "technical-app",
    answer: "App troubleshooting, OTP issues, and connectivity.",
    exampleQueries: [], status: "pending", hitCount: 0, lastUpdated: "2026-03-01",
  },
  {
    id: "payflow-business", label: "PayFlow Business", type: "category",
    category: "payflow-business",
    answer: "Business accounts, merchant dashboard, and API access.",
    exampleQueries: [], status: "pending", hitCount: 0, lastUpdated: "2026-03-01",
  },
  {
    id: "contact-support", label: "Contact & Support", type: "category",
    category: "contact-support",
    answer: "How to reach PayFlow support and find kiosks.",
    exampleQueries: [], status: "pending", hitCount: 0, lastUpdated: "2026-03-01",
  },

  // ── Account & Login ──────────────────────────────────────────────────────────
  {
    id: "create-account", label: "Create Account", type: "intent",
    category: "account-login",
    answer: "Download the PayFlow app, tap Sign Up, enter your SA mobile number, verify via 6-digit OTP, then set a password (8+ chars, 1 uppercase, 1 number) and a 5-digit transaction PIN. Your Basic wallet is active immediately with a R1,000 daily limit.",
    exampleQueries: ["How do I create a PayFlow account?", "Sign up for PayFlow", "Register new account"],
    status: "pending", hitCount: 1423, lastUpdated: "2026-03-01",
  },
  {
    id: "password-reset", label: "Password Reset", type: "intent",
    category: "account-login",
    answer: "Tap 'Forgot Password' on the login screen. Enter the email or phone linked to your account. Enter the 6-digit OTP (valid 10 minutes). Create a new password with 8+ chars, 1 uppercase, 1 number. No OTP? Check spam or request again after 60 seconds.",
    exampleQueries: ["How do I reset my password?", "Forgot my password", "Can't log in", "Password not working"],
    status: "pending", hitCount: 2841, lastUpdated: "2026-03-01",
  },
  {
    id: "account-locked", label: "Account Locked", type: "intent",
    category: "account-login",
    answer: "After 5 failed login attempts, your account is locked for 30 minutes. Still unable after the lockout? Use 'Forgot Password'. If locked due to suspicious activity, contact support with your registered email and a photo of your SA ID. Manual unlocks take up to 24 hours.",
    exampleQueries: ["My account is locked", "Can't access my account", "Too many login attempts"],
    status: "pending", hitCount: 987, lastUpdated: "2026-03-01",
  },
  {
    id: "change-contact", label: "Change Contact Details", type: "intent",
    category: "account-login",
    answer: "Go to Settings > Profile > Contact Details. Update your email or phone — the new contact must be verified via OTP. You cannot change both at the same time. No access to your current contacts? Visit a PayFlow kiosk with your ID for in-person verification.",
    exampleQueries: ["Change my email address", "Update my phone number", "Update contact info"],
    status: "pending", hitCount: 612, lastUpdated: "2026-03-01",
  },
  {
    id: "close-account", label: "Close Account", type: "intent",
    category: "account-login",
    answer: "Go to Settings > Account > Close Account. Withdraw your remaining balance to a linked bank account first. Outstanding disputes must be resolved before closure. Closure is processed within 5 business days. Transaction history is retained 90 days for FICA compliance, then permanently deleted. Irreversible.",
    exampleQueries: ["How do I close my account?", "Delete my PayFlow account", "Cancel my account"],
    status: "pending", hitCount: 445, lastUpdated: "2026-03-01",
  },

  // ── Transfers & Payments ─────────────────────────────────────────────────────
  {
    id: "send-money", label: "Send Money", type: "intent",
    category: "transfers-payments",
    answer: "Tap 'Send' in the app. Enter the recipient's PayFlow username, mobile number, or scan their QR code. Enter the amount and confirm with your 5-digit transaction PIN. PayFlow-to-PayFlow transfers are instant and free.",
    exampleQueries: ["How do I send money?", "Transfer money to someone", "Pay a friend"],
    status: "pending", hitCount: 3241, lastUpdated: "2026-03-01",
  },
  {
    id: "fees", label: "Fees & Charges", type: "intent",
    category: "transfers-payments",
    answer: "P2P PayFlow transfers: free. Bank withdrawals: R5 flat fee. Card top-ups: 1.5% of top-up amount. Bill payments: free. International transfers: 2.5% + R15 flat fee. No monthly account fees for any tier.",
    exampleQueries: ["What are your fees?", "How much does it cost?", "Is there a fee?", "PayFlow charges"],
    status: "pending", hitCount: 1876, lastUpdated: "2026-03-01",
  },
  {
    id: "transfer-limits", label: "Transfer Limits", type: "intent",
    category: "transfers-payments",
    answer: "Basic (email only): R1,000/day. Verified (ID uploaded): R10,000/day. Premium (ID + proof of address): R50,000/day. Business accounts: R200,000/day. To upgrade, go to Settings > Verification and submit the required documents. Upgrades processed within 24 hours on business days.",
    exampleQueries: ["What are the transfer limits?", "How much can I send per day?", "Daily limit", "Increase my limit"],
    status: "pending", hitCount: 1234, lastUpdated: "2026-03-01",
  },
  {
    id: "failed-payment", label: "Failed Payment", type: "intent",
    category: "transfers-payments",
    answer: "If a transaction fails but your balance was deducted, the amount auto-reverses within 30 minutes. After 30 minutes, go to Activity > select the transaction > tap 'Report Issue'. Our team resolves it within 24 hours. Keep your TXN- reference number handy.",
    exampleQueries: ["Payment failed but money was taken", "Transaction failed", "Money deducted but not received"],
    status: "pending", hitCount: 2103, lastUpdated: "2026-03-01",
  },
  {
    id: "scheduled-payments", label: "Scheduled Payments", type: "intent",
    category: "transfers-payments",
    answer: "Go to Payments > Scheduled > 'New Schedule'. Set the recipient, amount, frequency (weekly/monthly/custom), and start date. Payments are deducted at 06:00 SAST on the scheduled day. Insufficient balance? Payment fails with a push notification. No fee for scheduling.",
    exampleQueries: ["How to schedule a payment?", "Set up recurring payment", "Automatic payment"],
    status: "pending", hitCount: 567, lastUpdated: "2026-03-01",
  },
  {
    id: "reverse-transfer", label: "Reverse Transfer", type: "intent",
    category: "transfers-payments",
    answer: "PayFlow transfers are instant and cannot be reversed by the sender once confirmed. Contact the recipient directly. If unresponsive, open a dispute: Activity > select transaction > 'Report Issue' > 'Sent to wrong recipient'. PayFlow will mediate but cannot guarantee fund recovery.",
    exampleQueries: ["Can I cancel a transfer?", "Sent money to wrong person", "Reverse a payment"],
    status: "pending", hitCount: 1654, lastUpdated: "2026-03-01",
  },

  // ── Verification & Security ──────────────────────────────────────────────────
  {
    id: "doc-requirements", label: "Document Requirements", type: "intent",
    category: "verification-security",
    answer: "Verified tier: SA ID photo (green barcoded ID, smart ID card, or valid passport). Premium tier: above + proof of address dated within 3 months (utility bill, bank statement, or municipal rates notice). Business tier: CIPC registration documents + director ID. All take up to 24 hours to process.",
    exampleQueries: ["What documents do I need?", "How to verify my identity", "ID verification requirements"],
    status: "pending", hitCount: 1089, lastUpdated: "2026-03-01",
  },
  {
    id: "two-factor-auth", label: "Two-Factor Auth", type: "intent",
    category: "verification-security",
    answer: "Go to Settings > Security > Two-Factor Authentication. Choose SMS OTP or authenticator app (Google Authenticator, Authy). Authenticator app is strongly recommended — SMS is vulnerable to SIM-swap fraud. 2FA is required on every login and on transfers above R5,000.",
    exampleQueries: ["How to enable 2FA?", "Set up two-factor authentication", "Authenticator app setup"],
    status: "pending", hitCount: 765, lastUpdated: "2026-03-01",
  },
  {
    id: "suspect-fraud", label: "Suspect Fraud", type: "intent",
    category: "verification-security",
    answer: "Lock your wallet immediately: Settings > Security > Lock Wallet, or SMS 'LOCK' to 33210. Contact PayFlow: 0800-PAY-FLOW (0800-729-3569) or in-app chat. Our fraud team operates 24/7 and investigates within 4 hours. Never share your PIN, OTP, or password with anyone.",
    exampleQueries: ["I think my account was hacked", "Suspicious activity on my account", "Unauthorised transaction"],
    status: "pending", hitCount: 892, lastUpdated: "2026-03-01",
  },
  {
    id: "phishing", label: "Phishing Messages", type: "intent",
    category: "verification-security",
    answer: "PayFlow will never ask for your password, PIN, or OTP via SMS, email, or phone. Do not click suspicious links. Forward the message to fraud@payflow.co.za and delete it. If you already clicked a link or shared credentials, lock your wallet immediately and contact support.",
    exampleQueries: ["Suspicious message from PayFlow", "Is this PayFlow email real?", "Phishing scam message"],
    status: "pending", hitCount: 534, lastUpdated: "2026-03-01",
  },

  // ── Billing & Statements ─────────────────────────────────────────────────────
  {
    id: "transaction-statement", label: "Transaction Statement", type: "intent",
    category: "billing-statements",
    answer: "Go to Activity > tap the filter icon > select a date range > tap 'Export'. Available as PDF or CSV. Statements cover all transactions including fees. Statements older than 12 months can be requested via support and are delivered within 48 hours.",
    exampleQueries: ["How do I get a statement?", "Download my transactions", "Export transaction history"],
    status: "pending", hitCount: 789, lastUpdated: "2026-03-01",
  },
  {
    id: "tax-info", label: "Tax Information", type: "intent",
    category: "billing-statements",
    answer: "PayFlow is a payment platform, not a tax advisor. For business use, your transaction history may be relevant for income tax or VAT reporting. Consult a registered tax practitioner. PayFlow reports to SARS in compliance with the Tax Administration Act where legally required.",
    exampleQueries: ["Are PayFlow transactions taxable?", "Tax on payments", "VAT on transfers", "SARS reporting"],
    status: "pending", hitCount: 312, lastUpdated: "2026-03-01",
  },

  // ── Technical & App Issues ───────────────────────────────────────────────────
  {
    id: "app-crashes", label: "App Crashes", type: "intent",
    category: "technical-app",
    answer: "Ensure you're on the latest version (min iOS 15 or Android 10). Clear cache on Android: Settings > Apps > PayFlow > Clear Cache. On iOS: delete and reinstall the app. If the issue persists, contact support with your device model, OS version, and a screenshot of any error.",
    exampleQueries: ["App keeps crashing", "PayFlow app not working", "App freezes", "Error when opening app"],
    status: "pending", hitCount: 1234, lastUpdated: "2026-03-01",
  },
  {
    id: "otp-issues", label: "OTP Not Received", type: "intent",
    category: "technical-app",
    answer: "Check network signal and ensure you're not in airplane mode. Check your spam/junk SMS folder. On a dual-SIM device, ensure the correct SIM is set as default for SMS. Request a new OTP after 60 seconds. Try the 'Call me instead' option for voice OTP.",
    exampleQueries: ["Not receiving OTP", "SMS code not arriving", "Verification code not received"],
    status: "pending", hitCount: 1567, lastUpdated: "2026-03-01",
  },
  {
    id: "offline-mode", label: "Offline Mode", type: "intent",
    category: "technical-app",
    answer: "PayFlow requires an active internet connection for all transactions. Offline, you can view your cached balance and recent transaction history. QR codes for receiving payments can be displayed offline, but the sender still needs connectivity to complete the transfer.",
    exampleQueries: ["Does PayFlow work offline?", "No internet connection", "Use PayFlow without data"],
    status: "pending", hitCount: 234, lastUpdated: "2026-03-01",
  },

  // ── PayFlow Business ─────────────────────────────────────────────────────────
  {
    id: "business-signup", label: "Business Signup", type: "intent",
    category: "payflow-business",
    answer: "Go to payflow.co.za/business and click 'Apply Now'. You'll need: CIPC registration documents, director's SA ID, business bank account details, and proof of business address. Applications are reviewed within 3 business days. Includes merchant dashboard, multi-user access, and API integration.",
    exampleQueries: ["How to sign up for business account?", "PayFlow for business", "Merchant account registration"],
    status: "pending", hitCount: 456, lastUpdated: "2026-03-01",
  },
  {
    id: "business-fees", label: "Business Fees", type: "intent",
    category: "payflow-business",
    answer: "1.2% transaction fee on incoming payments from customers (min R1, max R50 per transaction). Payouts to business bank accounts: R5 per payout. No monthly subscription fee. Volume discounts available for businesses processing more than R500,000/month — contact bizdev@payflow.co.za.",
    exampleQueries: ["Business account fees", "Merchant transaction fees", "Volume discounts"],
    status: "pending", hitCount: 334, lastUpdated: "2026-03-01",
  },
  {
    id: "api-access", label: "API Access", type: "intent",
    category: "payflow-business",
    answer: "PayFlow offers a REST API for business accounts. Documentation at developers.payflow.co.za. Supports: payment initiation, balance queries, transaction webhooks, and refund processing. API keys are generated in the merchant dashboard under Settings > API. Rate limits: 100 req/min standard, 1,000 req/min enterprise.",
    exampleQueries: ["Do you have an API?", "API integration", "Developer documentation", "Webhook support"],
    status: "pending", hitCount: 678, lastUpdated: "2026-03-01",
  },

  // ── Contact & Support ────────────────────────────────────────────────────────
  {
    id: "contact-support-intent", label: "Contact Support", type: "intent",
    category: "contact-support",
    answer: "In-app chat: 24/7, average response under 5 minutes. Phone: 0800-PAY-FLOW (0800-729-3569), Mon–Fri 08:00–20:00, Sat 09:00–14:00. Email: support@payflow.co.za, response within 24 hours. Twitter/X: @PayFlowHelp. Fraud emergencies: 0800-729-3569 option 3 (24/7).",
    exampleQueries: ["How do I contact support?", "Talk to someone at PayFlow", "Customer service number"],
    status: "pending", hitCount: 2341, lastUpdated: "2026-03-01",
  },
  {
    id: "kiosks", label: "PayFlow Kiosks", type: "intent",
    category: "contact-support",
    answer: "PayFlow kiosks are located in selected Shoprite and Checkers stores nationwide. Kiosks assist with in-person verification, account recovery, and cash deposits. Find your nearest kiosk at payflow.co.za/kiosks. PayFlow does not have traditional branch offices.",
    exampleQueries: ["Where can I go in person?", "PayFlow office", "Physical location", "Find a kiosk"],
    status: "pending", hitCount: 456, lastUpdated: "2026-03-01",
  },
]

export const PAYFLOW_EDGES: KBEdge[] = [
  // Hierarchy
  { id: "h-al-ca", source: "account-login",         target: "create-account",          type: "hierarchy" },
  { id: "h-al-pr", source: "account-login",         target: "password-reset",          type: "hierarchy" },
  { id: "h-al-lk", source: "account-login",         target: "account-locked",          type: "hierarchy" },
  { id: "h-al-cc", source: "account-login",         target: "change-contact",          type: "hierarchy" },
  { id: "h-al-cl", source: "account-login",         target: "close-account",           type: "hierarchy" },
  { id: "h-tp-sm", source: "transfers-payments",    target: "send-money",              type: "hierarchy" },
  { id: "h-tp-fe", source: "transfers-payments",    target: "fees",                    type: "hierarchy" },
  { id: "h-tp-tl", source: "transfers-payments",    target: "transfer-limits",         type: "hierarchy" },
  { id: "h-tp-fp", source: "transfers-payments",    target: "failed-payment",          type: "hierarchy" },
  { id: "h-tp-sp", source: "transfers-payments",    target: "scheduled-payments",      type: "hierarchy" },
  { id: "h-tp-rt", source: "transfers-payments",    target: "reverse-transfer",        type: "hierarchy" },
  { id: "h-vs-dr", source: "verification-security", target: "doc-requirements",        type: "hierarchy" },
  { id: "h-vs-2f", source: "verification-security", target: "two-factor-auth",         type: "hierarchy" },
  { id: "h-vs-sf", source: "verification-security", target: "suspect-fraud",           type: "hierarchy" },
  { id: "h-vs-ph", source: "verification-security", target: "phishing",               type: "hierarchy" },
  { id: "h-bs-ts", source: "billing-statements",    target: "transaction-statement",   type: "hierarchy" },
  { id: "h-bs-ti", source: "billing-statements",    target: "tax-info",                type: "hierarchy" },
  { id: "h-ta-ac", source: "technical-app",         target: "app-crashes",             type: "hierarchy" },
  { id: "h-ta-oi", source: "technical-app",         target: "otp-issues",              type: "hierarchy" },
  { id: "h-ta-om", source: "technical-app",         target: "offline-mode",            type: "hierarchy" },
  { id: "h-pb-bs", source: "payflow-business",      target: "business-signup",         type: "hierarchy" },
  { id: "h-pb-bf", source: "payflow-business",      target: "business-fees",           type: "hierarchy" },
  { id: "h-pb-aa", source: "payflow-business",      target: "api-access",              type: "hierarchy" },
  { id: "h-cs-ci", source: "contact-support",       target: "contact-support-intent",  type: "hierarchy" },
  { id: "h-cs-ki", source: "contact-support",       target: "kiosks",                  type: "hierarchy" },
  // Semantic cross-links
  { id: "r-pr-2f", source: "password-reset",    target: "two-factor-auth",        type: "related" },
  { id: "r-lk-sf", source: "account-locked",    target: "suspect-fraud",          type: "related" },
  { id: "r-fe-bf", source: "fees",              target: "business-fees",          type: "related" },
  { id: "r-tl-aa", source: "transfer-limits",   target: "api-access",             type: "related" },
  { id: "r-sf-cs", source: "suspect-fraud",     target: "contact-support-intent", type: "related" },
  { id: "r-fp-cs", source: "failed-payment",    target: "contact-support-intent", type: "related" },
  { id: "r-oi-2f", source: "otp-issues",        target: "two-factor-auth",        type: "related" },
]

const SIM_W = 900
const SIM_H = 620

export function initSimNodes(nodes: KBNode[]): SimNode[] {
  const cx = SIM_W / 2
  const cy = SIM_H / 2

  const categories = nodes.filter(n => n.type === "category")
  const catPos = new Map<string, { x: number; y: number }>()
  categories.forEach((cat, i) => {
    const angle = (i / categories.length) * 2 * Math.PI - Math.PI / 2
    catPos.set(cat.id, {
      x: cx + 215 * Math.cos(angle),
      y: cy + 185 * Math.sin(angle),
    })
  })

  return nodes.map(node => {
    if (node.type === "category") {
      const pos = catPos.get(node.id) ?? { x: cx, y: cy }
      return { ...node, x: pos.x, y: pos.y, vx: 0, vy: 0, pinned: false }
    }
    const catP = catPos.get(node.category) ?? { x: cx, y: cy }
    const siblings = nodes.filter(n => n.type === "intent" && n.category === node.category)
    const idx = siblings.findIndex(n => n.id === node.id)
    const count = siblings.length
    const catAngle = Math.atan2(catP.y - cy, catP.x - cx)
    const spread = count > 1 ? (Math.PI * 0.8) / (count - 1) : 0
    const startAngle = catAngle - (Math.PI * 0.4)
    const angle = startAngle + idx * spread
    const r = 85 + (idx % 2) * 20
    return {
      ...node,
      x: catP.x + r * Math.cos(angle),
      y: catP.y + r * Math.sin(angle),
      vx: 0, vy: 0, pinned: false,
    }
  })
}
