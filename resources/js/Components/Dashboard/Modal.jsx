import {motion, AnimatePresence} from 'framer-motion';
import {X} from 'lucide-react';

const modalVariants = {
    hidden: {opacity: 0},
    visible: {opacity: 1},
    exit: {opacity: 0}
};

const modalContentVariants = {
    hidden: {opacity: 0, scale: 0.95, y: 20},
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30
        }
    },
    exit: {opacity: 0, scale: 0.95, y: 20}
};

export default function Modal({
                                  isOpen,
                                  onClose,
                                  title,
                                  description,
                                  children,
                                  footer,
                                  maxWidth = '550px',
                                  theme,
                                  showCloseButton = true,
                              }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100,
                        padding: '20px',
                    }}
                    onClick={onClose}
                >
                    <motion.div
                        variants={modalContentVariants}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: theme.bgCard,
                            borderRadius: '16px',
                            maxWidth: maxWidth,
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {(title || description || showCloseButton) && (
                            <div style={{
                                padding: '24px',
                                borderBottom: `1px solid ${theme.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                                <div>
                                    {title && (
                                        <h2 style={{
                                            fontSize: '20px',
                                            fontWeight: '700',
                                            color: theme.text,
                                        }}>
                                            {title}
                                        </h2>
                                    )}
                                    {description && (
                                        <p style={{
                                            fontSize: '13px',
                                            color: theme.textMuted,
                                            marginTop: '4px',
                                        }}>
                                            {description}
                                        </p>
                                    )}
                                </div>
                                {showCloseButton && (
                                    <button
                                        onClick={onClose}
                                        style={{
                                            padding: '8px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            backgroundColor: theme.bg,
                                            color: theme.textMuted,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <X style={{width: '20px', height: '20px'}}/>
                                    </button>
                                )}
                            </div>
                        )}

                        <div style={{
                            flex: 1,
                            overflow: 'auto',
                            padding: '24px',
                        }}>
                            {children}
                        </div>

                        {footer && (
                            <div style={{
                                padding: '24px',
                                borderTop: `1px solid ${theme.border}`,
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end',
                            }}>
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
