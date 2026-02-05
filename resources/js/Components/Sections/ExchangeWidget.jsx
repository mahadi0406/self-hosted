import React, {useState, useEffect} from 'react';
import {usePage, Link, router} from '@inertiajs/react';
import {useTranslation} from '@/hooks/useTranslation';
import {toast} from 'sonner';

export default function ExchangeWidget({themeColors, primaryGradient, supportedCurrencies, onConnectWallet}) {
    const {t} = useTranslation();
    const page = usePage();
    const authUser = page.props.auth?.user || null;
    const isAuthenticated = !!authUser;

    const [fromCurrency, setFromCurrency] = useState('');
    const [toCurrency, setToCurrency] = useState('');
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [exchangeRate, setExchangeRate] = useState(null);
    const [feeAmount, setFeeAmount] = useState(0);
    const [feePercentage, setFeePercentage] = useState(0);
    const [totalDeducted, setTotalDeducted] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false);
    const [availableBalance, setAvailableBalance] = useState(0); // Add this
    const fromCurrencyData = supportedCurrencies.find(c => c.id === parseInt(fromCurrency));
    const toCurrencyData = supportedCurrencies.find(c => c.id === parseInt(toCurrency));

    useEffect(() => {
        if (fromCurrency && toCurrency && fromAmount > 0 && !isSubmitting && isAuthenticated) {
            fetchRate();
        } else if (!isSubmitting) {
            setToAmount('');
            setExchangeRate(null);
            setFeeAmount(0);
            setTotalDeducted(0);
        }
    }, [fromCurrency, toCurrency, fromAmount, isSubmitting, isAuthenticated]);

    const fetchRate = async () => {
        if (!fromCurrency || !toCurrency || !fromAmount || parseFloat(fromAmount) <= 0) {
            return;
        }

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            if (!csrfToken) {
                toast.error('Security token missing. Please refresh the page.');
                return;
            }

            const response = await fetch('/user/exchange/rate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    from_currency_id: parseInt(fromCurrency),
                    to_currency_id: parseInt(toCurrency),
                    amount: parseFloat(fromAmount),
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setExchangeRate(data.rate);
                setToAmount(data.to_amount);
                setFeeAmount(data.fee_amount || 0);
                setFeePercentage(data.fee_percentage || 0);
                setTotalDeducted(data.total_deducted || parseFloat(fromAmount));
                setAvailableBalance(data.available_balance || 0); // Set available balance
            } else {
                toast.error(data.message || 'Failed to get exchange rate');
                setToAmount('');
                setExchangeRate(null);
            }
        } catch (error) {
            console.error('Failed to fetch rate:', error);
            setToAmount('');
            setExchangeRate(null);
        }
    };

    const swapCurrencies = () => {
        if (isSubmitting) return;

        setIsSwapping(true);
        setTimeout(() => {
            const temp = fromCurrency;
            setFromCurrency(toCurrency);
            setToCurrency(temp);
            setFromAmount('');
            setToAmount('');
            setExchangeRate(null);
            setFeeAmount(0);
            setTotalDeducted(0);
            setAvailableBalance(0);
            setIsSwapping(false);
        }, 300);
    };

    const handleExchange = () => {
        if (isSubmitting || loading) return;

        if (!fromCurrency || !toCurrency) {
            toast.error('Please select currencies');
            return;
        }

        if (!fromAmount || parseFloat(fromAmount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (!exchangeRate || !toAmount) {
            toast.error('Please wait for exchange rate calculation');
            return;
        }

        setLoading(true);
        setIsSubmitting(true);

        const payload = {
            from_currency_id: parseInt(fromCurrency),
            to_currency_id: parseInt(toCurrency),
            from_amount: parseFloat(fromAmount),
            to_amount: parseFloat(toAmount),
            type: 'market',
        };

        router.post('/user/exchange/store', payload, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                toast.success('Exchange completed successfully');
                setTimeout(() => {
                    setFromAmount('');
                    setToAmount('');
                    setExchangeRate(null);
                    setFeeAmount(0);
                    setTotalDeducted(0);
                    setAvailableBalance(0);
                }, 100);
            },
            onError: (errors) => {
                if (errors.message) {
                    toast.error(errors.message);
                } else if (typeof errors === 'object') {
                    const firstError = Object.values(errors)[0];
                    toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
                } else {
                    toast.error('Exchange failed');
                }
            },
            onFinish: () => {
                setLoading(false);
                setIsSubmitting(false);
            },
        });
    };

    const formatNumber = (num, decimals = 4) => {
        if (!num) return '0';
        return parseFloat(num).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: decimals,
        });
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
            <div
                className="w-full max-w-md backdrop-blur-2xl border rounded-2xl p-4 sm:p-5 md:p-6 transition-all duration-500 hover:scale-[1.01] shadow-2xl"
                style={{
                    background: 'rgba(15, 15, 35, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(30px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                    opacity: isSubmitting ? 0.7 : 1,
                    pointerEvents: isSubmitting ? 'none' : 'auto',
                }}
            >
                <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-black mb-1 text-white truncate">{t('widget_quick_exchange')}</h3>
                        <p className="text-white/70 text-xs sm:text-sm font-normal">{t('widget_trade_instantly')}</p>
                    </div>
                    <div
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse-slow ml-2"
                        style={{background: primaryGradient}}
                    >
                        <svg className={`w-5 h-5 sm:w-6 sm:h-6 text-white ${loading ? 'animate-spin' : ''}`} fill="none"
                             stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                        </svg>
                    </div>
                </div>

                <div
                    className="p-3 sm:p-4 rounded-xl mb-3 transition-all duration-300"
                    style={{
                        background: `rgba(${themeColors.primaryRgb}, 0.15)`,
                        borderColor: `rgba(${themeColors.primaryRgb}, 0.3)`,
                        border: '1px solid'
                    }}
                >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 mb-2">
                        <label className="text-white/70 text-xs sm:text-sm font-semibold">{t('widget_you_send')}</label>
                        {isAuthenticated && fromCurrency && (
                            <span className="text-xs text-white/60 truncate">
                                {t('widget_available')}: {formatNumber(availableBalance, 4)} {fromCurrencyData?.code}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <input
                            type="number"
                            value={fromAmount}
                            onChange={(e) => !isSubmitting && setFromAmount(e.target.value)}
                            className="flex-1 bg-transparent text-xl sm:text-2xl font-black text-white outline-none min-w-0"
                            placeholder="0.00"
                            disabled={!isAuthenticated || isSubmitting}
                        />
                        <select
                            value={fromCurrency}
                            onChange={(e) => !isSubmitting && setFromCurrency(e.target.value)}
                            disabled={!isAuthenticated || isSubmitting}
                            className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm text-white cursor-pointer transition-all flex-shrink-0"
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                        >
                            <option value="">Select</option>
                            {supportedCurrencies.map(currency => (
                                <option key={currency.id} value={currency.id} className="bg-slate-900">
                                    {currency.icon} {currency.code}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-center -my-1.5 relative z-10">
                    <button
                        onClick={swapCurrencies}
                        disabled={isSwapping || !isAuthenticated || isSubmitting}
                        className="p-2 sm:p-2.5 rounded-xl border-4 transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                        style={{
                            background: primaryGradient,
                            borderColor: 'rgb(15, 15, 35)'
                        }}
                    >
                        <svg
                            className={`w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform ${isSwapping ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                        </svg>
                    </button>
                </div>

                <div
                    className="p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 transition-all duration-300"
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        border: '1px solid'
                    }}
                >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 mb-2">
                        <label
                            className="text-white/70 text-xs sm:text-sm font-semibold">{t('widget_you_receive')}</label>
                        {exchangeRate && fromCurrencyData && toCurrencyData && (
                            <span className="text-xs truncate" style={{color: themeColors.primary}}>
                                {t('widget_rate')}: 1 = {formatNumber(exchangeRate, 4)}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <input
                            type="number"
                            value={toAmount}
                            readOnly
                            disabled={!isAuthenticated}
                            className="flex-1 bg-transparent text-xl sm:text-2xl font-black text-white outline-none min-w-0"
                            placeholder="0.00"
                        />
                        <select
                            value={toCurrency}
                            onChange={(e) => !isSubmitting && setToCurrency(e.target.value)}
                            disabled={!isAuthenticated || isSubmitting}
                            className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm text-white cursor-pointer transition-all flex-shrink-0"
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                        >
                            <option value="">Select</option>
                            {supportedCurrencies.map(currency => (
                                <option key={currency.id} value={currency.id} className="bg-slate-900">
                                    {currency.icon} {currency.code}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg"
                     style={{background: 'rgba(255, 255, 255, 0.05)'}}>
                    <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-white/60">{t('widget_network_fee')}</span>
                        <span
                            className="text-white font-semibold">{feeAmount ? formatNumber(feeAmount, 4) : '0.0000'}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-white/60">{t('widget_processing_time')}</span>
                        <span className="text-white font-semibold">~3 min</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm pt-1.5 sm:pt-2 border-t border-white/10">
                        <span className="text-white/80 font-semibold">{t('widget_total_receive')}</span>
                        <span className="font-black truncate ml-2" style={{color: themeColors.primary}}>
                            {toAmount ? formatNumber(toAmount, 4) : '0.0000'}
                        </span>
                    </div>
                </div>

                {!isAuthenticated ? (
                    <>
                        <button
                            onClick={onConnectWallet}
                            className="w-full py-3 sm:py-3.5 md:py-4 rounded-xl font-black text-sm sm:text-base text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                                background: primaryGradient,
                                boxShadow: `0 10px 40px rgba(${themeColors.primaryRgb}, 0.3)`
                            }}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                                </svg>
                                {t('widget_connect_wallet')}
                            </span>
                        </button>
                        <p className="text-xs text-white/50 text-center mt-3">
                            {t('widget_please_connect')}
                        </p>
                    </>
                ) : (
                    <div className="space-y-2">
                        <button
                            onClick={handleExchange}
                            disabled={loading || !fromCurrency || !toCurrency || !fromAmount || isSubmitting}
                            className="w-full py-3 sm:py-3.5 md:py-4 rounded-xl font-black text-sm sm:text-base text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: primaryGradient,
                                boxShadow: `0 10px 40px rgba(${themeColors.primaryRgb}, 0.3)`
                            }}
                        >
                            {loading ? 'Processing...' : t('widget_start_exchange')}
                        </button>
                        <Link
                            href="/user/dashboard"
                            className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] border inline-flex items-center justify-center gap-2"
                            style={{
                                borderColor: themeColors.primary,
                                background: `rgba(${themeColors.primaryRgb}, 0.1)`
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                            </svg>
                            {t('widget_go_to_dashboard')}
                        </Link>
                    </div>
                )}

                <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
                    <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                         style={{backgroundColor: themeColors.primary}}/>
                    <span className="text-xs text-white/60 text-center">{t('widget_secured_escrow')}</span>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse-slow {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }

                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }

                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }

                .animate-spin {
                    animation: spin 1s linear infinite;
                }

                input[type="number"]::-webkit-inner-spin-button,
                input[type="number"]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }

                input[type="number"] {
                    -moz-appearance: textfield;
                }

                select {
                    max-width: 120px;
                }

                input:disabled,
                select:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: 640px) {
                    select {
                        max-width: 100px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .animate-pulse-slow {
                        animation: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
