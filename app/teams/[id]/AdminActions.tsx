'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminActions({ teamId, isAdmin }: { teamId: string, isAdmin: boolean }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    if (!isAdmin) return null;

    const handleDelete = async () => {
        if (!confirm('정말로 이 프로젝트를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/teams/${teamId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('삭제되었습니다.');
                router.push('/');
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || '삭제 실패');
            }
        } catch (error) {
            console.error(error);
            alert('오류 발생');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid red', borderRadius: '4px', backgroundColor: '#fff0f0' }}>
            <h4 style={{ color: 'red', margin: '0 0 10px 0' }}>⚠️ 관리자 영역</h4>
            <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                    backgroundColor: 'red',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                {deleting ? '삭제 중...' : '이 프로젝트 삭제 (복구 불가)'}
            </button>
        </div>
    );
}
