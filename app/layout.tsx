import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import { getServerSession } from 'next-auth';
import SessionProvider from '../components/SessionProvider';
import QueryClientProviderWrapper from '../components/QueryClientProviderWrapper';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Rachna Kranti',
  description: 'Use AI to write Stories, Proses, Poems, Novels, Jokes, etc.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider session={session}>
          <QueryClientProviderWrapper>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
              <footer>{/* footer content */}</footer>
            </div>
          </QueryClientProviderWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
