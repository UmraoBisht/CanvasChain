import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '../src/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'Canvas Chain Architect — Scalable Collaborative Workspace',
  description: 'Production-ready infinite canvas platform built with Next.js 15, React 19, and Turborepo.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased selection:bg-primary/20" suppressHydrationWarning>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
