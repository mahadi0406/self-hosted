import {useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {useForm} from '@inertiajs/react';
import {useTranslation} from '@/hooks/useTranslation';
import {Star, ThumbsUp, ThumbsDown, X} from 'lucide-react';

export default function ReviewModal({show, onClose, trade, theme}) {
    const {t} = useTranslation();
    const [hoveredRating, setHoveredRating] = useState(0);

    const {data, setData, post, processing, errors, reset} = useForm({
        type: 'positive',
        rating: 5,
        comment: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/user/trades/${trade.id}/review`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleClose = () => {
        if (!processing) {
            reset();
            onClose();
        }
    };

    if (!show) return null;

    return (
        <AnimatePresence>
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: window.innerWidth < 768 ? '16px' : '20px',
                }}
                onClick={handleClose}
            >
                <motion.div
                    initial={{opacity: 0, scale: 0.9}}
                    animate={{opacity: 1, scale: 1}}
                    exit={{opacity: 0, scale: 0.9}}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: theme.bgCard,
                        borderRadius: '16px',
                        padding: window.innerWidth < 768 ? '20px' : '24px',
                        maxWidth: '500px',
                        width: '100%',
                        border: `1px solid ${theme.border}`,
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                    }}>
                        <h2 style={{
                            fontSize: window.innerWidth < 768 ? '18px' : '20px',
                            fontWeight: '700',
                            color: theme.text,
                        }}>
                            {t('review_modal_title')}
                        </h2>
                        <button
                            onClick={handleClose}
                            disabled={processing}
                            style={{
                                padding: '8px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: theme.textMuted,
                                cursor: processing ? 'not-allowed' : 'pointer',
                            }}
                        >
                            <X style={{width: '20px', height: '20px'}}/>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: window.innerWidth < 768 ? '12px' : '13px',
                                fontWeight: '500',
                                color: theme.text,
                                marginBottom: '12px',
                            }}>
                                {t('review_modal_type')} <span style={{color: '#EF4444'}}>*</span>
                            </label>
                            <div style={{display: 'flex', gap: '12px'}}>
                                <button
                                    type="button"
                                    onClick={() => setData('type', 'positive')}
                                    style={{
                                        flex: 1,
                                        padding: window.innerWidth < 768 ? '12px' : '14px',
                                        borderRadius: '8px',
                                        border: data.type === 'positive'
                                            ? '2px solid #10B981'
                                            : `1px solid ${theme.border}`,
                                        backgroundColor: data.type === 'positive'
                                            ? '#10B98115'
                                            : theme.bg,
                                        color: data.type === 'positive' ? '#10B981' : theme.text,
                                        fontSize: window.innerWidth < 768 ? '13px' : '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <ThumbsUp style={{width: '18px', height: '18px'}}/>
                                    {t('review_positive')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('type', 'negative')}
                                    style={{
                                        flex: 1,
                                        padding: window.innerWidth < 768 ? '12px' : '14px',
                                        borderRadius: '8px',
                                        border: data.type === 'negative'
                                            ? '2px solid #EF4444'
                                            : `1px solid ${theme.border}`,
                                        backgroundColor: data.type === 'negative'
                                            ? '#EF444415'
                                            : theme.bg,
                                        color: data.type === 'negative' ? '#EF4444' : theme.text,
                                        fontSize: window.innerWidth < 768 ? '13px' : '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <ThumbsDown style={{width: '18px', height: '18px'}}/>
                                    {t('review_negative')}
                                </button>
                            </div>
                            {errors.type && (
                                <p style={{fontSize: '12px', color: '#EF4444', marginTop: '4px'}}>
                                    {errors.type}
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: window.innerWidth < 768 ? '12px' : '13px',
                                fontWeight: '500',
                                color: theme.text,
                                marginBottom: '12px',
                            }}>
                                {t('review_modal_rating')} <span style={{color: '#EF4444'}}>*</span>
                            </label>
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                justifyContent: 'center',
                                padding: '12px',
                            }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setData('rating', star)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '4px',
                                        }}
                                    >
                                        <Star
                                            style={{
                                                width: window.innerWidth < 768 ? '28px' : '32px',
                                                height: window.innerWidth < 768 ? '28px' : '32px',
                                                fill: star <= (hoveredRating || data.rating)
                                                    ? '#F59E0B'
                                                    : 'none',
                                                stroke: star <= (hoveredRating || data.rating)
                                                    ? '#F59E0B'
                                                    : theme.border,
                                                transition: 'all 0.2s',
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                            {errors.rating && (
                                <p style={{fontSize: '12px', color: '#EF4444', marginTop: '4px'}}>
                                    {errors.rating}
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: window.innerWidth < 768 ? '12px' : '13px',
                                fontWeight: '500',
                                color: theme.text,
                                marginBottom: '8px',
                            }}>
                                {t('review_modal_comment')}
                            </label>
                            <textarea
                                placeholder={t('review_modal_comment_placeholder')}
                                value={data.comment}
                                onChange={(e) => setData('comment', e.target.value)}
                                rows={4}
                                maxLength={500}
                                style={{
                                    width: '100%',
                                    padding: window.innerWidth < 768 ? '10px' : '12px',
                                    borderRadius: '8px',
                                    border: `1px solid ${errors.comment ? '#EF4444' : theme.border}`,
                                    backgroundColor: theme.bg,
                                    color: theme.text,
                                    fontSize: window.innerWidth < 768 ? '13px' : '14px',
                                    resize: 'vertical',
                                }}
                            />
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '4px',
                            }}>
                                {errors.comment && (
                                    <p style={{fontSize: '12px', color: '#EF4444'}}>
                                        {errors.comment}
                                    </p>
                                )}
                                <p style={{
                                    fontSize: '12px',
                                    color: theme.textMuted,
                                    marginLeft: 'auto',
                                }}>
                                    {data.comment.length}/500
                                </p>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            paddingTop: '12px',
                        }}>
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={processing}
                                style={{
                                    flex: 1,
                                    padding: window.innerWidth < 768 ? '10px' : '12px',
                                    borderRadius: '8px',
                                    border: `1px solid ${theme.border}`,
                                    backgroundColor: theme.bg,
                                    color: theme.text,
                                    fontSize: window.innerWidth < 768 ? '13px' : '14px',
                                    fontWeight: '600',
                                    cursor: processing ? 'not-allowed' : 'pointer',
                                    opacity: processing ? 0.6 : 1,
                                }}
                            >
                                {t('review_modal_cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                style={{
                                    flex: 1,
                                    padding: window.innerWidth < 768 ? '10px' : '12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: theme.primary,
                                    color: '#fff',
                                    fontSize: window.innerWidth < 768 ? '13px' : '14px',
                                    fontWeight: '600',
                                    cursor: processing ? 'not-allowed' : 'pointer',
                                    opacity: processing ? 0.6 : 1,
                                }}
                            >
                                {processing ? t('review_modal_submitting') : t('review_modal_submit')}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
