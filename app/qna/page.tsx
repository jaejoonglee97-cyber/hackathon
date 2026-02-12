'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './qna.module.css';

type Inquiry = {
    id: string;
    user_id: string;
    title: string;
    content: string;
    is_secret: string; // 'TRUE' | 'FALSE'
    status: string; // 'open' | 'answered'
    answer: string;
    answered_by: string;
    created_at: string;
    updated_at: string;
};

export default function QnAPage() {
    const router = useRouter();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isWriting, setIsWriting] = useState(false);

    // Form states
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSecret, setIsSecret] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const res = await fetch('/api/inquiries', { cache: 'no-store' });
            const data = await res.json();
            if (data.inquiries) {
                const sorted = data.inquiries.sort((a: Inquiry, b: Inquiry) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setInquiries(sorted);
            }
            if (data.currentUser) {
                setCurrentUser(data.currentUser);
            }
        } catch (error) {
            console.error('Failed to fetch inquiries', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, isSecret }),
            });

            if (res.ok) {
                alert('문의가 등록되었습니다.');
                setTitle('');
                setContent('');
                setIsSecret(false);
                setIsWriting(false);
                fetchInquiries();
            } else {
                alert('등록에 실패했습니다.');
            }
        } catch (error) {
            console.error(error);
            alert('오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleExpand = (id: string, isSecretItem: boolean, authorId: string) => {
        const isMyPost = currentUser && currentUser.userId === authorId;
        const isAdmin = currentUser && ['admin', 'judge'].includes(currentUser.role);

        if (isSecretItem && !isMyPost && !isAdmin) {
            alert('비공개 글입니다.');
            return;
        }

        setExpandedId(expandedId === id ? null : id);
    };

    const [answerInput, setAnswerInput] = useState('');
    const [answering, setAnswering] = useState(false);

    const handleAnswerSubmit = async (inquiryId: string) => {
        if (!answerInput.trim()) return;
        setAnswering(true);
        try {
            const res = await fetch('/api/inquiries', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: inquiryId, answer: answerInput }),
            });

            if (res.ok) {
                alert('답변이 등록되었습니다.');
                setAnswerInput('');
                fetchInquiries();
            } else {
                alert('답변 등록 실패');
            }
        } catch (error) {
            console.error(error);
            alert('오류 발생');
        } finally {
            setAnswering(false);
        }
    };

    if (loading) return (
        <div className={styles.page}>
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                로딩 중...
            </div>
        </div>
    );

    const isAdmin = currentUser && ['admin', 'judge'].includes(currentUser.role);

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className="container">
                    <h1 className={styles.title}>💬 문의 게시판</h1>
                    <p className={styles.subtitle}>
                        궁금한 점이 있으신가요? 자유롭게 문의해주세요.<br />
                        비공개 문의는 자물쇠 아이콘을 체크해주세요.
                    </p>
                </div>
            </header>

            <main className={styles.main}>
                <div className="container">
                    <div className={styles.boardContainer} style={{ marginTop: 0 }}>
                        <div className={styles.boardHeader}>
                            <h2 className={styles.sectionTitle} style={{ border: 'none', padding: 0, margin: 0 }}>
                                문의 목록 <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 'normal' }}>({inquiries.length})</span>
                            </h2>
                            <button
                                className={styles.writeButton}
                                onClick={() => {
                                    if (!currentUser) {
                                        alert('로그인이 필요합니다.');
                                        router.push('/auth/signin');
                                        return;
                                    }
                                    setIsWriting(!isWriting);
                                }}
                            >
                                {isWriting ? '목록으로' : '✏️ 문의하기'}
                            </button>
                        </div>

                        {isWriting && (
                            <form onSubmit={handleSubmit} className={styles.writeForm}>
                                <div className={styles.formGroup}>
                                    <label>제목</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="궁금한 점을 입력해주세요"
                                        required
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>내용</label>
                                    <textarea
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        placeholder="상세 내용을 입력해주세요"
                                        required
                                        className={styles.textarea}
                                        rows={5}
                                    />
                                </div>
                                <div className={styles.formFooter}>
                                    <label className={styles.secretCheck}>
                                        <input
                                            type="checkbox"
                                            checked={isSecret}
                                            onChange={e => setIsSecret(e.target.checked)}
                                        />
                                        🔒 비공개 (관리자와 작성자만 볼 수 있습니다)
                                    </label>
                                    <button type="submit" disabled={submitting} className={styles.submitButton}>
                                        {submitting ? '등록 중...' : '등록하기'}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className={styles.list}>
                            {inquiries.length === 0 ? (
                                <div className={styles.emptyList}>
                                    등록된 문의가 없습니다.<br />
                                    첫 번째 문의를 남겨보세요!
                                </div>
                            ) : (
                                inquiries.map((item) => {
                                    const isSecretItem = item.is_secret === 'TRUE';
                                    const isAnswered = item.status === 'answered';
                                    const isMyPost = currentUser && currentUser.userId === item.user_id;
                                    const canView = !isSecretItem || isMyPost || isAdmin;

                                    const formatDate = (dateStr: string) => {
                                        if (!dateStr) return '';
                                        const d = new Date(dateStr);
                                        return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
                                    };

                                    return (
                                        <div key={item.id} className={styles.item}>
                                            <div
                                                className={styles.itemHeader}
                                                onClick={() => {
                                                    if (canView) {
                                                        setExpandedId(expandedId === item.id ? null : item.id);
                                                        if (expandedId !== item.id) setAnswerInput('');
                                                    } else {
                                                        alert('비공개 글입니다.');
                                                    }
                                                }}
                                            >
                                                <div className={styles.itemMeta}>
                                                    <span className={`${styles.statusBadge} ${isAnswered ? styles.statusDone : styles.statusOpen}`}>
                                                        {isAnswered ? '답변완료' : '접수중'}
                                                    </span>
                                                    {isSecretItem && <span className={styles.secretIcon}>🔒</span>}
                                                    <span className={styles.itemTitle}>
                                                        {isSecretItem && !isMyPost && !isAdmin
                                                            ? '비공개 글입니다.'
                                                            : (item.title || '(제목 없음)')}
                                                    </span>
                                                </div>
                                                <span className={styles.itemDate}>
                                                    {formatDate(item.created_at)}
                                                </span>
                                            </div>

                                            {expandedId === item.id && (
                                                <div className={styles.itemBody}>
                                                    <div className={styles.questionBox}>
                                                        <div className={styles.questionContent}>{item.content}</div>
                                                    </div>

                                                    {item.answer && (
                                                        <div className={styles.answerBox}>
                                                            <div className={styles.answerHeader}>↳ 관리자 답변 ({item.answered_by})</div>
                                                            <div className={styles.answerContent}>{item.answer}</div>
                                                        </div>
                                                    )}

                                                    {isAdmin && (
                                                        <div className={styles.adminActionBox} style={{ marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
                                                            <h4>관리자 답변 작성</h4>
                                                            <textarea
                                                                value={answerInput}
                                                                onChange={e => setAnswerInput(e.target.value)}
                                                                placeholder="답변을 입력하세요..."
                                                                style={{ width: '100%', height: '80px', marginTop: '5px' }}
                                                            />
                                                            <button
                                                                onClick={() => handleAnswerSubmit(item.id)}
                                                                disabled={answering}
                                                                style={{ marginTop: '5px', padding: '5px 10px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}
                                                            >
                                                                {answering ? '등록 중...' : '답변 등록'}
                                                            </button>
                                                        </div>
                                                    )}

                                                    {!item.answer && isMyPost && !isAdmin && (
                                                        <p className={styles.waitingMsg}>아직 답변이 등록되지 않았습니다. 잠시만 기다려주세요.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
