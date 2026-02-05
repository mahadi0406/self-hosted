import React, {useState, useRef, useEffect} from 'react';
import {createPortal} from 'react-dom';
import {Link, usePage} from '@inertiajs/react';
import {useTranslation} from '@/hooks/useTranslation';

export default function ExchangeFooter() {
    const {primaryColor = '#f59e0b', appName = 'P2PExchange'} = usePage().props;
    const {currentLanguage, languages, changeLanguage, isChanging, t} = useTranslation();
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const [showCookieConsent, setShowCookieConsent] = useState(false);
    const languageButton = useRef(null);
    const dropdownMenu = useRef(null);
    const [dropdownStyle, setDropdownStyle] = useState({});

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

    const themeColors = {
        primary: primaryColor,
        primaryRgb: `${hexToRgb(primaryColor).r}, ${hexToRgb(primaryColor).g}, ${hexToRgb(primaryColor).b}`
    };

    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setTimeout(() => {
                setShowCookieConsent(true);
            }, 500);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookie_consent', 'accepted');
        setShowCookieConsent(false);
    };

    const declineCookies = () => {
        localStorage.setItem('cookie_consent', 'declined');
        setShowCookieConsent(false);
    };

    const updateDropdownPosition = () => {
        if (!languageButton.current) {
            return;
        }

        const buttonRect = languageButton.current.getBoundingClientRect();
        const dropdownWidth = 240;
        const dropdownHeight = Math.min(languages?.length * 60 || 200, 320);
        const spacing = 12;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;

        // Prefer opening downward, only open upward if insufficient space below
        let top;
        let openUpward = false;
        if (spaceBelow >= dropdownHeight + spacing) {
            top = buttonRect.bottom + spacing;
        } else if (spaceAbove > spaceBelow && spaceAbove >= dropdownHeight + spacing) {
            top = buttonRect.top - dropdownHeight - spacing;
            openUpward = true;
        } else {
            // Not enough space either direction, position with most space
            if (spaceAbove > spaceBelow) {
                top = Math.max(spacing, buttonRect.top - dropdownHeight - spacing);
                openUpward = true;
            } else {
                top = buttonRect.bottom + spacing;
            }
        }

        // Center dropdown under/above button, but keep within viewport
        let left = buttonRect.left + (buttonRect.width / 2) - (dropdownWidth / 2);
        const maxLeft = viewportWidth - dropdownWidth - 16;
        const minLeft = 16;

        if (left > maxLeft) {
            left = maxLeft;
        }
        if (left < minLeft) {
            left = minLeft;
        }

        setDropdownStyle({
            position: 'fixed',
            top: `${top}px`,
            left: `${left}px`,
            width: `${dropdownWidth}px`,
            zIndex: 999999,
            transformOrigin: openUpward ? 'bottom' : 'top'
        });
    };

    const handleLanguageChange = async (lang) => {
        setShowLanguageDropdown(false);
        try {
            await changeLanguage(lang.code);
        } catch (error) {
            console.error('Language change error:', error);
        }
    };

    const handleButtonClick = (e) => {
        e.stopPropagation();
        setShowLanguageDropdown(prev => !prev);
    };

    const handleClickOutside = (event) => {
        if (
            languageButton.current &&
            !languageButton.current.contains(event.target) &&
            dropdownMenu.current &&
            !dropdownMenu.current.contains(event.target)
        ) {
            setShowLanguageDropdown(false);
        }
    };

    useEffect(() => {
        if (showLanguageDropdown) {
            updateDropdownPosition();
            const timer = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 100);

            window.addEventListener('scroll', updateDropdownPosition, true);
            window.addEventListener('resize', updateDropdownPosition);

            return () => {
                clearTimeout(timer);
                document.removeEventListener('mousedown', handleClickOutside);
                window.removeEventListener('scroll', updateDropdownPosition, true);
                window.removeEventListener('resize', updateDropdownPosition);
            };
        }
    }, [showLanguageDropdown]);

    const dropdownContent = showLanguageDropdown && (
        <div
            ref={dropdownMenu}
            style={{
                ...dropdownStyle,
                backgroundColor: 'rgba(23, 37, 56, 0.98)',
                border: '1px solid rgba(55, 65, 81, 0.5)',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                backdropFilter: 'blur(24px)',
                maxWidth: 'calc(100vw - 32px)',
                animation: 'dropdownSlide 0.2s ease-out'
            }}
        >
            <div style={{
                padding: '8px',
                maxHeight: '320px',
                overflowY: 'auto',
                overflowX: 'hidden'
            }}>
                {languages && languages.length > 0 ? languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleLanguageChange(lang);
                        }}
                        disabled={isChanging}
                        type="button"
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            backgroundColor: currentLanguage.code === lang.code ? 'rgba(55, 65, 81, 0.6)' : 'transparent',
                            color: '#ffffff',
                            cursor: isChanging ? 'not-allowed' : 'pointer',
                            opacity: isChanging ? 0.6 : 1,
                            border: 'none',
                            borderRadius: '12px',
                            transition: 'all 0.2s ease',
                            marginBottom: '4px'
                        }}
                        onMouseEnter={(e) => {
                            if (currentLanguage.code !== lang.code && !isChanging) {
                                e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = currentLanguage.code === lang.code
                                ? 'rgba(55, 65, 81, 0.6)'
                                : 'transparent';
                        }}
                    >
                        <span style={{fontSize: '24px', flexShrink: 0, lineHeight: 1}}>{lang.flag}</span>
                        <div style={{flex: 1, minWidth: 0}}>
                            <div style={{
                                fontSize: '15px',
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                marginBottom: '2px',
                                color: '#ffffff'
                            }}>
                                {lang.name}
                            </div>
                            <div style={{
                                fontSize: '13px',
                                color: '#9ca3af',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {lang.nativeName}
                            </div>
                        </div>
                        {currentLanguage.code === lang.code && (
                            <svg
                                style={{width: '20px', height: '20px', flexShrink: 0, color: themeColors.primary}}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                            </svg>
                        )}
                    </button>
                )) : (
                    <div style={{padding: '20px', fontSize: '14px', color: '#6b7280', textAlign: 'center'}}>
                        No languages available
                    </div>
                )}
            </div>
        </div>
    );

    const cookieConsentContent = showCookieConsent && (
        <div
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 999999,
                padding: window.innerWidth < 640 ? '16px' : '24px',
                backgroundColor: 'rgba(15, 23, 42, 0.98)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
                animation: 'slideUpCookie 0.3s ease-out'
            }}
        >
            <div style={{maxWidth: '1280px', margin: '0 auto'}}>
                <div style={{
                    display: 'flex',
                    flexDirection: window.innerWidth < 640 ? 'column' : 'row',
                    alignItems: window.innerWidth < 640 ? 'flex-start' : 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                }}>
                    <div style={{flex: 1}}>
                        <p style={{
                            fontSize: '14px',
                            color: '#d1d5db',
                            marginBottom: '8px',
                            fontWeight: 500
                        }}>
                            {t('cookie_consent_title')}
                        </p>
                        <p style={{
                            fontSize: '12px',
                            color: '#9ca3af'
                        }}>
                            {t('cookie_consent_description', {appName})}{' '}
                            <Link
                                href="/cookie-policy"
                                style={{
                                    color: themeColors.primary,
                                    textDecoration: 'underline',
                                    cursor: 'pointer'
                                }}
                            >
                                {t('cookie_policy')}
                            </Link>
                            .
                        </p>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: window.innerWidth < 640 ? '100%' : 'auto'
                    }}>
                        <button
                            onClick={declineCookies}
                            style={{
                                flex: window.innerWidth < 640 ? 1 : 'none',
                                padding: '10px 20px',
                                fontSize: '14px',
                                fontWeight: 500,
                                borderRadius: '8px',
                                transition: 'all 0.3s',
                                border: '1px solid rgba(55, 65, 81, 1)',
                                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                color: '#d1d5db',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.8)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.8)'}
                        >
                            {t('cookie_decline')}
                        </button>
                        <button
                            onClick={acceptCookies}
                            style={{
                                flex: window.innerWidth < 640 ? 1 : 'none',
                                padding: '10px 20px',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: 'white',
                                borderRadius: '8px',
                                transition: 'all 0.3s',
                                backgroundColor: themeColors.primary,
                                boxShadow: `0 0 20px rgba(${themeColors.primaryRgb}, 0.3)`,
                                border: 'none',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 0 30px rgba(${themeColors.primaryRgb}, 0.5)`}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = `0 0 20px rgba(${themeColors.primaryRgb}, 0.3)`}
                        >
                            {t('cookie_accept')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <footer
                className="relative border-t backdrop-blur-xl py-4 sm:py-6 mt-auto"
                style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
            >
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
                        <p className="text-xs sm:text-sm text-gray-400 text-center md:text-left order-3 md:order-1">
                            © {currentYear} {appName}. {t('all_rights_reserved')}.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 order-2">
                            <Link
                                href="/privacy-policy"
                                className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors font-medium whitespace-nowrap"
                            >
                                {t('privacy_policy')}
                            </Link>
                            <Link
                                href="/terms-of-service"
                                className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors font-medium whitespace-nowrap"
                            >
                                {t('terms_of_service')}
                            </Link>
                            <Link
                                href="/cookie-policy"
                                className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors font-medium whitespace-nowrap"
                            >
                                {t('cookie_policy_link')}
                            </Link>
                        </div>

                        <div className="relative order-1 md:order-3">
                            <button
                                ref={languageButton}
                                onClick={handleButtonClick}
                                disabled={isChanging}
                                type="button"
                                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-300 border text-sm font-medium"
                                style={{
                                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                                    color: '#ffffff',
                                    borderColor: 'rgba(71, 85, 105, 0.8)',
                                    cursor: isChanging ? 'not-allowed' : 'pointer',
                                    opacity: isChanging ? 0.6 : 1,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isChanging) {
                                        e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.9)';
                                        e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.9)';
                                    e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.8)';
                                }}
                                aria-label="Select language"
                                aria-expanded={showLanguageDropdown}
                            >
                                <span className="text-lg">{currentLanguage.flag}</span>
                                <span className="font-semibold tracking-wide">{currentLanguage.code.toUpperCase()}</span>
                                <svg
                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${showLanguageDropdown ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2.5"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
                {typeof document !== 'undefined' && createPortal(cookieConsentContent, document.body)}

                <style jsx>{`
                    @keyframes slideUpCookie {
                        from {
                            transform: translateY(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }

                    @keyframes dropdownSlide {
                        from {
                            opacity: 0;
                            transform: translateY(-8px) scale(0.96);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .transition-all,
                        .transition-colors,
                        .transition-transform {
                            transition: none !important;
                        }
                        @keyframes slideUpCookie,
                    @keyframes dropdownSlide {
                        from, to {
                            transform: translateY(0) scale(1);
                            opacity: 1;
                        }
                    }
                    }
                `}</style>
            </footer>
        </>
    );
}
