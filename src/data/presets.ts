import { EmailPreset } from '../types';

export const EMAIL_PRESETS: EmailPreset[] = [
  {
    id: 'phish-1',
    title: 'Urgent Account Suspension',
    category: 'phishing',
    sender: 'security-alert@bankofamerica-verify-sec.com',
    subject: 'URGENT: Your account will be suspended within 24 hours!',
    body: 'URGENT: Your account will be suspended! Click here to verify immediately! Suspicious login attempt detected from IP 192.168.1.1. Enter your credit card and password details to unlock your funds.',
    description: 'Classic account verification scam with high urgency & fake domain.'
  },
  {
    id: 'phish-2',
    title: 'Prize / Winner Notification',
    category: 'phishing',
    sender: 'claims@international-lottery-winner2026.net',
    subject: 'Congratulations! You have won $10,000 Cash Prize!',
    body: "Congratulations! You've won $1000! Click this link to claim your prize now! Limited time offer - free money. Enter your bank account details immediately to receive your deposit.",
    description: 'Financial scam promising unearned monetary rewards.'
  },
  {
    id: 'phish-3',
    title: 'Security Alert / Password Reset',
    category: 'phishing',
    sender: 'no-reply@paypaI-security-update.org',
    subject: 'Security Alert: Unusual activity detected',
    body: 'Security Alert: Unusual activity detected on your account. Verify your identity immediately by clicking http://bit.ly/update-pass-now. Failure to respond will result in immediate termination.',
    description: 'Spoofed service email using shortened phishing URLs.'
  },
  {
    id: 'phish-4',
    title: 'Fake Tax Refund Claim',
    category: 'phishing',
    sender: 'tax-refund@irs-e-portal-claim.com',
    subject: 'Action Required: Your Tax Refund is Ready',
    body: 'You have 24 hours to claim your tax refund of $482.50. Click here now to verify your SSN and routing number before expiration.',
    description: 'Government impersonation scam targeting sensitive PII.'
  },
  {
    id: 'legit-1',
    title: 'Order Confirmation',
    category: 'legitimate',
    sender: 'orders@amazon.com',
    subject: 'Your Amazon order #114-8921021-99182 confirmation',
    body: 'Thank you for your recent purchase. Your order has been confirmed and is being processed. Track your package using the official portal once dispatched.',
    description: 'Standard receipt email from a trusted merchant.'
  },
  {
    id: 'legit-2',
    title: 'Team Standup / Meeting',
    category: 'legitimate',
    sender: 'sarah.jenkins@company.com',
    subject: 'Meeting reminder: Team standup tomorrow at 9 AM',
    body: 'Meeting reminder: Team standup tomorrow at 9 AM in conference room A. Please update your Jira tickets before the sync.',
    description: 'Internal corporate communication with standard business context.'
  },
  {
    id: 'legit-3',
    title: 'Monthly Statement',
    category: 'legitimate',
    sender: 'service@chase.com',
    subject: 'Your monthly account statement is available',
    body: 'Your monthly statement is ready. Please review your account activity by signing into online banking at chase.com. Thank you for choosing Chase.',
    description: 'Authentic notification directing to main domain.'
  },
  {
    id: 'susp-1',
    title: 'External File Share Request',
    category: 'suspicious',
    sender: 'alex.consultant.external@gmail.com',
    subject: 'Important Document: Q3 Financial Review.pdf',
    body: 'Hi, I uploaded the requested Q3 audit document for your review. Please click the file host link below to access: http://drive-shares-docs.info/download/q3-audit',
    description: 'Ambiguous request from external free webmail with suspicious link.'
  }
];
