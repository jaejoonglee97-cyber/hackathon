// Insight 카드 목록 페이지
import Link from 'next/link';
import { listRows } from '@/lib/sheets';
import styles from './insights.module.css';

async function getInsightCards() {
    try {
        const cards = await listRows('insight_cards');
        return cards.filter((card) => card.category !== 'deleted');
    } catch (error) {
        console.error('Error fetching insight cards:', error);
        return [];
    }
}

// 카테고리 한글 매핑
const categoryLabels: Record<string, string> = {
    general: '일반',
    customer: '고객 이해',
    technical: '기술',
    process: '프로세스',
    team: '팀워크',
};

export default async function InsightsPage() {
    const insightCards = await getInsightCards();

    // 최신순 정렬
    const sortedCards = [...insightCards].sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // 카테고리별로 분류
    const cardsByCategory: Record<string, any[]> = {
        customer: [],
        technical: [],
        process: [],
        team: [],
        general: [],
    };

    sortedCards.forEach((card: any) => {
        const category = card.category || 'general';
        if (cardsByCategory[category]) {
            cardsByCategory[category].push(card);
        } else {
            cardsByCategory.general.push(card);
        }
    });

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className="container">
                    <div className={styles.headerContent}>
                        <div>
                            <h1 className={styles.title}>🎓 Insight 카드</h1>
                            <p className={styles.subtitle}>
                                틀렸던 가정과 새롭게 배운 점을 공유하세요
                            </p>
                        </div>
                        <Link href="/insight/new" className={styles.newButton}>
                            ➕ 새 Insight 작성
                        </Link>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className="container">
                    {/* 전체 Insight */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            📚 모든 Insight
                            <span className={styles.count}>{sortedCards.length}개</span>
                        </h2>

                        {sortedCards.length === 0 ? (
                            <div className={styles.empty}>
                                아직 Insight가 없습니다. 첫 번째 Insight를 작성해보세요!
                            </div>
                        ) : (
                            <div className={styles.cardList}>
                                {sortedCards.map((card: any) => (
                                    <Link
                                        key={card.id}
                                        href={`/insight/${card.id}`}
                                        className={styles.card}
                                    >
                                        <div className={styles.cardHeader}>
                                            <span className={styles.categoryBadge}>
                                                {categoryLabels[card.category] || '일반'}
                                            </span>
                                            <span className={styles.date}>
                                                {new Date(card.created_at).toLocaleDateString('ko-KR')}
                                            </span>
                                        </div>
                                        <p className={styles.cardContent}>
                                            {card.content.length > 200
                                                ? card.content.substring(0, 200) + '...'
                                                : card.content}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* 카테고리별 섹션 */}
                    {Object.entries(cardsByCategory).map(([category, cards]) => {
                        if (cards.length === 0) return null;

                        return (
                            <section key={category} className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    {categoryLabels[category]}
                                    <span className={styles.count}>{cards.length}개</span>
                                </h2>

                                <div className={styles.cardList}>
                                    {cards.map((card: any) => (
                                        <Link
                                            key={card.id}
                                            href={`/insight/${card.id}`}
                                            className={styles.card}
                                        >
                                            <div className={styles.cardHeader}>
                                                <span className={styles.categoryBadge}>
                                                    {categoryLabels[category]}
                                                </span>
                                                <span className={styles.date}>
                                                    {new Date(card.created_at).toLocaleDateString('ko-KR')}
                                                </span>
                                            </div>
                                            <p className={styles.cardContent}>
                                                {card.content.length > 200
                                                    ? card.content.substring(0, 200) + '...'
                                                    : card.content}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
