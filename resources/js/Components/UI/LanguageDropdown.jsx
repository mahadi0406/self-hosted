import {useTheme} from '@/Context/ThemeContext.jsx';

export function LanguageDropdown({languages, selectedLang, onSelect, isOpen, onToggle, compact = false}) {
    const {theme} = useTheme();

    return (
        <div className="lang-dropdown" style={{position: 'relative'}}>
            <button
                onClick={onToggle}
                style={{
                    padding: compact ? '9px' : '9px 14px',
                    borderRadius: '8px',
                    background: theme.bgSecondary,
                    border: `1px solid ${theme.border}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    color: theme.text,
                    fontWeight: '500'
                }}
            >
                <span style={{fontSize: '16px'}}>{selectedLang?.flag}</span>
                {!compact && <span>{selectedLang?.code?.toUpperCase()}</span>}
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                    }}
                >
                    <path
                        d="M2.5 4.5L6 8L9.5 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: theme.bgSecondary,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px',
                    padding: '8px',
                    minWidth: '180px',
                    boxShadow: theme.isDark
                        ? '0 4px 12px rgba(0,0,0,0.3)'
                        : '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    maxHeight: '300px',
                    overflowY: 'auto'
                }}>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => onSelect(lang)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: 'none',
                                background: selectedLang?.code === lang.code
                                    ? theme.primaryLight
                                    : 'transparent',
                                color: selectedLang?.code === lang.code
                                    ? theme.primary
                                    : theme.text,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '14px',
                                fontWeight: selectedLang?.code === lang.code ? '600' : '400',
                                textAlign: 'left',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (selectedLang?.code !== lang.code) {
                                    e.target.style.background = theme.bgTertiary || theme.bgSecondary;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedLang?.code !== lang.code) {
                                    e.target.style.background = 'transparent';
                                }
                            }}
                        >
                            <span style={{fontSize: '18px'}}>{lang.flag}</span>
                            <span>{lang.name}</span>
                            {selectedLang?.code === lang.code && (
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    style={{marginLeft: 'auto'}}
                                >
                                    <path
                                        d="M13.5 4.5L6 12L2.5 8.5"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
