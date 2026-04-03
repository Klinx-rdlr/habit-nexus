import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'HabitMap',
    template: '%s | HabitMap',
  },
  description:
    'Build better habits with social accountability. Track streaks, join groups, and compete on leaderboards.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var t=localStorage.getItem('theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches)){d.classList.add('dark');d.style.colorScheme='dark'}else{d.style.colorScheme='light'}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="transition-none">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
