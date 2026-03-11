import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { RoleProvider } from '@/context/RoleContext';
import AuthShield from '@/components/AuthShield';
import TopNav from '@/components/TopNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Portfolio-Ai | Enterprise AI Governance',
    description: 'Intelligent AI Portfolio Management with strict governance and ROI tracking.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <RoleProvider>
                    <TopNav />
                    <AuthShield>
                        <main>{children}</main>
                    </AuthShield>
                </RoleProvider>
            </body>
        </html>
    );
}
