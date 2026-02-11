// Insight 카드 상세 페이지
import { notFound } from 'next/navigation';
import { getRowBy } from '@/lib/sheets';
import styles from './insight.module.css';

async function getInsightData(insightId: string) {
    try {
        return await getRowBy('insight_cards', 'id', insightId);
    } catch (error) {
        console.error('Error fetching insight data:', error);
        return null;
    }
}

export default async function InsightDetailPage({
    params,
}: {
    params: { insightId: string };
}) {
    const insight = await getInsightData(params.insightId);

    if (!insight) {
        notFound();
    }

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
                        <h1 className={styles.title}>
                            <span className={styles.icon}>💡</span>
                            Insight - 배운 점
                        </h1>

                        <div className={styles.content}>
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    틀렸던 가정 1개
                                </h2>
                                <div className={styles.insightBox}>
                                    <p className={styles.text}>{insight.wrong_assumption}</p>
                                </div>
                            </section>

                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    다음에 검증할 것
                                </h2>
                                <div className={styles.nextTestBox}>
                                    <p className={styles.text}>{insight.next_test}</p>
                                </div>
                            </section>

                            <div className={styles.meta}>
                                <p>작성일: {new Date(insight.created_at).toLocaleDateString('ko-KR')}</p>
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
