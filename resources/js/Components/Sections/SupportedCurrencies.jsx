import React from 'react';
import {useTranslation} from '@/hooks/useTranslation';

export default function SupportedCurrencies({currencies, themeColors}) {
    const {t} = useTranslation();

    return (
        <div className="animate-fade-in" style={{animationDelay: '1.5s'}}>
            <p className="text-white/60 text-xs sm:text-sm font-semibold mb-2 sm:mb-3 uppercase tracking-wide">
                {t('currencies_supported')}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
                {currencies.map((currency) => (
                    <div
                        key={currency.code}
                        className="group cursor-pointer flex flex-col items-center"
                    >
                        <div
                            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl border backdrop-blur-sm p-2 sm:p-2.5 transition-all duration-300 group-hover:scale-110 group-active:scale-95 flex items-center justify-center"
                            style={{
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                background: `rgba(${themeColors.primaryRgb}, 0.05)`
                            }}
                        >
                            <span
                                className="text-xl sm:text-2xl md:text-3xl font-black opacity-70 group-hover:opacity-100 transition-opacity"
                                style={{color: themeColors.primary}}
                            >
                                {currency.icon}
                            </span>
                        </div>
                        <span
                            className="text-[10px] sm:text-xs text-white/60 group-hover:text-white/90 mt-1.5 sm:mt-2 transition-colors font-medium text-center">
                            {currency.code}
                        </span>
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                    opacity: 0;
                }

                @media (max-width: 640px) {
                    .grid-cols-4 > div {
                        min-width: 0;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .animate-fade-in {
                        animation: none !important;
                        opacity: 1 !important;
                        transform: none !important;
                    }

                    .transition-all,
                    .transition-opacity,
                    .transition-colors {
                        transition: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
