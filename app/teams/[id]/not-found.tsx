import Link from 'next/link';
import styles from './team.module.css';

export default function NotFound() {
    return (
        <div className={styles.page}>
            <div className={styles.container} style={{ textAlign: 'center', padding: '100px 0' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
                <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
                    원하시는 팀 페이지를 찾을 수 없습니다.
                    <br />
                    잠시 후 다시 시도해보시거나, 삭제되었을 수 있습니다.
                </p>
                <Link href="/" className={styles.primaryButton}>
                    대시보드로 돌아가기
                </Link>
            </div>
        </div>
    );
}
