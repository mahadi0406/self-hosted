import {useState, useMemo} from 'react';
import {motion} from 'framer-motion';

const chartVariants = {
    hidden: {opacity: 0, y: 30},
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 80,
            damping: 15,
            delay: 0.3,
        },
    },
};

const pathVariants = {
    hidden: {pathLength: 0, opacity: 0},
    visible: {
        pathLength: 1,
        opacity: 1,
        transition: {
            pathLength: {duration: 1.2, ease: 'easeInOut', delay: 0.5},
            opacity: {duration: 0.3, delay: 0.5},
        },
    },
};

const fillVariants = {
    hidden: {opacity: 0},
    visible: {
        opacity: 1,
        transition: {duration: 0.8, delay: 1.2, ease: 'easeOut'},
    },
};

const dotVariants = {
    hidden: {scale: 0, opacity: 0},
    visible: (i) => ({
        scale: 1,
        opacity: 1,
        transition: {
            delay: 0.5 + i * 0.05,
            type: 'spring',
            stiffness: 200,
            damping: 15,
        },
    }),
};

export default function TransactionChart({title, subtitle, theme, data = []}) {
    const [activeTab, setActiveTab] = useState('7days');
    const [hoveredPoint, setHoveredPoint] = useState(null);

    const tabs = [
        {id: '30days', label: '30D'},
        {id: '7days', label: '7D'},
        {id: '24hours', label: '24H'},
    ];

    const filteredData = useMemo(() => {
        if (!data || data.length === 0) {
            const days = activeTab === '30days' ? 30 : activeTab === '7days' ? 7 : 24;
            return Array.from({length: days}, (_, i) => ({
                date: `Day ${i + 1}`,
                transactions: Math.floor(Math.random() * 50) + 10,
            }));
        }

        if (activeTab === '7days') {
            return data.slice(-7);
        } else if (activeTab === '24hours') {
            return data.slice(-1);
        }
        return data;
    }, [data, activeTab]);

    const {chartPath, linePath, points, maxValue, yAxisLabels} = useMemo(() => {
        const width = 900;
        const height = 200;
        const padding = {top: 20, bottom: 40, left: 0, right: 0};
        const chartHeight = height - padding.top - padding.bottom;
        const chartWidth = width - padding.left - padding.right;

        if (filteredData.length === 0) {
            return {
                chartPath: '',
                linePath: '',
                points: [],
                maxValue: 0,
                yAxisLabels: [],
            };
        }

        const values = filteredData.map(d => d.transactions || 0);
        const maxVal = Math.max(...values, 1);
        const minVal = Math.min(...values, 0);
        const range = maxVal - minVal || 1;

        const stepX = chartWidth / (filteredData.length - 1 || 1);

        const normalizedPoints = filteredData.map((d, i) => {
            const x = padding.left + i * stepX;
            const normalizedY = ((d.transactions - minVal) / range);
            const y = padding.top + chartHeight - (normalizedY * chartHeight);
            return {x, y, value: d.transactions, label: d.date};
        });

        let line = `M ${normalizedPoints[0].x},${normalizedPoints[0].y}`;
        let area = `M ${normalizedPoints[0].x},${normalizedPoints[0].y}`;

        for (let i = 0; i < normalizedPoints.length - 1; i++) {
            const current = normalizedPoints[i];
            const next = normalizedPoints[i + 1];
            const controlX = current.x + (next.x - current.x) / 2;

            line += ` C ${controlX},${current.y} ${controlX},${next.y} ${next.x},${next.y}`;
            area += ` C ${controlX},${current.y} ${controlX},${next.y} ${next.x},${next.y}`;
        }

        area += ` L ${normalizedPoints[normalizedPoints.length - 1].x},${height - padding.bottom}`;
        area += ` L ${normalizedPoints[0].x},${height - padding.bottom} Z`;

        const labelCount = 4;
        const labels = Array.from({length: labelCount}, (_, i) => {
            const value = minVal + (range * (labelCount - 1 - i)) / (labelCount - 1);
            const y = padding.top + (chartHeight * i) / (labelCount - 1);
            return {value: Math.round(value), y};
        });

        return {
            chartPath: area,
            linePath: line,
            points: normalizedPoints,
            maxValue: maxVal,
            yAxisLabels: labels,
        };
    }, [filteredData]);

    const formatValue = (val) => {
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
        return val.toString();
    };

    return (
        <>
            <motion.div
                className="transaction-chart"
                variants={chartVariants}
                initial="hidden"
                animate="visible"
                style={{
                    backgroundColor: theme.bgCard,
                    borderRadius: '12px',
                    padding: '24px',
                    border: `1px solid ${theme.border}`,
                    position: 'relative',
                }}
            >
                <div
                    className="chart-header"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px',
                        gap: '12px',
                    }}
                >
                    <motion.div
                        initial={{opacity: 0, x: -10}}
                        animate={{opacity: 1, x: 0}}
                        transition={{delay: 0.4, duration: 0.4}}
                        style={{minWidth: 0, flex: 1}}
                    >
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: theme.text,
                            marginBottom: '4px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {title || 'Transaction Activity'}
                        </h3>
                        <p style={{
                            fontSize: '13px',
                            color: theme.textMuted,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {subtitle || 'Your transaction history over the last 30 days'}
                        </p>
                    </motion.div>

                    <motion.div
                        className="chart-tabs"
                        initial={{opacity: 0, x: 10}}
                        animate={{opacity: 1, x: 0}}
                        transition={{delay: 0.5, duration: 0.4}}
                        style={{
                            display: 'flex',
                            gap: '6px',
                            backgroundColor: theme.bgSecondary,
                            padding: '4px',
                            borderRadius: '10px',
                            border: `1px solid ${theme.border}`,
                            flexShrink: 0,
                        }}
                    >
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: activeTab === tab.id ? theme.bgCard : 'transparent',
                                    color: activeTab === tab.id ? theme.primary : theme.textMuted,
                                    fontSize: '13px',
                                    fontWeight: activeTab === tab.id ? '600' : '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: activeTab === tab.id
                                        ? `0 2px 8px ${theme.border}`
                                        : 'none',
                                }}
                                onMouseEnter={(e) => {
                                    if (activeTab !== tab.id) {
                                        e.target.style.color = theme.text;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeTab !== tab.id) {
                                        e.target.style.color = theme.textMuted;
                                    }
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </motion.div>
                </div>

                <div
                    className="chart-container"
                    style={{
                        height: '240px',
                        position: 'relative',
                    }}
                >
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 900 200"
                        preserveAspectRatio="none"
                        style={{display: 'block'}}
                    >
                        <defs>
                            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor={theme.primary} stopOpacity="0.2"/>
                                <stop offset="50%" stopColor={theme.primary} stopOpacity="0.1"/>
                                <stop offset="100%" stopColor={theme.primary} stopOpacity="0"/>
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>

                        {yAxisLabels.map((label, i) => (
                            <motion.line
                                key={i}
                                x1="0"
                                y1={label.y}
                                x2="900"
                                y2={label.y}
                                stroke={theme.border}
                                strokeWidth="1"
                                strokeDasharray="4 4"
                                initial={{opacity: 0}}
                                animate={{opacity: 0.3}}
                                transition={{delay: 0.3 + i * 0.1}}
                            />
                        ))}

                        <motion.path
                            d={chartPath}
                            fill="url(#chartGradient)"
                            variants={fillVariants}
                            initial="hidden"
                            animate="visible"
                        />

                        <motion.path
                            d={linePath}
                            fill="none"
                            stroke={theme.primary}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            variants={pathVariants}
                            initial="hidden"
                            animate="visible"
                            filter="url(#glow)"
                        />

                        {points.map((point, i) => (
                            <motion.circle
                                key={i}
                                cx={point.x}
                                cy={point.y}
                                r={hoveredPoint === i ? 6 : 4}
                                fill={theme.bgCard}
                                stroke={theme.primary}
                                strokeWidth="2.5"
                                custom={i}
                                variants={dotVariants}
                                initial="hidden"
                                animate="visible"
                                style={{cursor: 'pointer'}}
                                onMouseEnter={() => setHoveredPoint(i)}
                                onMouseLeave={() => setHoveredPoint(null)}
                            />
                        ))}
                    </svg>

                    {hoveredPoint !== null && points[hoveredPoint] && (
                        <motion.div
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            style={{
                                position: 'absolute',
                                left: `${(points[hoveredPoint].x / 900) * 100}%`,
                                top: `${(points[hoveredPoint].y / 200) * 100}%`,
                                transform: 'translate(-50%, -120%)',
                                backgroundColor: theme.bgCard,
                                border: `1px solid ${theme.border}`,
                                borderRadius: '8px',
                                padding: '8px 12px',
                                boxShadow: `0 4px 12px ${theme.border}`,
                                pointerEvents: 'none',
                                zIndex: 10,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <div style={{fontSize: '11px', color: theme.textMuted, marginBottom: '2px'}}>
                                {points[hoveredPoint].label}
                            </div>
                            <div style={{fontSize: '14px', fontWeight: '600', color: theme.text}}>
                                {points[hoveredPoint].value} transactions
                            </div>
                        </motion.div>
                    )}
                </div>

                <div style={{
                    position: 'absolute',
                    right: '24px',
                    top: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '140px',
                }}>
                    {yAxisLabels.map((label, i) => (
                        <motion.div
                            key={i}
                            initial={{opacity: 0, x: 10}}
                            animate={{opacity: 1, x: 0}}
                            transition={{delay: 0.6 + i * 0.1}}
                            style={{
                                fontSize: '11px',
                                color: theme.textMuted,
                                fontWeight: '500',
                            }}
                        >
                            {formatValue(label.value)}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <style>{`
                @media (max-width: 640px) {
                    .transaction-chart {
                        padding: 16px !important;
                    }
                    .chart-header {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                    }
                    .chart-tabs {
                        width: 100%;
                        justify-content: space-between;
                    }
                    .chart-tabs button {
                        flex: 1;
                        padding: 6px 12px !important;
                        font-size: 12px !important;
                    }
                    .chart-container {
                        height: 180px !important;
                    }
                }
            `}</style>
        </>
    );
}
