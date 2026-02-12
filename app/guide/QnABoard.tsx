'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './guide.module.css';

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

export default function QnABoard() {
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
            const res = await fetch('/api/inquiries');
            const data = await res.json();
            if (data.inquiries) {
                // 최신순 정렬
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
                fetchInquiries(); // 목록 갱신
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
        // 비밀글이고 작성자가 아니면 열람 불가 (관리자 제외 - 여기선 관리자 체크는 일단 생략하거나 추후 추가)
        // 일단 간단히: 비밀글인데 내가 쓴게 아니면 alert
        const isMyPost = currentUser && currentUser.userId === authorId;
        const isAdmin = currentUser && ['admin', 'judge'].includes(currentUser.role);

        if (isSecretItem && !isMyPost && !isAdmin) {
            alert('비공개 글입니다.');
            return;
        }

        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) return <div className={styles.loading}>로딩 중...</div>;

    return (
        <div className={styles.boardContainer}>
            <div className={styles.boardHeader}>
                <h2 className={styles.sectionTitle}>💬 문의 게시판</h2>
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
                    {isWriting ? '목록으로' : '글쓰기'}
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
                            비공개 (관리자와 작성자만 볼 수 있습니다)
                        </label>
                        <button type="submit" disabled={submitting} className={styles.submitButton}>
                            {submitting ? '등록 중...' : '등록하기'}
                        </button>
                    </div>
                </form>
            )}

            <div className={styles.list}>
                {inquiries.length === 0 ? (
                    <div className={styles.emptyList}>등록된 문의가 없습니다.</div>
                ) : (
                    inquiries.map((item) => {
                        const isSecretItem = item.is_secret === 'TRUE';
                        const isAnswered = item.status === 'answered';
                        const isMyPost = currentUser && currentUser.userId === item.user_id;

                        return (
                            <div key={item.id} className={styles.item}>
                                <div
                                    className={styles.itemHeader}
                                    onClick={() => toggleExpand(item.id, isSecretItem, item.user_id)}
                                >
                                    <div className={styles.itemMeta}>
                                        <span className={`${styles.statusBadge} ${isAnswered ? styles.statusDone : styles.statusOpen}`}>
                                            {isAnswered ? '답변완료' : '접수중'}
                                        </span>
                                        {isSecretItem && <span className={styles.secretIcon}>🔒</span>}
                                        <span className={styles.itemTitle}>
                                            {isSecretItem && !isMyPost ? '비공개 글입니다.' : item.title}
                                        </span>
                                    </div>
                                    <span className={styles.itemDate}>
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                {expandedId === item.id && (
                                    <div className={styles.itemBody}>
                                        <div className={styles.questionBox}>
                                            <div className={styles.questionContent}>{item.content}</div>
                                        </div>
                                        {item.answer && (
                                            <div className={styles.answerBox}>
                                                <div className={styles.answerHeader}>↳ 관리자 답변</div>
                                                <div className={styles.answerContent}>{item.answer}</div>
                                            </div>
                                        )}
                                        {!item.answer && isMyPost && (
                                            <p className={styles.waitingMsg}>아직 답변이 등록되지 않았습니다.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
