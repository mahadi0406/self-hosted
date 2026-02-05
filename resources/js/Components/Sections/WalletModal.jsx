import React, {useState, useEffect, useMemo} from 'react';
import {useTranslation} from '@/hooks/useTranslation';
import {usePage} from '@inertiajs/react';
import '@rainbow-me/rainbowkit/styles.css';
import {
    RainbowKitProvider,
    ConnectButton,
    darkTheme,
    getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import {WagmiProvider, useAccount, useSignMessage, useDisconnect} from 'wagmi';
import {QueryClientProvider, QueryClient} from '@tanstack/react-query';
import {
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    bsc,
} from 'wagmi/chains';

const queryClient = new QueryClient();
function WalletModalContent({show, onClose, onSuccess}) {
    const {t} = useTranslation();
    const page = usePage();
    const primaryColor = page.props.primaryColor || '#f59e0b';

    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [connectingMessage, setConnectingMessage] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const {address, isConnected, connector} = useAccount();
    const {signMessageAsync} = useSignMessage();
    const {disconnect} = useDisconnect();

    const hexToRgb = (hex) => {
        if (!hex || typeof hex !== 'string') {
            return {r: 245, g: 158, b: 11};
        }
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 245, g: 158, b: 11};
    };

    const adjustColor = (hex, amount) => {
        const rgb = hexToRgb(hex);
        const newR = Math.min(255, Math.max(0, rgb.r + amount));
        const newG = Math.min(255, Math.max(0, rgb.g + amount));
        const newB = Math.min(255, Math.max(0, rgb.b + amount));
        return "#" + ((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1);
    };

    const themeColors = {
        primary: primaryColor,
        primaryDark: adjustColor(primaryColor, -20),
        primaryLight: adjustColor(primaryColor, 40),
        primaryRgb: `${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}`
    };

    const getReferralCode = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('ref') || localStorage.getItem('referral_code') || null;
    };

    const authenticateWallet = async (walletAddress, walletName) => {
        try {
            setConnecting(true);
            setConnectingMessage(t('wallet_modal_connecting') || 'Connecting...');
            setStatusMessage(t('wallet_modal_getting_nonce') || 'Getting nonce...');
            setError(null);

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            const referralCode = getReferralCode();

            const nonceResponse = await fetch('/auth/web3/nonce', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'same-origin',
                body: JSON.stringify({wallet_address: walletAddress})
            });

            if (!nonceResponse.ok) {
                const errorData = await nonceResponse.json().catch(() => ({}));
                throw new Error(errorData.message || t('wallet_modal_nonce_failed') || 'Nonce failed');
            }

            const nonceData = await nonceResponse.json();

            if (!nonceData.success || !nonceData.nonce) {
                throw new Error(nonceData.message || t('wallet_modal_nonce_failed') || 'Nonce failed');
            }

            setConnectingMessage(t('wallet_modal_signing_message') || 'Signing message...');
            setStatusMessage(t('wallet_modal_confirm_in_wallet') || 'Confirm in wallet');

            const signature = await signMessageAsync({
                message: nonceData.nonce,
            });

            if (!signature) {
                throw new Error(t('wallet_modal_signature_failed') || 'Signature failed');
            }

            setConnectingMessage(t('wallet_modal_logging_in') || 'Logging in...');
            setStatusMessage(t('wallet_modal_authenticating_wallet') || 'Authenticating...');

            const loginResponse = await fetch('/auth/web3/direct-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    wallet_address: walletAddress,
                    signature: signature,
                    wallet_type: walletName?.toLowerCase() || 'unknown',
                    referral_code: referralCode
                })
            });

            if (!loginResponse.ok) {
                const errorData = await loginResponse.json().catch(() => ({}));
                throw new Error(errorData.message || t('wallet_modal_login_failed') || 'Login failed');
            }

            const data = await loginResponse.json();

            if (!data.success) {
                throw new Error(data.message || t('wallet_modal_login_failed') || 'Login failed');
            }

            setConnectingMessage(t('wallet_modal_success') || 'Success!');
            setStatusMessage(t('wallet_modal_redirecting') || 'Redirecting...');

            await new Promise(resolve => setTimeout(resolve, 800));

            if (onSuccess) onSuccess(data.user);
            window.location.href = data.redirect_url || '/user/dashboard';

        } catch (err) {
            setConnecting(false);
            if (err.message?.includes('User rejected') || err.message?.includes('denied')) {
                setError(t('wallet_modal_signature_rejected') || 'Signature rejected by user');
            } else {
                setError(err.message || t('wallet_modal_connection_error') || 'Connection error');
            }
            disconnect();
        }
    };

    useEffect(() => {
        if (isConnected && address && !connecting && !error) {
            const walletName = connector?.name || 'Unknown Wallet';
            authenticateWallet(address, walletName);
        }
    }, [isConnected, address, connector]);

    const retry = () => {
        setError(null);
        setConnecting(false);
        disconnect();
    };

    const closeModal = () => {
        if (!connecting) {
            setError(null);
            disconnect();
            onClose();
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !connecting) {
            closeModal();
        }
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !connecting) {
                closeModal();
            }
        };

        if (show) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [show, connecting]);

    if (!show) return null;

    return (
        <div
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            style={{backgroundColor: 'rgba(0, 0, 0, 0.8)'}}
            onClick={handleBackdropClick}
        >
            <div
                className="relative w-full max-w-md mx-auto backdrop-blur-2xl border rounded-2xl p-5 sm:p-6 animate-scale-in"
                style={{
                    background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(${themeColors.primaryRgb}, 0.1)`
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={closeModal}
                    disabled={connecting}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-all p-2 rounded-lg hover:bg-white/10 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>

                {connecting && (
                    <div className="text-center py-10">
                        <div
                            className="w-16 h-16 mx-auto mb-5 border-4 border-white/20 rounded-full animate-spin"
                            style={{borderTopColor: themeColors.primary}}
                        />
                        <h3 className="text-xl font-black mb-2 text-white">{connectingMessage}</h3>
                        <p className="text-white/60 text-sm mb-5">{statusMessage}</p>
                        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10">
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center"
                                style={{
                                    background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`
                                }}
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                            </div>
                            <span className="font-bold text-sm" style={{color: themeColors.primary}}>
                                {t('wallet_modal_authenticating') || 'Authenticating...'}
                            </span>
                        </div>
                    </div>
                )}

                {error && !connecting && (
                    <div className="text-center py-10">
                        <div
                            className="w-16 h-16 mx-auto mb-5 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                        </div>
                        <h3 className="text-xl font-black mb-2 text-white">
                            {t('wallet_modal_connection_failed') || 'Connection Failed'}
                        </h3>
                        <p className="text-red-400 text-sm mb-6 leading-relaxed max-w-sm mx-auto">{error}</p>
                        <button
                            onClick={retry}
                            className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
                            style={{
                                background: `rgba(${themeColors.primaryRgb}, 0.2)`,
                                border: `2px solid ${themeColors.primary}`,
                                color: themeColors.primary
                            }}
                        >
                            {t('wallet_modal_try_again') || 'Try Again'}
                        </button>
                    </div>
                )}

                {!connecting && !error && (
                    <div>
                        <div className="text-center mb-6">
                            <div
                                className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center animate-pulse-slow"
                                style={{
                                    background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`
                                }}
                            >
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-black mb-2 text-white">
                                {t('wallet_modal_connect_wallet_title') || 'Connect Wallet'}
                            </h3>
                            <p className="text-white/70 text-sm leading-relaxed">
                                {t('wallet_modal_connect_wallet_desc') || 'Choose your wallet to get started'}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="rainbow-connect-wrapper">
                                <ConnectButton.Custom>
                                    {({
                                          account,
                                          chain,
                                          openConnectModal,
                                          mounted,
                                      }) => {
                                        return (
                                            <div
                                                {...(!mounted && {
                                                    'aria-hidden': true,
                                                    'style': {
                                                        opacity: 0,
                                                        pointerEvents: 'none',
                                                        userSelect: 'none',
                                                    },
                                                })}
                                                className="w-full"
                                            >
                                                <button
                                                    onClick={openConnectModal}
                                                    type="button"
                                                    className="group w-full flex items-center gap-3 p-4 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                    style={{
                                                        background: `linear-gradient(135deg, rgba(${themeColors.primaryRgb}, 0.1) 0%, rgba(${themeColors.primaryRgb}, 0.05) 100%)`,
                                                        borderColor: `rgba(${themeColors.primaryRgb}, 0.3)`
                                                    }}
                                                >
                                                    <div
                                                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`
                                                        }}
                                                    >
                                                        <svg className="w-6 h-6 text-white" fill="none"
                                                             stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth="2"
                                                                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <div className="font-bold text-base text-white mb-1">
                                                            {t('wallet_modal_crypto_wallet') || 'Connect Crypto Wallet'}
                                                        </div>
                                                        <div className="text-xs text-white/60">
                                                            {t('wallet_modal_crypto_wallet_desc') || 'MetaMask, WalletConnect, Coinbase, Rainbow & more'}
                                                        </div>
                                                    </div>
                                                    <svg
                                                        className="w-6 h-6 text-white/40 group-hover:text-white/60 transition-colors"
                                                        fill="none" stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth="2" d="M9 5l7 7-7 7"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        );
                                    }}
                                </ConnectButton.Custom>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center"
                                         style={{backgroundColor: `rgba(${themeColors.primaryRgb}, 0.2)`}}>
                                        <svg className="w-4 h-4" style={{color: themeColors.primary}} fill="none"
                                             stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                        </svg>
                                    </div>
                                    <div className="text-xs font-bold text-white mb-1">
                                        {t('wallet_modal_secure') || 'Secure'}
                                    </div>
                                    <div className="text-xs text-white/50">
                                        {t('wallet_modal_secure_desc') || 'Protected by blockchain'}
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center"
                                         style={{backgroundColor: `rgba(${themeColors.primaryRgb}, 0.2)`}}>
                                        <svg className="w-4 h-4" style={{color: themeColors.primary}} fill="none"
                                             stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                        </svg>
                                    </div>
                                    <div className="text-xs font-bold text-white mb-1">
                                        {t('wallet_modal_instant') || 'Instant'}
                                    </div>
                                    <div className="text-xs text-white/50">
                                        {t('wallet_modal_instant_desc') || 'Connect in seconds'}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="text-xs font-bold text-white/70 mb-3 text-center">
                                    {t('wallet_modal_supported_wallets') || 'Supported Wallets'}
                                </div>
                                <div className="flex items-center justify-center gap-4 flex-wrap">
                                    <div className="text-xs text-white/50">MetaMask</div>
                                    <div className="w-1 h-1 rounded-full bg-white/30"></div>
                                    <div className="text-xs text-white/50">WalletConnect</div>
                                    <div className="w-1 h-1 rounded-full bg-white/30"></div>
                                    <div className="text-xs text-white/50">Coinbase</div>
                                    <div className="w-1 h-1 rounded-full bg-white/30"></div>
                                    <div className="text-xs text-white/50">Rainbow</div>
                                    <div className="w-1 h-1 rounded-full bg-white/30"></div>
                                    <div className="text-xs text-white/50">{t('wallet_modal_more') || 'More'}</div>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-white/40 text-center mt-6 leading-relaxed">
                            {t('wallet_modal_terms') || 'By connecting, you agree to our Terms of Service and Privacy Policy'}
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes pulse-slow {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }

                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }

                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }

                @media (prefers-reduced-motion: reduce) {
                    .animate-fade-in,
                    .animate-scale-in,
                    .animate-pulse-slow {
                        animation: none !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default function WalletModal(props) {
    const page = usePage();
    const primaryColor = page.props.primaryColor || '#f59e0b';

    const rainbowkitConfig = page.props.rainbowkit || {};
    const projectId = rainbowkitConfig.project_id || '';
    const appName = rainbowkitConfig.app_name || page.props.appName || 'Experts-Trade';
    const config = useMemo(() => {
        return getDefaultConfig({
            appName: appName,
            projectId: projectId,
            chains: [mainnet, polygon, optimism, arbitrum, base, bsc],
            ssr: false,
        });
    }, [projectId, appName]);

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: primaryColor,
                        accentColorForeground: 'white',
                        borderRadius: 'large',
                        fontStack: 'system',
                    })}
                >
                    <WalletModalContent {...props} />
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
