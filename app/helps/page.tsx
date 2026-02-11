// Help 카드 목록 페이지
import Link from 'next/link';
import { listRows } from '@/lib/sheets';
import styles from './helps.module.css';

async function getHelpCards() {
    try {
        const cards = await listRows('help_cards');
        return cards.filter((card) => card.status !== 'deleted');
    } catch (error) {
        console.error('Error fetching help cards:', error);
        return [];
    }
}

export default async function HelpsPage() {
    const helpCards = await getHelpCards();

    // 타입별로 분류
    const neededCards = helpCards.filter((card: any) => card.type === 'needed');
    const offeredCards = helpCards.filter((card: any) => card.type === 'offered');

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className="container">
                    <div className={styles.headerContent}>
                        <div>
                            <h1 className={styles.title}>🤝 Help 카드</h1>
                            <p className={styles.subtitle}>
                                도움이 필요하거나 제공할 수 있는 내용을 공유하세요
                            </p>
                        </div>
                        <Link href="/help/new" className={styles.newButton}>
                            ➕ 새 Help 작성
                        </Link>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className="container">
                    {/* 도움 요청 섹션 */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            🙏 도움 요청 (Needed)
                            <span className={styles.count}>{neededCards.length}개</span>
                        </h2>

                        {neededCards.length === 0 ? (
                            <div className={styles.empty}>
                                아직 도움 요청이 없습니다.
                            </div>
                        ) : (
                            <div className={styles.grid}>
                                {neededCards.map((card: any) => (
                                    <Link
                                        key={card.id}
                                        href={`/help/${card.id}`}
                                        className={styles.card}
                                    >
                                        <div className={styles.cardHeader}>
                                            <span className={styles.typeBadge}>🙏 도움 요청</span>
                                            <span className={styles.statusBadge}>
                                                {card.status === 'open' ? '🟢 모집중' : '🔒 마감'}
                                            </span>
                                        </div>
                                        <h3 className={styles.cardTitle}>{card.title}</h3>
                                        <p className={styles.cardDescription}>
                                            {card.description.length > 120
                                                ? card.description.substring(0, 120) + '...'
                                                : card.description}
                                        </p>
                                        <div className={styles.cardFooter}>
                                            <span className={styles.date}>
                                                {new Date(card.created_at).toLocaleDateString('ko-KR')}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* 도움 제공 섹션 */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            🤝 도움 제공 (Offered)
                            <span className={styles.count}>{offeredCards.length}개</span>
                        </h2>

                        {offeredCards.length === 0 ? (
                            <div className={styles.empty}>
                                아직 도움 제공이 없습니다.
                            </div>
                        ) : (
                            <div className={styles.grid}>
                                {offeredCards.map((card: any) => (
                                    <Link
                                        key={card.id}
                                        href={`/help/${card.id}`}
                                        className={styles.card}
                                    >
                                        <div className={styles.cardHeader}>
                                            <span className={styles.typeBadgeOffered}>🤝 도움 제공</span>
                                            <span className={styles.statusBadge}>
                                                {card.status === 'open' ? '🟢 진행중' : '🔒 완료'}
                                            </span>
                                        </div>
                                        <h3 className={styles.cardTitle}>{card.title}</h3>
                                        <p className={styles.cardDescription}>
                                            {card.description.length > 120
                                                ? card.description.substring(0, 120) + '...'
                                                : card.description}
                                        </p>
                                        <div className={styles.cardFooter}>
                                            <span className={styles.date}>
                                                {new Date(card.created_at).toLocaleDateString('ko-KR')}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
