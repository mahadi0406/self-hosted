import {Menu, Moon, Sun, ArrowLeftRight, Wallet, LogOut, Settings} from './Icons';
import {useState, useRef, useEffect} from 'react';
import {Link, router, usePage} from '@inertiajs/react';
import {useTranslation} from '@/hooks/useTranslation';

export default function Header({onMenuClick, user, title, theme, themeMode, toggleTheme}) {
    const {t} = useTranslation();
    const {appName} = usePage().props;
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleWalletClick = () => {
        setShowProfileMenu(false);
        router.get(`/user/wallets`);
    };

    const handleSettingsClick = () => {
        setShowProfileMenu(false);
        router.get(`/user/profile`);
    };

    return (
        <header
            className="header-container"
            style={{
                backgroundColor: theme.bg,
                borderBottom: `1px solid ${theme.border}`,
                padding: '0 16px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                maxWidth: '100%',
                overflow: 'visible',
                position: 'sticky',
                top: 0,
                zIndex: 30,
            }}
        >
            <div className="header-left-group"
                 style={{display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0}}>
                <button
                    onClick={onMenuClick}
                    className="menu-btn"
                    style={{
                        padding: '10px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: theme.textMuted,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        borderRadius: '8px',
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                    }}
                    aria-label="Open menu"
                >
                    <Menu style={{width: '24px', height: '24px'}}/>
                </button>

                <span className="mobile-title" style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: theme.text,
                }}>
                    {title}
                </span>

                <div className="logo-area" style={{display: 'none', alignItems: 'center', gap: '10px', flexShrink: 0}}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <ArrowLeftRight style={{width: '18px', height: '18px', color: theme.primary}}/>
                    </div>
                    <span style={{fontSize: '16px', fontWeight: '700', color: theme.text, whiteSpace: 'nowrap'}}>
                        {t('header_app_first_name')}<span style={{color: theme.primary}}>{t('header_app_last_name')}</span>
                    </span>
                </div>

                <div className="header-divider" style={{
                    display: 'none',
                    width: '1px',
                    height: '24px',
                    backgroundColor: theme.border,
                    flexShrink: 0
                }}/>

                <h1 className="page-title" style={{
                    display: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: theme.text,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minWidth: 0,
                    margin: 0,
                }}>
                    {title}
                </h1>
            </div>

            <div className="header-right-group"
                 style={{display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0}}>

                <button
                    onClick={toggleTheme}
                    className="theme-toggle-btn"
                    style={{
                        display: 'none',
                        padding: '10px',
                        background: theme.bg,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: theme.textMuted,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        WebkitTapHighlightColor: 'transparent',
                    }}
                >
                    {themeMode === 'dark' ? <Sun style={{width: '18px', height: '18px'}}/> :
                        <Moon style={{width: '18px', height: '18px'}}/>}
                </button>

                <div ref={profileMenuRef} style={{position: 'relative', zIndex: 50}}>
                    <div
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${theme.primary} 0%, #E5B585 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600',
                            fontSize: '13px',
                            color: '#fff',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {user?.initials || 'TU'}
                    </div>

                    {showProfileMenu && (
                        <div
                            className="profile-dropdown"
                            style={{
                                position: 'absolute',
                                top: '48px',
                                right: '0',
                                backgroundColor: theme.bg,
                                border: `1px solid ${theme.border}`,
                                borderRadius: '12px',
                                boxShadow: themeMode === 'dark'
                                    ? '0 4px 20px rgba(0, 0, 0, 0.5)'
                                    : '0 4px 20px rgba(0, 0, 0, 0.1)',
                                minWidth: '200px',
                                overflow: 'hidden',
                                zIndex: 1000,
                                animation: 'slideDown 0.2s ease-out',
                            }}
                        >
                            <div style={{
                                padding: '16px',
                                borderBottom: `1px solid ${theme.border}`,
                                background: themeMode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                            }}>
                                <div style={{fontWeight: '600', color: theme.text, fontSize: '15px'}}>
                                    {user?.name || 'Test User'}
                                </div>
                                <div style={{fontSize: '13px', color: theme.textMuted, marginTop: '4px'}}>
                                    {user?.email || 'test@example.com'}
                                </div>
                            </div>

                            <div style={{padding: '8px 0'}}>
                                <button
                                    onClick={handleWalletClick}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: theme.text,
                                        fontSize: '14px',
                                        textAlign: 'left',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.hover}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <Wallet style={{width: '18px', height: '18px', color: theme.textMuted}}/>
                                    <span>{t('header_wallets')}</span>
                                </button>

                                <button
                                    onClick={handleSettingsClick}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: theme.text,
                                        fontSize: '14px',
                                        textAlign: 'left',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.hover}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <Settings style={{width: '18px', height: '18px', color: theme.textMuted}}/>
                                    <span>{t('header_settings')}</span>
                                </button>
                            </div>

                            <div style={{borderTop: `1px solid ${theme.border}`, padding: '8px 0'}}>
                                <Link
                                    href="/logout"
                                    method="get"
                                    as="button"
                                    onClick={() => setShowProfileMenu(false)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#EF4444',
                                        fontSize: '14px',
                                        textAlign: 'left',
                                        fontWeight: '500',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                    }}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <LogOut style={{width: '18px', height: '18px'}}/>
                                    <span>{t('header_logout')}</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .profile-dropdown button:active {
                    transform: scale(0.98);
                }

                /* Desktop styles */
                @media (min-width: 640px) {
                    .mobile-title {
                        display: none !important;
                    }
                    .page-title {
                        display: block !important;
                    }
                }

                @media (min-width: 768px) {
                    .header-divider {
                        display: block !important;
                    }
                    .search-bar {
                        display: flex !important;
                        width: 180px !important;
                    }
                }

                @media (min-width: 1024px) {
                    .menu-btn {
                        display: none !important;
                    }
                    .logo-area {
                        display: flex !important;
                    }
                    .theme-toggle-btn {
                        display: flex !important;
                    }
                    .notification-btn {
                        display: flex !important;
                    }
                    .header-container {
                        padding: 0 24px !important;
                    }
                    .header-left-group {
                        gap: 24px !important;
                    }
                    .header-right-group {
                        gap: 12px !important;
                    }
                }

                @media (min-width: 1280px) {
                    .search-bar {
                        width: 280px !important;
                    }
                }
            `}</style>
        </header>
    );
}
