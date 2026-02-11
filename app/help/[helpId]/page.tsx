// Help 카드 상세 페이지
import { notFound } from 'next/navigation';
import { getRowBy } from '@/lib/sheets';
import styles from './help.module.css';

async function getHelpData(helpId: string) {
    try {
        return await getRowBy('help_cards', 'id', helpId);
    } catch (error) {
        console.error('Error fetching help data:', error);
        return null;
    }
}

export default async function HelpDetailPage({
    params,
}: {
    params: { helpId: string };
}) {
    const help = await getHelpData(params.helpId);

    if (!help) {
        notFound();
    }

    const statusLabels = {
        open: '요청중',
        'in-progress': '진행중',
        resolved: '해결됨',
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className="container">
                    <a href="/" className={styles.backLink}>
                        ← 대시보드로 돌아가기
                    </a>
                </div>
            </header>

            <main className={styles.main}>
                <div className="container">
                    <div className={styles.card}>
                        <div className={styles.headerSection}>
                            <h1 className={styles.title}>{help.title}</h1>
                            <span className={`${styles.statusBadge} ${styles[help.status]}`}>
                                {statusLabels[help.status as keyof typeof statusLabels] || help.status}
                            </span>
                        </div>

                        <div className={styles.content}>
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>상세 내용</h2>
                                <p className={styles.text}>{help.detail}</p>
                            </section>

                            {help.link && (
                                <section className={styles.section}>
                                    <h2 className={styles.sectionTitle}>관련 링크</h2>
                                    <a
                                        href={help.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.link}
                                    >
                                        {help.link}
                                    </a>
                                </section>
                            )}

                            <div className={styles.meta}>
                                <p>작성일: {new Date(help.created_at).toLocaleDateString('ko-KR')}</p>
                                {help.updated_at !== help.created_at && (
                                    <p>수정일: {new Date(help.updated_at).toLocaleDateString('ko-KR')}</p>
                                )}
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button className={styles.feedbackButton}>
                                💬 피드백 남기기
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
