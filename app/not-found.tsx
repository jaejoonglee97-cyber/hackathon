import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: 'var(--bg-primary)'
        }}>
            <h1 style={{
                fontSize: '4rem',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                marginBottom: '1rem'
            }}>404</h1>
            <p style={{
                fontSize: '1.25rem',
                color: 'var(--text-secondary)',
                marginBottom: '2rem'
            }}>
                요청하신 페이지를 찾을 수 없습니다.
            </p>
            <Link
                href="/"
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--brand-primary)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'background-color 0.2s'
                }}
            >
                홈으로 돌아가기
            </Link>
        </div>
    );
}
