import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: {
    default: 'AntiPay - Automated Payment Verification Bangladesh',
    template: '%s | AntiPay',
  },
  description: 'Simplify your local payment collections with AntiPay. Real-time automated verification for bKash, Nagad, and Rocket payments in Bangladesh.',
  keywords: ['bKash API', 'Nagad API', 'Rocket Verification', 'Payment Gateway Bangladesh', 'Automated Payments', 'AntiPay', 'Merchant Services'],
  authors: [{ name: 'AntiPay Team' }],
  creator: 'AntiPay',
  publisher: 'AntiPay Ltd.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://antipay.site',
    siteName: 'AntiPay',
    title: 'AntiPay - Real-time Payment Verification Infrastructure',
    description: 'The most reliable verification API for bKash, Nagad, and Rocket in Bangladesh. Stop manual verification and start scaling.',
    images: [
      {
        url: 'https://i.imgur.com/Chozuv5.png',
        width: 1200,
        height: 630,
        alt: 'AntiPay Banner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AntiPay - Automate Your Business Payments',
    description: 'Real-time API driven verification for Bangladeshi mobile banking.',
    images: ['https://i.imgur.com/Chozuv5.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
