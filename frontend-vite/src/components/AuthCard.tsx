import React from 'react';

type AuthCardProps = {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
};

export const AuthCard = ({ title, subtitle, children }: AuthCardProps) => {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8" style={{ backgroundColor: '#0a0f1a' }}>
            {/* Background effects matching landing page */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-transparent to-[#0a0f1a]/90" />
                <div className="absolute inset-0 backdrop-blur-[2px]" />
            </div>

            <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-[#0d1320]/70 p-8 backdrop-blur-md shadow-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white/95">{title}</h2>
                    {subtitle && <p className="mt-2 text-sm text-blue-100/60">{subtitle}</p>}
                </div>
                <div className="mt-8 space-y-6">
                    {children}
                </div>
            </div>
        </div>
    );
};
