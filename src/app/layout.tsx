
import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });


export const metadata: Metadata = {
  title: 'Zrlda Finance',
  description: 'The future of personal and social finance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script src="https://www.google.com/recaptcha/enterprise.js?render=6Lezi90rAAAAAMuN5llIGC-8Tq7gcONr1RcBx9H_"></script>
      </head>
      <body className={`${inter.variable} font-body antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

    