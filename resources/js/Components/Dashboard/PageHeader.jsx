import {motion} from 'framer-motion';

export default function PageHeader({
                                       title,
                                       description,
                                       actions,
                                       theme
                                   }) {
    return (
        <motion.div
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
            style={{marginBottom: '24px'}}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
            }}>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: theme.text,
                }}>
                    {title}
                </h1>
                {actions && (
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                    }}>
                        {actions}
                    </div>
                )}
            </div>
            {description && (
                <p style={{
                    fontSize: '14px',
                    color: theme.textMuted,
                }}>
                    {description}
                </p>
            )}
        </motion.div>
    );
}
