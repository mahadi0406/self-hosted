import {useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Activity, TrendingUp, TrendingDown, Search, Star, Flame} from 'lucide-react';
import {useTranslation} from '@/hooks/useTranslation';

const TradingPairs = ({exchangePairs = [], theme, onPairSelect}) => {
    const {t} = useTranslation();
    const [selectedTab, setSelectedTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');

    const formatNumber = (num, decimals = 8) => {
        if (!num) return '0';
        return parseFloat(num).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: decimals,
        });
    };

    const filteredPairs = exchangePairs.filter(pair => {
        const matchesSearch = searchQuery === '' ||
            pair.from_currency.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pair.to_currency.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pair.from_currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pair.to_currency.name.toLowerCase().includes(searchQuery.toLowerCase());

        if (selectedTab === 'gainers') {
            return matchesSearch && pair.change_24h > 0;
        } else if (selectedTab === 'losers') {
            return matchesSearch && pair.change_24h < 0;
        } else if (selectedTab === 'featured') {
            return matchesSearch && pair.is_featured;
        }
        return matchesSearch;
    });

    const sortedPairs = [...filteredPairs].sort((a, b) => {
        if (selectedTab === 'gainers') {
            return b.change_24h - a.change_24h;
        } else if (selectedTab === 'losers') {
            return a.change_24h - b.change_24h;
        } else if (selectedTab === 'featured') {
            return b.volume_24h - a.volume_24h;
        }
        return b.volume_24h - a.volume_24h;
    });

    const tabs = [
        {key: 'all', label: t('exchange_all_pairs') || 'All Pairs', icon: Activity},
        {key: 'featured', label: t('exchange_featured_pairs') || 'Featured', icon: Star},
        {key: 'gainers', label: t('exchange_top_gainers') || 'Top Gainers', icon: TrendingUp},
        {key: 'losers', label: t('exchange_top_losers') || 'Top Losers', icon: TrendingDown},
    ];

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.3}}
            style={{
                backgroundColor: theme.bgCard,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${theme.border}`,
                marginBottom: '24px',
            }}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '16px',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: `${theme.primary}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Flame style={{width: '20px', height: '20px', color: theme.primary}}/>
                    </div>
                    <div>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: theme.text,
                            marginBottom: '2px',
                        }}>
                            {t('exchange_market_overview') || 'Market Overview'}
                        </h3>
                        <p style={{
                            fontSize: '12px',
                            color: theme.textMuted,
                        }}>
                            {sortedPairs.length} {t('exchange_trading_pairs') || 'Trading Pairs'}
                        </p>
                    </div>
                </div>

                <div style={{
                    position: 'relative',
                    flex: '1',
                    maxWidth: '300px',
                    minWidth: '200px',
                }}>
                    <Search style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '16px',
                        height: '16px',
                        color: theme.textMuted,
                    }}/>
                    <input
                        type="text"
                        placeholder={t('exchange_search_pairs') || 'Search pairs...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            borderRadius: '8px',
                            border: `1px solid ${theme.border}`,
                            backgroundColor: theme.bg,
                            color: theme.text,
                            fontSize: '13px',
                            outline: 'none',
                            transition: 'all 0.2s',
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = theme.primary;
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = theme.border;
                        }}
                    />
                </div>
            </div>

            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                overflowX: 'auto',
                paddingBottom: '8px',
            }}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = selectedTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setSelectedTab(tab.key)}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: isActive ? theme.primary : theme.bg,
                                color: isActive ? '#fff' : theme.textMuted,
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.target.style.backgroundColor = theme.bgCard;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.target.style.backgroundColor = theme.bg;
                                }
                            }}
                        >
                            <Icon style={{width: '16px', height: '16px'}}/>
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px',
                maxHeight: '500px',
                overflowY: 'auto',
                padding: '4px',
            }} className="custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {sortedPairs.map((pair, index) => {
                        const isPositive = pair.change_24h >= 0;
                        return (
                            <motion.div
                                key={`pair-${pair.id}`}
                                initial={{opacity: 0, scale: 0.95}}
                                animate={{opacity: 1, scale: 1}}
                                exit={{opacity: 0, scale: 0.95}}
                                transition={{delay: index * 0.03}}
                                onClick={() => onPairSelect && onPairSelect(pair)}
                                style={{
                                    padding: '16px',
                                    borderRadius: '10px',
                                    backgroundColor: theme.bg,
                                    border: `1px solid ${theme.border}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                                whileHover={{scale: 1.02}}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = theme.primary;
                                    e.currentTarget.style.boxShadow = `0 4px 16px ${theme.primary}15`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = theme.border;
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {pair.is_featured && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        backgroundColor: `${theme.primary}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}>
                                        <Star style={{
                                            width: '10px',
                                            height: '10px',
                                            color: theme.primary,
                                            fill: theme.primary
                                        }}/>
                                        <span style={{
                                            fontSize: '10px',
                                            fontWeight: '700',
                                            color: theme.primary,
                                        }}>
                                            {t('exchange_popular') || 'Popular'}
                                        </span>
                                    </div>
                                )}

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '12px',
                                }}>
                                    <span style={{
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        color: theme.text,
                                    }}>
                                        {pair.from_currency.symbol}
                                    </span>
                                    <span style={{
                                        fontSize: '14px',
                                        color: theme.textMuted,
                                        fontWeight: '500',
                                    }}>
                                        /
                                    </span>
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: theme.textMuted,
                                    }}>
                                        {pair.to_currency.symbol}
                                    </span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '12px',
                                }}>
                                    <span style={{
                                        fontSize: '20px',
                                        fontWeight: '700',
                                        color: theme.text,
                                    }}>
                                        {formatNumber(pair.current_price, 4)}
                                    </span>
                                    <div style={{
                                        padding: '6px 10px',
                                        borderRadius: '6px',
                                        backgroundColor: isPositive ? '#10B98120' : '#EF444420',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                    }}>
                                        {isPositive ? (
                                            <TrendingUp style={{width: '14px', height: '14px', color: '#10B981'}}/>
                                        ) : (
                                            <TrendingDown style={{width: '14px', height: '14px', color: '#EF4444'}}/>
                                        )}
                                        <span style={{
                                            fontSize: '13px',
                                            fontWeight: '700',
                                            color: isPositive ? '#10B981' : '#EF4444',
                                        }}>
                                            {isPositive ? '+' : ''}{parseFloat(pair.change_24h).toFixed(2)}%
                                        </span>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '12px',
                                    paddingTop: '12px',
                                    borderTop: `1px solid ${theme.border}`,
                                }}>
                                    <div>
                                        <div style={{
                                            fontSize: '10px',
                                            color: theme.textMuted,
                                            marginBottom: '4px',
                                            fontWeight: '500',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }}>
                                            {t('exchange_24h_high') || '24h High'}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            color: '#10B981',
                                        }}>
                                            {formatNumber(pair.high_24h, 4)}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{
                                            fontSize: '10px',
                                            color: theme.textMuted,
                                            marginBottom: '4px',
                                            fontWeight: '500',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }}>
                                            {t('exchange_24h_low') || '24h Low'}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            color: '#EF4444',
                                        }}>
                                            {formatNumber(pair.low_24h, 4)}
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: '12px',
                                    paddingTop: '12px',
                                    borderTop: `1px solid ${theme.border}`,
                                }}>
                                    <div style={{
                                        fontSize: '10px',
                                        color: theme.textMuted,
                                        marginBottom: '4px',
                                        fontWeight: '500',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}>
                                        {t('exchange_24h_volume') || '24h Volume'}
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        color: theme.text,
                                    }}>
                                        {formatNumber(pair.volume_24h, 2)} {pair.from_currency.symbol}
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: '12px',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    backgroundColor: `${theme.primary}08`,
                                    textAlign: 'center',
                                }}>
                                    <span style={{
                                        fontSize: '11px',
                                        color: theme.primary,
                                        fontWeight: '600',
                                    }}>
                                        {t('exchange_click_to_trade') || 'Click to trade'} →
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {sortedPairs.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                }}>
                    <Activity style={{
                        width: '48px',
                        height: '48px',
                        color: theme.textMuted,
                        margin: '0 auto 16px',
                        opacity: 0.5,
                    }}/>
                    <p style={{
                        fontSize: '14px',
                        color: theme.textMuted,
                        fontWeight: '500',
                    }}>
                        {t('exchange_no_pairs_found') || 'No trading pairs found'}
                    </p>
                    <p style={{
                        fontSize: '12px',
                        color: theme.textMuted,
                        marginTop: '8px',
                    }}>
                        Try adjusting your search or filters
                    </p>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: ${theme.bg};
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${theme.border};
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${theme.primary};
                }
            `}</style>
        </motion.div>
    );
};

export default TradingPairs;
