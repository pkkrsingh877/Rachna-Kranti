import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import { getServerSession } from "next-auth";
import SessionProvider from "../components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rachna Kranti",
  description: "Use AI to write Stories, Proses, Poems, Novels, Jokes, etc.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
        <div className="flex flex-col">
          <Header />
          <main>
            {/* Content goes here */}
            {children}
          </main>
          <footer>
            {/* Footer content goes here */}
          </footer>
        </div>
        </SessionProvider>
      </body>
    </html>
  );
}
