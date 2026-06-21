import type { Metadata } from 'next';
import { Geist, Geist_Mono, Lora } from 'next/font/google';
import './globals.css';
import { getServerSession } from 'next-auth';
import SessionProvider from '../components/SessionProvider';
import QueryClientProviderWrapper from '../components/QueryClientProviderWrapper';
import ThemeProviderWrapper from '@/components/ThemeProviderWrapper';
import AppLayout from '@/components/AppLayout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Rachna Kranti — Creative Writing Platform',
  description: 'Write stories, poems, dramas, and prose with AI-powered assistance.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} antialiased`}>
        <ThemeProviderWrapper>
          <SessionProvider session={session}>
            <QueryClientProviderWrapper>
              <AppLayout>{children}</AppLayout>
            </QueryClientProviderWrapper>
          </SessionProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
