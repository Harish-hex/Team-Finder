type OAuthButtonProps = {
    provider: 'google';
    onClick: () => void;
    isLoading?: boolean;
};

export const OAuthButton = ({ provider: _provider, onClick, isLoading }: OAuthButtonProps) => {
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-white/20 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white/90 backdrop-blur-sm shadow-sm hover:bg-white/10 hover:text-white transition-all focus-visible:ring-transparent disabled:opacity-50"
        >
            {isLoading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                    <path
                        d="M12.0003 20.45c-4.6667 0-8.45-3.7833-8.45-8.45 0-4.6667 3.7833-8.45 8.45-8.45 2.225 0 4.2667.7833 5.8667 2.1l-2.025 2.025c-0.9667-0.75-2.225-1.225-3.8417-1.225-3.1583 0-5.7167 2.5583-5.7167 5.7167 0 3.1583 2.5583 5.7167 5.7167 5.7167 2.65 0 4.8667-1.6917 5.5417-4.0417h-5.5417v-2.85h8.425c0.125.6083.1833 1.1583.1833 1.85 0 5.0833-3.4167 8.6083-8.6083 8.6083V20.45z"
                        fill="#4285F4"
                    />
                </svg>
            )}
            <span className="text-sm font-medium leading-6">Continue with Google</span>
        </button>
    );
};
