import {motion, AnimatePresence} from 'framer-motion';
import {useTheme} from '@/Context/ThemeContext.jsx';
import {ChevronRight, ChevronDown} from '@/Components/Icons/index.jsx';

export function Button({
                           children,
                           variant = 'primary',
                           size = 'md',
                           icon,
                           iconPosition = 'right',
                           className = '',
                           primaryColor,
                           ...props
                       }) {
    const {theme} = useTheme();
    const dynamicPrimary = primaryColor || theme.primary || '#e8a95d';

    const baseStyles = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: '10px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
    };

    const sizeStyles = {
        sm: {height: '40px', padding: '0 18px', fontSize: '13px'},
        md: {height: '50px', padding: '0 32px', fontSize: '15px'},
        lg: {height: '56px', padding: '0 40px', fontSize: '16px'},
    };

    const variantStyles = {
        primary: {
            background: dynamicPrimary,
            color: '#fff',
        },
        secondary: {
            background: 'transparent',
            color: theme.text,
            border: `1px solid ${theme.border}`,
        },
        outline: {
            background: 'transparent',
            color: '#fff',
            border: '2px solid rgba(255,255,255,0.3)',
        },
        white: {
            background: '#fff',
            color: '#1a1a1a',
        },
    };

    return (
        <button
            style={{...baseStyles, ...sizeStyles[size], ...variantStyles[variant]}}
            className={className}
            {...props}
        >
            {iconPosition === 'left' && icon}
            {children}
            {iconPosition === 'right' && (icon || (variant === 'primary' && <ChevronRight className="w-4 h-4"/>))}
        </button>
    );
}

export function Badge({children, variant = 'primary', className = '', primaryColor}) {
    const {theme} = useTheme();
    const dynamicPrimary = primaryColor || theme.primary || '#e8a95d';

    const styles = {
        primary: {
            background: `${dynamicPrimary}20`,
            color: dynamicPrimary,
        },
        secondary: {
            background: theme.bgSecondary,
            color: dynamicPrimary,
            border: `1px solid ${theme.border}`,
        },
        new: {
            background: dynamicPrimary,
            color: '#fff',
            fontSize: '11px',
        },
    };

    return (
        <span
            style={{
                display: 'inline-block',
                padding: variant === 'new' ? '5px 12px' : '8px 16px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                ...styles[variant],
            }}
            className={className}
        >
            {children}
        </span>
    );
}

export function SectionHeader({badge, title, description, centered = true, primaryColor}) {
    const {theme} = useTheme();

    return (
        <div style={{
            textAlign: centered ? 'center' : 'left',
            marginBottom: '48px'
        }}>
            {badge && (
                <Badge variant="primary" className="mb-4" primaryColor={primaryColor}>
                    {badge}
                </Badge>
            )}
            <h2 style={{
                fontSize: 'clamp(26px, 5vw, 36px)',
                fontWeight: '700',
                marginBottom: '12px',
                marginTop: badge ? '16px' : '0',
                color: theme.text,
            }}>
                {title}
            </h2>
            {description && (
                <p style={{
                    color: theme.textMuted,
                    fontSize: '15px',
                    maxWidth: centered ? '450px' : 'none',
                    margin: centered ? '0 auto' : '0',
                }}>
                    {description}
                </p>
            )}
        </div>
    );
}

export function Card({children, className = '', hover = true, primaryColor, ...props}) {
    const {theme} = useTheme();
    const dynamicPrimary = primaryColor || theme.primary || '#e8a95d';

    const handleMouseOver = (e) => {
        if (hover) {
            e.currentTarget.style.borderColor = dynamicPrimary;
            e.currentTarget.style.transform = 'translateY(-3px)';
        }
    };

    const handleMouseOut = (e) => {
        if (hover) {
            e.currentTarget.style.borderColor = theme.border;
            e.currentTarget.style.transform = 'translateY(0)';
        }
    };

    return (
        <div
            style={{
                padding: '28px',
                borderRadius: '14px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.card,
                transition: 'all 0.2s',
                height: '100%',
            }}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            className={className}
            {...props}
        >
            {children}
        </div>
    );
}

export function IconBox({children, size = 'md', variant = 'primary', primaryColor}) {
    const {theme} = useTheme();
    const dynamicPrimary = primaryColor || theme.primary || '#e8a95d';

    const sizes = {
        sm: {width: '28px', height: '28px', borderRadius: '8px'},
        md: {width: '46px', height: '46px', borderRadius: '12px'},
        lg: {width: '50px', height: '50px', borderRadius: '12px'},
    };

    const variants = {
        primary: {background: dynamicPrimary, color: '#fff'},
        light: {background: `${dynamicPrimary}20`, color: dynamicPrimary},
    };

    return (
        <div style={{
            ...sizes[size],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...variants[variant],
        }}>
            {children}
        </div>
    );
}

export {LanguageDropdown} from './LanguageDropdown';

export function Accordion({items, openIndex, onToggle, primaryColor}) {
    const {theme} = useTheme();
    const dynamicPrimary = primaryColor || theme.primary || '#e8a95d';

    return (
        <div>
            {items.map((item, i) => (
                <div
                    key={i}
                    style={{
                        borderRadius: '12px',
                        marginBottom: '10px',
                        backgroundColor: theme.card,
                        border: `1px solid ${openIndex === i ? dynamicPrimary : theme.border}`,
                        overflow: 'hidden',
                        transition: 'all 0.2s'
                    }}
                >
                    <button
                        onClick={() => onToggle(openIndex === i ? null : i)}
                        style={{
                            display: 'flex',
                            width: '100%',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            textAlign: 'left',
                            fontWeight: '600',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: theme.text,
                            fontSize: '15px',
                            padding: '20px 22px'
                        }}
                    >
                        <span style={{paddingRight: '16px'}}>{item.q}</span>
                        <ChevronDown
                            className="w-5 h-5"
                            style={{
                                transition: 'transform 0.2s',
                                color: theme.textMuted,
                                transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0)',
                                flexShrink: 0
                            }}
                        />
                    </button>
                    <AnimatePresence>
                        {openIndex === i && (
                            <motion.div
                                initial={{opacity: 0, height: 0}}
                                animate={{opacity: 1, height: 'auto'}}
                                exit={{opacity: 0, height: 0}}
                                style={{
                                    padding: '0 22px 20px',
                                    color: theme.textMuted,
                                    lineHeight: 1.7,
                                    fontSize: '14px'
                                }}
                            >
                                {item.a}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}

export const containerVariants = {
    hidden: {opacity: 0},
    show: {
        opacity: 1,
        transition: {staggerChildren: 0.06}
    }
};

export const itemVariants = {
    hidden: {opacity: 0, y: 15},
    show: {
        opacity: 1,
        y: 0,
        transition: {duration: 0.4}
    }
};
