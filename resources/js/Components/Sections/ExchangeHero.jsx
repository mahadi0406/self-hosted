import React, {useState, useEffect} from 'react';
import {usePage} from '@inertiajs/react';
import {useTranslation} from '@/hooks/useTranslation';
import ExchangeStats from "@/Components/Sections/ExchangeStats.jsx";
import SupportedCurrencies from "@/Components/Sections/SupportedCurrencies.jsx";
import ExchangeWidget from "@/Components/Sections/ExchangeWidget.jsx";
import WalletModal from "@/Components/Sections/WalletModal.jsx";

export default function ExchangeHero({supportedCurrencies: propCurrencies, fiatCurrencies: propFiatCurrencies = []}) {
    const {primaryColor = '#f59e0b', currencySymbol = '$'} = usePage().props;
    const {t} = useTranslation();
    const [animatedStats, setAnimatedStats] = useState({
        volume: 0,
        trades: 0,
        users: 0,
        avgTime: 0
    });

    const [showWalletModal, setShowWalletModal] = useState(false);

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

    const primaryGradient = `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`;

    const animateCounters = () => {
        const targets = {
            volume: 2450,
            trades: 15600,
            users: 89,
            avgTime: 3.5
        };
        const duration = 3000;
        const steps = 100;
        const stepTime = duration / steps;

        Object.keys(targets).forEach(key => {
            const target = targets[key];
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    setAnimatedStats(prev => ({...prev, [key]: target}));
                    clearInterval(timer);
                } else {
                    setAnimatedStats(prev => ({
                        ...prev,
                        [key]: key === 'avgTime' ? (Math.floor(current * 10) / 10) : Math.floor(current)
                    }));
                }
            }, stepTime);
        });
    };

    const supportedCurrencies = propCurrencies && propCurrencies.length > 0
        ? propCurrencies
        : [
            {id: 1, code: 'BTC', name: 'Bitcoin', icon: '₿'},
            {id: 2, code: 'ETH', name: 'Ethereum', icon: 'Ξ'},
            {id: 3, code: 'USDT', name: 'Tether', icon: '₮'},
            {id: 4, code: 'BNB', name: 'Binance Coin', icon: 'Ⓑ'},
            {id: 5, code: 'USD', name: 'US Dollar', icon: '$'},
            {id: 6, code: 'EUR', name: 'Euro', icon: '€'},
            {id: 7, code: 'GBP', name: 'British Pound', icon: '£'},
            {id: 8, code: 'JPY', name: 'Japanese Yen', icon: '¥'}
        ];

    const fiatCurrencies = propFiatCurrencies && propFiatCurrencies.length > 0
        ? propFiatCurrencies : [
            {id: 1, code: 'USD', name: 'US Dollar', icon: '$'},
        ]

    const features = [
        {
            title: t('hero_escrow_title'),
            desc: t('hero_escrow_desc'),
            icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
        },
        {
            title: t('hero_rates_title'),
            desc: t('hero_rates_desc'),
            icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
        },
        {
            title: t('hero_settlement_title'),
            desc: t('hero_settlement_desc'),
            icon: 'M13 10V3L4 14h7v7l9-11h-7z'
        }
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            animateCounters();
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <section
            className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 pb-8 px-3 sm:pt-20 sm:pb-12 md:pt-24 md:pb-16 lg:px-6">
            <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 lg:gap-12 xl:gap-16 items-center">
                    <div className="lg:col-span-7 xl:col-span-7 space-y-5 sm:space-y-6 md:space-y-7 lg:space-y-8">
                        <div
                            className="inline-flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full backdrop-blur-xl border animate-fade-in"
                            style={{
                                background: `rgba(${themeColors.primaryRgb}, 0.1)`,
                                borderColor: `rgba(${themeColors.primaryRgb}, 0.3)`,
                                animationDelay: '0.2s'
                            }}>
                            <div className="w-2 h-2 rounded-full animate-pulse"
                                 style={{backgroundColor: themeColors.primary}}/>
                            <span className="text-xs sm:text-sm font-bold text-white/90 whitespace-nowrap">
                                {t('hero_daily_volume', {amount: `${currencySymbol}${animatedStats.volume}`})}
                            </span>
                        </div>

                        <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight sm:leading-[0.9] md:leading-[0.85] tracking-tighter">
                                <span className="text-white block animate-slide-up">
                                    {t('hero_instant_p2p')}
                                </span>
                                <span
                                    className="block animate-slide-up font-black mt-1 sm:mt-0 pb-1"
                                    style={{
                                        background: primaryGradient,
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        animationDelay: '0.3s',
                                        display: 'inline-block',
                                        paddingRight: '2px'
                                    }}
                                >
                                    {t('hero_crypto_exchange')}
                                </span>
                                <span
                                    className="text-white/90 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold block animate-slide-up mt-2 sm:mt-1"
                                    style={{animationDelay: '0.6s'}}>
                                    {t('hero_zero_fees')}
                                </span>
                            </h1>

                            <p className="text-sm sm:text-base md:text-lg leading-relaxed max-w-xl text-white/80 font-light animate-fade-in"
                               style={{animationDelay: '0.9s'}}>
                                {t('hero_description')}
                            </p>
                        </div>

                        <ExchangeStats
                            stats={animatedStats}
                            themeColors={themeColors}
                            currencySymbol={currencySymbol}
                        />

                        <SupportedCurrencies
                            currencies={fiatCurrencies}
                            themeColors={themeColors}
                        />

                        <div
                            className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 animate-fade-in"
                            style={{animationDelay: '1.8s'}}>
                            {features.map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="text-center sm:text-left p-3 sm:p-4 rounded-lg sm:rounded-xl backdrop-blur-sm border transition-all duration-300 group hover:scale-[1.02] cursor-pointer"
                                    style={{
                                        borderColor: 'rgba(255, 255, 255, 0.1)',
                                        background: `rgba(${themeColors.primaryRgb}, 0.02)`
                                    }}
                                >
                                    <div
                                        className="w-8 h-8 sm:w-10 sm:h-10 mx-auto sm:mx-0 mb-2 sm:mb-3 rounded-md sm:rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                                        style={{
                                            background: primaryGradient
                                        }}
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor"
                                             viewBox="0 0 24 24">
                                            <path d={feature.icon}/>
                                        </svg>
                                    </div>
                                    <h3 className="text-white font-bold text-sm sm:text-base mb-1.5">{feature.title}</h3>
                                    <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-normal">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-5 xl:col-span-5 relative w-full mt-8 lg:mt-0">
                        <div className="w-full h-[500px] sm:h-[550px] md:h-[600px] lg:h-[640px]">
                            <ExchangeWidget
                                themeColors={themeColors}
                                primaryGradient={primaryGradient}
                                supportedCurrencies={supportedCurrencies}
                                onConnectWallet={() => setShowWalletModal(true)}
                            />

                            {showWalletModal && (
                                <WalletModal
                                    show={showWalletModal}
                                    onClose={() => setShowWalletModal(false)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-slide-up {
                    animation: slide-up 0.8s ease-out forwards;
                    opacity: 0;
                }

                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                    opacity: 0;
                }

                @media (prefers-reduced-motion: reduce) {
                    .animate-slide-up,
                    .animate-fade-in {
                        animation: none !important;
                        opacity: 1 !important;
                    }
                }

                @media (max-width: 640px) {
                    h1 {
                        word-break: break-word;
                    }
                }
            `}</style>
        </section>
    );
}
