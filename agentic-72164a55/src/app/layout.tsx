import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agentic Reels AI',
  description: 'Auto-generate and publish trending reels & videos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container py-8">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Agentic Reels AI</h1>
            <nav className="flex items-center gap-3">
              <a className="btn" href="/">Dashboard</a>
              <a className="btn" href="/settings">Settings</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
