import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Canvas Chain Documentation & Architecture Reference',
  description: 'Technical architecture, design tokens, and API specs for canvas-chain.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
