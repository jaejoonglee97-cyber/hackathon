'use client';

import { useState, useEffect } from 'react';
import type { CommentPublic } from '@/types/archive';
import styles from './CommentSection.module.css';

interface CommentSectionProps {
    appId: string;
    initialUser?: { userId: string; email: string; role: string; name?: string } | null;
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}.${m}.${day} ${h}:${min}`;
}

export default function CommentSection({ appId, initialUser }: CommentSectionProps) {
    const [comments, setComments] = useState<CommentPublic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Form state
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Reply state
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyName, setReplyName] = useState('');
    const [replyPassword, setReplyPassword] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const [replyError, setReplyError] = useState('');

    // Delete state
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [appId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/comments?appId=${appId}`);
            if (!res.ok) throw new Error('댓글을 불러오는데 실패했습니다');
            const data = await res.json();
            setComments(data.comments || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (name.length < 2) return setFormError('이름은 2자 이상 입력해주세요.');
        if (password.length < 4) return setFormError('비밀번호는 4자 이상 입력해주세요.');
        if (content.length < 5) return setFormError('내용은 5자 이상 입력해주세요.');

        setSubmitting(true);
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appId, authorName: name, password, content }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || '댓글 작성에 실패했습니다');
            }

            setName('');
            setPassword('');
            setContent('');
            setFormSuccess('댓글이 등록되었습니다.');
            await fetchComments();
            
            setTimeout(() => setFormSuccess(''), 3000);
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
        e.preventDefault();
        setReplyError('');

        if (initialUser) {
            if (replyContent.length < 5) return setReplyError('내용은 5자 이상 입력해주세요.');
        } else {
            if (replyName.length < 2) return setReplyError('이름은 2자 이상 입력해주세요.');
            if (replyPassword.length < 4) return setReplyError('비밀번호는 4자 이상 입력해주세요.');
            if (replyContent.length < 5) return setReplyError('내용은 5자 이상 입력해주세요.');
        }

        setSubmitting(true);
        try {
            let res;
            if (initialUser) {
                res = await fetch('/api/comments/reply', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ appId, parentId, content: replyContent }),
                });
            } else {
                res = await fetch('/api/comments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ appId, parentId, authorName: replyName, password: replyPassword, content: replyContent }),
                });
            }

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || '답글 작성에 실패했습니다');
            }

            setReplyingTo(null);
            setReplyName('');
            setReplyPassword('');
            setReplyContent('');
            await fetchComments();
        } catch (err: any) {
            setReplyError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        setDeleteError('');
        setIsDeleting(true);

        try {
            const res = await fetch(`/api/comments/${deletingId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: deletePassword }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || '댓글 삭제에 실패했습니다');
            }

            setDeletingId(null);
            setDeletePassword('');
            await fetchComments();
        } catch (err: any) {
            setDeleteError(err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const rootComments = comments.filter(c => !c.parentId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const canDelete = (comment: CommentPublic) => {
        if (initialUser?.role === 'admin') return true;
        if (comment.authorRole === 'visitor') return true;
        return false;
    };

    if (loading) {
        return <div className={styles.section}><p style={{ textAlign: 'center' }}>댓글을 불러오는 중...</p></div>;
    }

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>댓글 ({comments.filter(c => !c.isDeleted).length})</h2>
            
            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.list}>
                {rootComments.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>💬</span>
                        <p>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
                    </div>
                ) : (
                    rootComments.map(comment => (
                        <div key={comment.id} className={styles.commentWrapper}>
                            {/* Root Comment */}
                            <div className={styles.comment}>
                                <div className={styles.commentHeader}>
                                    <div className={styles.authorInfo}>
                                        <span className={styles.authorName}>{comment.authorName}</span>
                                        {comment.authorRole === 'manager' && <span className={`${styles.badge} ${styles.badgeManager}`}>담당자</span>}
                                        {comment.authorRole === 'admin' && <span className={`${styles.badge} ${styles.badgeAdmin}`}>운영자</span>}
                                    </div>
                                    <span className={styles.date}>{formatDate(comment.createdAt)}</span>
                                </div>
                                {comment.isDeleted ? (
                                    <p className={styles.deletedContent}>삭제된 댓글입니다.</p>
                                ) : (
                                    <p className={styles.content}>{comment.content}</p>
                                )}
                                <div className={styles.actions}>
                                    <button className={styles.actionButton} onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}>
                                        {replyingTo === comment.id ? '취소' : '답글'}
                                    </button>
                                    {!comment.isDeleted && canDelete(comment) && (
                                        <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => setDeletingId(comment.id)}>
                                            삭제
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Inline Reply Form for Root Comment */}
                            {replyingTo === comment.id && (
                                <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className={styles.inlineForm}>
                                    {!initialUser && (
                                        <div className={styles.formRow}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label}>이름</label>
                                                <input type="text" className={styles.input} value={replyName} onChange={e => setReplyName(e.target.value)} required minLength={2} />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label}>비밀번호</label>
                                                <input type="password" className={styles.input} value={replyPassword} onChange={e => setReplyPassword(e.target.value)} required minLength={4} />
                                            </div>
                                        </div>
                                    )}
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>내용</label>
                                        <textarea className={styles.textarea} value={replyContent} onChange={e => setReplyContent(e.target.value)} required minLength={5} style={{ minHeight: '60px' }} />
                                    </div>
                                    {replyError && <p className={styles.error}>{replyError}</p>}
                                    <button type="submit" className={styles.submitButton} disabled={submitting}>답글 등록</button>
                                </form>
                            )}

                            {/* Replies */}
                            {getReplies(comment.id).map(reply => (
                                <div key={reply.id} className={styles.replyWrapper}>
                                    <div className={styles.comment}>
                                        <div className={styles.commentHeader}>
                                            <div className={styles.authorInfo}>
                                                <span className={styles.authorName}>{reply.authorName}</span>
                                                {reply.authorRole === 'manager' && <span className={`${styles.badge} ${styles.badgeManager}`}>담당자</span>}
                                                {reply.authorRole === 'admin' && <span className={`${styles.badge} ${styles.badgeAdmin}`}>운영자</span>}
                                            </div>
                                            <span className={styles.date}>{formatDate(reply.createdAt)}</span>
                                        </div>
                                        {reply.isDeleted ? (
                                            <p className={styles.deletedContent}>삭제된 댓글입니다.</p>
                                        ) : (
                                            <p className={styles.content}>{reply.content}</p>
                                        )}
                                        <div className={styles.actions}>
                                            {!reply.isDeleted && canDelete(reply) && (
                                                <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => setDeletingId(reply.id)}>
                                                    삭제
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>

            {/* Main Comment Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
                <h3 className={styles.formTitle}>댓글 남기기</h3>
                <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="name">이름</label>
                        <input id="name" type="text" className={styles.input} value={name} onChange={e => setName(e.target.value)} required minLength={2} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="password">비밀번호 <span className={styles.hint}>(나중에 삭제할 때 사용합니다)</span></label>
                        <input id="password" type="password" className={styles.input} value={password} onChange={e => setPassword(e.target.value)} required minLength={4} />
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="content">내용</label>
                    <textarea id="content" className={styles.textarea} value={content} onChange={e => setContent(e.target.value)} required minLength={5} placeholder="앱에 대한 의견이나 응원의 메시지를 남겨주세요." />
                </div>
                {formError && <p className={styles.error}>{formError}</p>}
                {formSuccess && <p className={styles.success}>{formSuccess}</p>}
                <button type="submit" className={styles.submitButton} disabled={submitting}>등록하기</button>
            </form>

            {/* Delete Modal */}
            {deletingId && (
                <div className={styles.modalOverlay} onClick={() => setDeletingId(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>댓글 삭제</h3>
                        <p style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text-secondary)' }}>
                            {initialUser?.role === 'admin' ? '관리자 권한으로 삭제하시겠습니까?' : '작성 시 입력한 비밀번호를 입력해주세요.'}
                        </p>
                        
                        {!(initialUser?.role === 'admin') && (
                            <input 
                                type="password" 
                                className={styles.input} 
                                value={deletePassword} 
                                onChange={e => setDeletePassword(e.target.value)}
                                placeholder="비밀번호"
                                autoFocus
                            />
                        )}
                        
                        {deleteError && <p className={styles.error}>{deleteError}</p>}
                        
                        <div className={styles.modalActions}>
                            <button className={styles.cancelButton} onClick={() => {
                                setDeletingId(null);
                                setDeletePassword('');
                                setDeleteError('');
                            }}>취소</button>
                            <button className={styles.confirmDeleteButton} onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? '삭제 중...' : '삭제'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
