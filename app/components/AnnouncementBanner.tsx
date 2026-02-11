// 공지 및 마감 안내 컴포넌트
import styles from './AnnouncementBanner.module.css';

type Announcement = {
    id: string;
    title: string;
    content: string;
    priority: 'high' | 'normal';
    createdAt: string;
};

type AnnouncementBannerProps = {
    announcements: Announcement[];
    deadline?: {
        stage: string;
        date: string;
    };
};

function getDaysUntil(dateString: string): number {
    const deadline = new Date(dateString);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

export default function AnnouncementBanner({
    announcements,
    deadline,
}: AnnouncementBannerProps) {
    const daysUntilDeadline = deadline ? getDaysUntil(deadline.date) : null;

    return (
        <div className={styles.container}>
            {deadline && (
                <div className={styles.deadline}>
                    <div className={styles.deadlineIcon} aria-hidden="true">
                        ⏰
                    </div>
                    <div className={styles.deadlineContent}>
                        <h3 className={styles.deadlineTitle}>{deadline.stage} 마감</h3>
                        <p className={styles.deadlineDate}>
                            {new Date(deadline.date).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>
                    <div className={styles.deadlineBadge}>
                        {daysUntilDeadline !== null && (
                            <>
                                {daysUntilDeadline > 0 ? (
                                    <span className={styles.daysLeft}>D-{daysUntilDeadline}</span>
                                ) : daysUntilDeadline === 0 ? (
                                    <span className={styles.daysLeft}>오늘 마감</span>
                                ) : (
                                    <span className={styles.expired}>마감됨</span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {announcements.length > 0 && (
                <div className={styles.announcements}>
                    {announcements.map((announcement) => (
                        <div
                            key={announcement.id}
                            className={`${styles.announcement} ${announcement.priority === 'high' ? styles.highPriority : ''
                                }`}
                        >
                            {announcement.priority === 'high' && (
                                <span className={styles.priorityBadge} aria-label="중요">
                                    📢
                                </span>
                            )}
                            <div className={styles.announcementContent}>
                                <h4 className={styles.announcementTitle}>{announcement.title}</h4>
                                <p className={styles.announcementText}>{announcement.content}</p>
                                <time className={styles.announcementTime} dateTime={announcement.createdAt}>
                                    {new Date(announcement.createdAt).toLocaleDateString('ko-KR', {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </time>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
