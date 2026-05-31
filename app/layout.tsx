import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Booking | Nasi Ayam Haji Ali',
  description: 'Sistem Tempahan Meja Nasi Ayam Haji Ali',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
