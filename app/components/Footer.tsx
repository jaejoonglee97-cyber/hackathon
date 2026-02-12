import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.copyright}>
                    &copy; 2026 열매똑똑 해커톤. All rights reserved.
                </div>
                <div className={styles.links}>
                    <Link href="/privacy" className={styles.link}>
                        개인정보 처리방침
                    </Link>
                    <Link href="/guide" className={styles.link}>
                        이용 가이드
                    </Link>
                </div>
            </div>
        </footer>
    );
}
