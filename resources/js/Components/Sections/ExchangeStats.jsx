import React from 'react';
import {useTranslation} from '@/hooks/useTranslation';

export default function ExchangeStats({stats, themeColors, currencySymbol}) {
    const {t} = useTranslation();

    return (
        <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-5 p-4 sm:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl border animate-fade-in"
            style={{
                background: 'rgba(15, 23, 42, 0.6)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                animationDelay: '1.2s'
            }}
        >
            {[
                {
                    label: t('stats_daily_volume'),
                    value: `${currencySymbol}${stats.volume}M`,
                    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                },
                {
                    label: t('stats_total_trades'),
                    value: `${stats.trades.toLocaleString()}+`,
                    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
                },
                {
                    label: t('stats_active_users'),
                    value: `${stats.users}K+`,
                    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                },
                {
                    label: t('stats_avg_time'),
                    value: `${stats.avgTime}min`,
                    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                }
            ].map((stat, idx) => (
                <div
                    key={idx}
                    className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl group hover:scale-105 transition-transform cursor-pointer"
                    style={{
                        background: `rgba(${themeColors.primaryRgb}, 0.05)`
                    }}
                >
                    <div
                        className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                        style={{
                            background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`
                        }}
                    >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor"
                             viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}/>
                        </svg>
                    </div>
                    <div
                        className="text-xl sm:text-2xl md:text-3xl font-black mb-1 truncate"
                        style={{
                            background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`,
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent'
                        }}
                    >
                        {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-white/70 font-medium">{stat.label}</div>
                </div>
            ))}

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
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

                @media (prefers-reduced-motion: reduce) {
                    .animate-fade-in {
                        animation: none !important;
                        opacity: 1 !important;
                        transform: none !important;
                    }

                    .transition-transform {
                        transition: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
