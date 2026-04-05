import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "テストケース管理",
  description: "テストケースとテスト実行プロジェクトを管理するアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-8">
            <Link href="/" className="font-bold text-blue-600 text-lg">
              TestManager
            </Link>
            <nav className="flex gap-6 text-sm font-medium">
              <Link href="/testcases" className="text-gray-600 hover:text-blue-600 transition-colors">
                テストケース
              </Link>
              <Link href="/projects" className="text-gray-600 hover:text-blue-600 transition-colors">
                実行プロジェクト
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
