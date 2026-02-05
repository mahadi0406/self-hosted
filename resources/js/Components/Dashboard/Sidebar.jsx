import {Link, router, usePage} from '@inertiajs/react';
import {
    Home, ArrowLeftRight, Repeat, CreditCard, ChevronDown, LogOut, Package, MoreHorizontal, RefreshCw, FileText, Bell,
    Wallet, DollarSign, ShieldCheck, MessageSquare
} from 'lucide-react';
import {useRef, useCallback, useEffect} from 'react';
import {useTranslation} from '@/hooks/useTranslation';

export default function Sidebar({isOpen, onClose, activeTab, setActiveTab, expandedMenus, toggleMenu, user, theme}) {
    const {t} = useTranslation();
    const {appName} = usePage().props;
    const sidebarRef = useRef(null);
    const navRef = useRef(null);
    const isNavigatingRef = useRef(false);

    const navItems = [
        {type: 'label', label: t('nav_home')},
        {id: 'dashboard', label: t('nav_dashboard'), icon: Home, href: '/user/dashboard'},
        {id: 'wallet', label: t('nav_wallets'), icon: Wallet, href: '/user/wallets'},
        {id: 'transactions', label: t('nav_transactions'), icon: DollarSign, href: '/user/wallet/transactions'},

        {type: 'label', label: t('nav_p2p_trading')},
        {
            id: 'p2p-market',
            label: t('nav_p2p_market'),
            icon: ArrowLeftRight,
            submenu: [
                {id: 'buy', label: t('nav_buy_crypto'), href: '/user/p2p/buy'},
                {id: 'sell', label: t('nav_sell_crypto'), href: '/user/p2p/sell'},
            ]
        },
        {id: 'my-offers', label: t('nav_my_offers'), icon: Package, href: '/user/p2p/offers'},
        {id: 'my-trades', label: t('nav_my_trades'), icon: Repeat, href: '/user/p2p/trades'},

        {type: 'label', label: t('nav_exchange')},
        {id: 'exchange', label: t('nav_exchange_menu'), icon: RefreshCw, href: '/user/exchange'},
        {id: 'exchange-orders', label: t('nav_my_orders'), icon: FileText, href: '/user/exchange/orders'},
        {id: 'price-alerts', label: t('nav_price_alerts'), icon: Bell, href: '/user/exchange/alerts'},

        {type: 'label', label: t('nav_account')},
        {id: 'kyc', label: t('nav_kyc_verification'), icon: ShieldCheck, href: '/user/kyc'},
        {id: 'payment-methods', label: t('nav_payment_methods'), icon: CreditCard, href: '/user/payment-methods'},
        {id: 'support', label: t('nav_support'), icon: MessageSquare, href: '/user/support'},
        {
            id: 'more',
            label: t('nav_more'),
            icon: MoreHorizontal,
            submenu: [
                {id: 'reviews', label: t('nav_my_reviews'), href: '/user/reviews'},
                {id: 'disputes', label: t('nav_my_disputes'), href: '/user/disputes'},
                {id: 'blocked-users', label: t('nav_blocked_users'), href: '/user/blocked-users'},
            ]
        },
    ];

    useEffect(() => {
        const currentPath = window.location.pathname;

        for (const item of navItems) {
            if (item.href === currentPath) {
                setActiveTab(item.id);
                return;
            }

            if (item.submenu) {
                for (const sub of item.submenu) {
                    if (sub.href === currentPath) {
                        setActiveTab(sub.id);
                        setTimeout(() => {
                            if (!expandedMenus.includes(item.id)) {
                                toggleMenu(item.id);
                            }
                        }, 0);
                        return;
                    }
                }
            }
        }
    }, [window.location.pathname, setActiveTab, expandedMenus, toggleMenu]);


    useEffect(() => {
        const isMobile = window.innerWidth < 1024;
        if (isOpen && isMobile) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [isOpen]);

    const handleNavigation = useCallback((e, href, tabId) => {
        e.preventDefault();

        if (isNavigatingRef.current) return;
        isNavigatingRef.current = true;

        setActiveTab(tabId);
        onClose();

        setTimeout(() => {
            router.visit(href, {
                preserveState: true,
                preserveScroll: false,
                onFinish: () => {
                    isNavigatingRef.current = false;
                }
            });
        }, 300);
    }, [onClose, setActiveTab]);

    const handleOverlayClick = useCallback(() => {
        onClose();
    }, [onClose]);

    const overlayStyle = {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 40,
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-out',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'none',
    };

    const sidebarStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '260px',
        maxWidth: 'calc(100vw - 60px)',
        backgroundColor: theme.bg,
        borderRight: `1px solid ${theme.border}`,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        transform: isOpen ? 'translateX(0%)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        WebkitTransform: isOpen ? 'translateX(0%)' : 'translateX(-100%)',
    };

    return (
        <>
            <div
                className="sidebar-overlay"
                onClick={handleOverlayClick}
                style={overlayStyle}
                aria-hidden="true"
            />

            <aside
                ref={sidebarRef}
                className="sidebar"
                style={sidebarStyle}
                aria-label="Main navigation"
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        borderBottom: `1px solid ${theme.border}`,
                        flexShrink: 0,
                    }}
                >
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: `1px solid ${theme.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg style={{width: '18px', height: '18px', color: theme.primary}} viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round">
                                <rect x="2" y="6" width="20" height="14" rx="2"/>
                                <path d="M2 10h20"/>
                                <circle cx="16" cy="14" r="2"/>
                            </svg>
                        </div>
                        <span style={{fontSize: '15px', fontWeight: '700', color: theme.text}}>
                            {appName || 'P2P'}
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        className="sidebar-close-btn"
                        aria-label="Close sidebar"
                        style={{
                            padding: '8px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: theme.textMuted,
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            WebkitTapHighlightColor: 'transparent',
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <nav
                    ref={navRef}
                    className="sidebar-nav"
                    style={{
                        flex: 1,
                        padding: '16px',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        WebkitOverflowScrolling: 'touch',
                        overscrollBehavior: 'contain',
                        scrollBehavior: 'smooth',
                    }}
                >
                    {navItems.map((item, index) => {
                        if (item.type === 'label') {
                            return (
                                <p
                                    key={index}
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        letterSpacing: '0.5px',
                                        color: theme.textLight,
                                        padding: '16px 12px 8px',
                                        marginTop: index > 0 ? '8px' : '0',
                                    }}
                                >
                                    {item.label}
                                </p>
                            );
                        }

                        const Icon = item.icon;
                        const hasSubmenu = item.submenu;
                        const isActive = activeTab === item.id ||
                            (hasSubmenu && item.submenu.some(sub => sub.id === activeTab));
                        const isExpanded = expandedMenus.includes(item.id) ||
                            (hasSubmenu && item.submenu.some(sub => sub.id === activeTab));

                        return (
                            <div key={item.id}>
                                {hasSubmenu ? (
                                    <button
                                        onClick={() => toggleMenu(item.id)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: isActive ? theme.bgHover : 'transparent',
                                            color: isActive ? theme.text : theme.textMuted,
                                            fontSize: '14px',
                                            fontWeight: isActive ? '500' : '400',
                                            cursor: 'pointer',
                                            marginBottom: '2px',
                                            textAlign: 'left',
                                            minHeight: '44px',
                                            WebkitTapHighlightColor: 'transparent',
                                            transition: 'background-color 0.2s ease, color 0.2s ease',
                                        }}
                                    >
                                        <Icon style={{width: '18px', height: '18px', flexShrink: 0}}/>
                                        <span style={{flex: 1}}>{item.label}</span>
                                        <ChevronDown
                                            style={{
                                                width: '16px',
                                                height: '16px',
                                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                                                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                flexShrink: 0,
                                            }}
                                        />
                                    </button>
                                ) : (

                                    <a href={item.href}
                                       onClick={(e) => handleNavigation(e, item.href, item.id)}
                                       style={{
                                           display: 'flex',
                                           alignItems: 'center',
                                           gap: '12px',
                                           padding: '12px',
                                           borderRadius: '8px',
                                           background: isActive ? theme.bgHover : 'transparent',
                                           color: isActive ? theme.text : theme.textMuted,
                                           fontSize: '14px',
                                           fontWeight: isActive ? '500' : '400',
                                           marginBottom: '2px',
                                           textDecoration: 'none',
                                           minHeight: '44px',
                                           WebkitTapHighlightColor: 'transparent',
                                           transition: 'background-color 0.2s ease, color 0.2s ease',
                                       }}
                                    >
                                        <Icon style={{width: '18px', height: '18px', flexShrink: 0}}/>
                                        <span>{item.label}</span>
                                    </a>
                                )}

                                <div
                                    className="submenu-container"
                                    style={{
                                        marginLeft: '42px',
                                        overflow: 'hidden',
                                        maxHeight: hasSubmenu && isExpanded ? `${(item.submenu?.length || 0) * 44}px` : '0',
                                        opacity: hasSubmenu && isExpanded ? 1 : 0,
                                        transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        willChange: 'max-height, opacity',
                                    }}
                                >
                                    {hasSubmenu && item.submenu.map((sub) => (

                                        <a key={sub.id}
                                           href={sub.href}
                                           onClick={(e) => handleNavigation(e, sub.href, sub.id)}
                                           style={{
                                               padding: '10px 12px',
                                               borderRadius: '6px',
                                               background: activeTab === sub.id ? theme.bgHover : 'transparent',
                                               color: activeTab === sub.id ? theme.text : theme.textMuted,
                                               fontSize: '13px',
                                               fontWeight: activeTab === sub.id ? '500' : '400',
                                               textDecoration: 'none',
                                               marginBottom: '2px',
                                               minHeight: '40px',
                                               display: 'flex',
                                               alignItems: 'center',
                                               WebkitTapHighlightColor: 'transparent',
                                               transition: 'background-color 0.2s ease, color 0.2s ease',
                                           }}
                                        >
                                            {sub.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                <div style={{
                    borderTop: `1px solid ${theme.border}`,
                    padding: '16px',
                    paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
                    flexShrink: 0,
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px',
                        marginBottom: '8px'
                    }}>
                        <div
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: theme.bgHover,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '600',
                                fontSize: '13px',
                                color: theme.text,
                                flexShrink: 0,
                            }}
                        >
                            {user?.initials || 'JD'}
                        </div>
                        <div style={{minWidth: 0, flex: 1}}>
                            <p style={{
                                fontWeight: '600',
                                fontSize: '14px',
                                color: theme.text,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                {user?.name || 'John Doe'}
                            </p>
                            <p style={{fontSize: '12px', color: theme.textMuted}}>{t('nav_user')}</p>
                        </div>
                    </div>

                    <Link
                        href="/logout"
                        method="get"
                        as="button"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: theme.danger,
                            fontSize: '14px',
                            fontWeight: '500',
                            borderRadius: '8px',
                            minHeight: '44px',
                            WebkitTapHighlightColor: 'transparent',
                            transition: 'background-color 0.2s ease',
                        }}
                    >
                        <LogOut style={{width: '18px', height: '18px'}}/>
                        {t('nav_logout')}
                    </Link>
                </div>
            </aside>

            <style>{`
                .sidebar-nav::-webkit-scrollbar {
                    width: 6px;
                }

                .sidebar-nav::-webkit-scrollbar-track {
                    background: transparent;
                }

                .sidebar-nav::-webkit-scrollbar-thumb {
                    background: ${theme.border};
                    border-radius: 3px;
                    transition: background 0.2s ease;
                }

                .sidebar-nav::-webkit-scrollbar-thumb:hover {
                    background: ${theme.textMuted};
                }

                .sidebar-nav {
                    scrollbar-width: thin;
                    scrollbar-color: ${theme.border} transparent;
                }

                .submenu-container {
                    transform: translateZ(0);
                    -webkit-transform: translateZ(0);
                }

                .sidebar a:hover,
                .sidebar button:hover {
                    background-color: ${theme.bgHover} !important;
                }

                @media (min-width: 1024px) {
                    .sidebar-close-btn {
                        display: none !important;
                    }
                    .sidebar {
                        transform: translateX(0) !important;
                        -webkit-transform: translateX(0) !important;
                    }
                    .sidebar-overlay {
                        display: none !important;
                    }
                }

                @media (max-width: 320px) {
                    .sidebar {
                        width: 240px !important;
                    }
                }

                .sidebar * {
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                }

                .sidebar,
                .sidebar-nav,
                .submenu-container {
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
            `}</style>
        </>
    );
}
