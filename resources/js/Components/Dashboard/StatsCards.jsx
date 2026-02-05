import {motion} from 'framer-motion';

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

const cardVariants = {
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

export default function StatsCards({stats, theme}) {
    return (
        <>
            <motion.div
                className="stats-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '12px',
                    marginBottom: '24px',
                }}
            >
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.id || index}
                        className="stat-card"
                        variants={cardVariants}
                        whileHover={{
                            y: -2,
                            transition: {duration: 0.2}
                        }}
                        style={{
                            backgroundColor: theme.bgCard,
                            borderRadius: '10px',
                            padding: '20px',
                            border: `1px solid ${theme.border}`,
                            cursor: 'default',
                        }}
                    >
                        <p style={{
                            fontSize: '13px',
                            color: theme.textMuted,
                            marginBottom: '10px',
                            fontWeight: '500',
                            letterSpacing: '0.01em',
                        }}>
                            {stat.label}
                        </p>
                        <motion.p
                            initial={{opacity: 0, scale: 0.5}}
                            animate={{opacity: 1, scale: 1}}
                            transition={{
                                delay: 0.2 + index * 0.08,
                                type: 'spring',
                                stiffness: 200,
                            }}
                            style={{
                                fontSize: '28px',
                                fontWeight: '600',
                                color: theme.text,
                                letterSpacing: '-0.02em',
                                lineHeight: 1,
                            }}
                        >
                            {stat.value}
                        </motion.p>
                    </motion.div>
                ))}
            </motion.div>

            <style>{`
                @media (max-width: 768px) {
                    .stats-grid {
                        display: none !important;
                    }
                }

                @media (max-width: 1024px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }

                @media (max-width: 480px) {
                    .stats-grid {
                        grid-template-columns: 1fr !important;
                        gap: 10px !important;
                    }
                    .stat-card {
                        padding: 16px !important;
                    }
                    .stat-card p:last-child {
                        font-size: 24px !important;
                    }
                }
            `}</style>
        </>
    );
}
