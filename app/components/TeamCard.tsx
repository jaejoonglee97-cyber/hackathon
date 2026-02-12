// 팀 카드 컴포넌트 - 점수/순위 없이 Help/Insight/기여 배지 중심
import Link from 'next/link';
import styles from './TeamCard.module.css';

export type Team = {
    id: string;
    name: string;
    org?: string;
    track?: string; // 분야
    stage: 'intro' | 'validate' | 'complete';
    recentUpdate: string;
    helpCount: number;
    insightCount: number;
    badges: string[]; // 기여 배지
    updatedAt: string;
};

const STAGE_LABELS: Record<Team['stage'], string> = {
    intro: '도입',
    validate: '검증',
    complete: '완성',
};

type TeamCardProps = {
    team: Team;
};

export default function TeamCard({ team }: TeamCardProps) {
    return (
        <Link href={`/teams/${team.id}`} className={styles.card}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h3 className={styles.teamName}>{team.name}</h3>
                    {team.org && <p className={styles.org}>{team.org}</p>}
                </div>
                <span className={`${styles.stageBadge} ${styles[`stage-${team.stage}`]}`}>
                    {STAGE_LABELS[team.stage]}
                </span>
            </div>

            {/* 등록일 */}
            <p className={styles.recentUpdate} style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                등록일: {team.recentUpdate}
            </p>

            <div className={styles.metrics}>
                {/* Help/Insight metrics removed */}
                {team.track && (
                    <span style={{ fontSize: '0.8rem', backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', color: '#4b5563' }}>
                        {team.track}
                    </span>
                )}
            </div>

            {team.badges.length > 0 && (
                <div className={styles.badges}>
                    {team.badges.map((badge, index) => (
                        <span key={index} className={styles.badge}>
                            {badge}
                        </span>
                    ))}
                </div>
            )}

            <time className={styles.timestamp} dateTime={team.updatedAt}>
                최종 업데이트: {new Date(team.updatedAt).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })}
            </time>
        </Link>
    );
}
