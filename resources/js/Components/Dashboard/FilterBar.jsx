import {motion} from 'framer-motion';
import {Search} from 'lucide-react';
import {useTranslation} from '@/hooks/useTranslation';

const containerVariants = {
    hidden: {opacity: 0},
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
        },
    },
};

const buttonVariants = {
    hidden: {
        opacity: 0,
        scale: 0.9,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
        },
    },
};

export default function FilterBar({
                                      theme,
                                      searchTerm,
                                      setSearchTerm,
                                      searchPlaceholder,
                                      showSearch = true,
                                      filter,
                                      setFilter,
                                      filterOptions = [],
                                      showFilterButtons = true,
                                      selects = [],
                                      inputs = [],
                                      actions = [],
                                  }) {
    const {t} = useTranslation();

    return (
        <>
            <motion.div
                className="filter-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    backgroundColor: theme.bgCard,
                    borderRadius: '12px',
                    padding: '16px',
                    border: `1px solid ${theme.border}`,
                    marginBottom: '24px',
                }}
            >
                <div className="filter-wrapper" style={{
                    display: 'grid',
                    gridTemplateColumns: selects.length > 0 || inputs.length > 0
                        ? `repeat(${selects.length + inputs.length + (showSearch ? 1 : 0) + (actions.length > 0 ? 1 : 0)}, 1fr)`
                        : 'auto',
                    gap: '12px',
                    alignItems: 'end',
                }}>
                    {showSearch && (
                        <motion.div
                            variants={itemVariants}
                            className="search-box"
                            style={{gridColumn: selects.length === 0 && inputs.length === 0 ? '1 / -1' : 'auto'}}
                        >
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                color: theme.textMuted,
                                marginBottom: '8px',
                            }}>
                                {t('search')}
                            </label>
                            <div style={{position: 'relative'}}>
                                <Search style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '18px',
                                    height: '18px',
                                    color: theme.textMuted,
                                }}/>
                                <input
                                    type="text"
                                    placeholder={searchPlaceholder || t('search_placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px 10px 40px',
                                        borderRadius: '8px',
                                        border: `1px solid ${theme.border}`,
                                        backgroundColor: theme.bg,
                                        color: theme.text,
                                        fontSize: '14px',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {selects.map((select, index) => (
                        <motion.div
                            key={select.name || index}
                            variants={itemVariants}
                        >
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                color: theme.textMuted,
                                marginBottom: '8px',
                            }}>
                                {select.label}
                            </label>
                            <select
                                value={select.value}
                                onChange={(e) => select.onChange(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: `1px solid ${theme.border}`,
                                    backgroundColor: theme.bg,
                                    color: theme.text,
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                }}
                            >
                                <option value="">{select.placeholder || t('select_option')}</option>
                                {select.options.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </motion.div>
                    ))}

                    {inputs.map((input, index) => (
                        <motion.div
                            key={input.name || index}
                            variants={itemVariants}
                        >
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                color: theme.textMuted,
                                marginBottom: '8px',
                            }}>
                                {input.label}
                            </label>
                            <input
                                type={input.type || 'text'}
                                placeholder={input.placeholder}
                                value={input.value}
                                onChange={(e) => input.onChange(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: `1px solid ${theme.border}`,
                                    backgroundColor: theme.bg,
                                    color: theme.text,
                                    fontSize: '14px',
                                    outline: 'none',
                                }}
                            />
                        </motion.div>
                    ))}

                    {actions.length > 0 && (
                        <motion.div
                            variants={itemVariants}
                            style={{
                                display: 'flex',
                                gap: '8px',
                            }}
                        >
                            {actions.map((action, index) => (
                                <motion.button
                                    key={action.label || index}
                                    variants={buttonVariants}
                                    whileHover={{
                                        y: -2,
                                        transition: {duration: 0.2}
                                    }}
                                    whileTap={{scale: 0.95}}
                                    onClick={action.onClick}
                                    style={{
                                        flex: action.flex || 'auto',
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        border: action.variant === 'primary' ? 'none' : `1px solid ${theme.border}`,
                                        backgroundColor: action.variant === 'primary' ? theme.primary : theme.bg,
                                        color: action.variant === 'primary' ? '#fff' : theme.text,
                                        fontSize: '14px',
                                        fontWeight: action.variant === 'primary' ? '600' : '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                    }}
                                >
                                    {action.icon}
                                    {action.label}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </div>

                {showFilterButtons && filterOptions.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        className="filter-buttons"
                        style={{
                            display: 'flex',
                            gap: '8px',
                            marginTop: '12px',
                            flexWrap: 'wrap',
                        }}
                    >
                        {filterOptions.map((option) => (
                            <motion.button
                                key={option.value || option}
                                variants={buttonVariants}
                                whileHover={{
                                    y: -2,
                                    transition: {duration: 0.2}
                                }}
                                whileTap={{scale: 0.95}}
                                onClick={() => setFilter(option.value || option)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: `1px solid ${theme.border}`,
                                    backgroundColor: filter === (option.value || option) ? theme.primary : theme.bg,
                                    color: filter === (option.value || option) ? '#fff' : theme.text,
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize',
                                    transition: 'background-color 0.2s, color 0.2s',
                                }}
                            >
                                {option.label || option}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </motion.div>

            <style>{`
                @media (max-width: 768px) {
                    .filter-container {
                        display: none !important;
                    }
                }

                @media (max-width: 1024px) {
                    .filter-wrapper {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }

                @media (max-width: 480px) {
                    .filter-container {
                        padding: 12px !important;
                    }
                    .filter-buttons button {
                        flex: 1;
                        padding: 10px 12px !important;
                        font-size: 13px !important;
                    }
                }
            `}</style>
        </>
    );
}
