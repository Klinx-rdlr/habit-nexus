import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HabitMap',
  description: 'Habit tracker with social accountability',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
