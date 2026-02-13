// 팀 카드 컴포넌트 - 점수/순위 없이 Help/Insight/기여 배지 중심
import Link from 'next/link';
import styles from './TeamCard.module.css';

export type Team = {
    id: string;
    name: string;
    org?: string;
    track?: string; // 분야
    participantType?: string; // 참여 유형 (1·2차년도 참여기관 / 서울시 사회복지사)
    stage: 'intro' | 'validate' | 'complete';
    recentUpdate: string;
    helpCount: number;
    insightCount: number;
    badges: string[]; // 기여 배지
    createdAt: string; // 등록일 (for sorting)
    updatedAt: string;
};

const PARTICIPANT_TYPE_LABELS: Record<string, string> = {
    participating_org: '참여기관',
    seoul_social_worker: '서울시 사회복지사',
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
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {team.participantType && PARTICIPANT_TYPE_LABELS[team.participantType] && (
                            <span style={{
                                fontSize: '0.75rem',
                                backgroundColor: '#e0e7ff',
                                color: '#4338ca',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                                fontWeight: 600
                            }}>
                                {PARTICIPANT_TYPE_LABELS[team.participantType]}
                            </span>
                        )}
                        {team.org && <p className={styles.org}>{team.org}</p>}
                    </div>
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
