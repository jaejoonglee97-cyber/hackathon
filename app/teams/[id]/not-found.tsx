import Link from 'next/link';
import { IS_DEV_MODE } from '@/lib/sheets/client';
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

                {IS_DEV_MODE && (
                    <div style={{
                        maxWidth: '600px',
                        margin: '0 auto 2rem',
                        padding: '1rem',
                        backgroundColor: '#fff3cd',
                        color: '#856404',
                        border: '1px solid #ffeeba',
                        borderRadius: '0.5rem',
                        textAlign: 'left'
                    }}>
                        <strong>⚠️ 개발 모드(인메모리) 경고</strong>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            현재 <strong>환경변수(Google Sheets 등)</strong>가 설정되지 않아, 데이터가 메모리에만 임시 저장되었습니다.<br />
                            서버리스 환경(Vercel)에서는 페이지 이동 시 <strong>메모리가 초기화되어 데이터가 사라집니다.</strong>
                        </p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            👉 Vercel 설정에서 <code>AUTH_SHEET_ID</code>, <code>DATA_SHEET_ID</code> 등 환경변수를 등록해주세요.
                        </p>
                    </div>
                )}

                <Link href="/" className={styles.primaryButton}>
                    대시보드로 돌아가기
                </Link>
            </div>
        </div>
    );
}
