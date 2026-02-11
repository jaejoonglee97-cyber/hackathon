// 공동 목표 컴포넌트 - 팀 경쟁이 아니라 공동 성과 강조
import styles from './SharedGoal.module.css';

type SharedGoalProps = {
    title: string;
    description: string;
    current: number;
    target: number;
    unit: string;
};

export default function SharedGoal({
    title,
    description,
    current,
    target,
    unit,
}: SharedGoalProps) {
    const percentage = Math.min((current / target) * 100, 100);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.description}>{description}</p>
            </div>

            <div className={styles.progressSection}>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${percentage}%` }}
                        role="progressbar"
                        aria-valuenow={current}
                        aria-valuemin={0}
                        aria-valuemax={target}
                        aria-label={`${title}: ${current}${unit} / ${target}${unit}`}
                    />
                </div>

                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>
                            {current.toLocaleString('ko-KR')}
                            <span className={styles.statUnit}>{unit}</span>
                        </span>
                        <span className={styles.statLabel}>현재</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>
                            {target.toLocaleString('ko-KR')}
                            <span className={styles.statUnit}>{unit}</span>
                        </span>
                        <span className={styles.statLabel}>목표</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>
                            {percentage.toFixed(1)}
                            <span className={styles.statUnit}>%</span>
                        </span>
                        <span className={styles.statLabel}>달성률</span>
                    </div>
                </div>
            </div>

            {percentage >= 100 && (
                <div className={styles.achievement}>
                    🎉 목표 달성! 모두 함께 만든 성과입니다.
                </div>
            )}
        </div>
    );
}
