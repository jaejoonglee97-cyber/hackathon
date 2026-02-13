// 팀 상세 페이지 - 권한 체크 및 마감일 표시
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getMyProject } from '@/lib/permissions';
import { getCurrentUser } from '@/lib/auth';
import { listRows, getRowBy } from '@/lib/sheets';
import styles from './team.module.css';
import AdminActions from './AdminActions';

export const dynamic = 'force-dynamic';

async function getTeamData(id: string) {
    // 시트 반영 지연 대비 재시도 (최대 3회)
    for (let i = 0; i < 3; i++) {
        try {
            const data = await getMyProject(id);
            if (data) return data;
        } catch (error) {
            console.error(`Error fetching team data (attempt ${i + 1}):`, error);
        }
        // 데이터가 없거나 에러 시 1.0초 대기 후 재시도
        if (i < 2) await new Promise((res) => setTimeout(res, 1000));
    }
    return null;
}

export default async function TeamPage({ params }: { params: { id: string } }) {
    // 로그인 확인
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        redirect('/auth/signin');
    }

    const data = await getTeamData(params.id);

    if (!data) {
        notFound();
    }

    const { team, project, canEdit, editReason, lockType } = data;

    // 멤버 정보 가져오기
    let members: any[] = [];
    try {
        const teamMembers = await listRows('team_members', { team_id: team.id });
        const isAdminUser = ['admin', 'judge'].includes(currentUser.role);

        members = await Promise.all(
            teamMembers.map(async (tm) => {
                const profile = await getRowBy('users_profile', 'user_id', tm.user_id);
                // Auth info for email if needed (a bit expensive to fetch for all, but okay for loop)
                // Actually profile doesn't have email. auth has email.
                let email = '';
                if (isAdminUser) {
                    // We need to find email. `users_auth` has email.
                    // But we don't have a direct `getRowBy('users_auth', 'user_id', ...)` easy access?
                    // We can use `getRowBy` on `users_auth`.
                    const auth = await getRowBy('users_auth', 'user_id', tm.user_id);
                    email = auth?.email || '';
                }

                return {
                    ...tm,
                    name: profile?.name || '알 수 없음',
                    org: profile?.org || '',
                    participantType: profile?.participant_type,
                    phone: isAdminUser ? (profile?.phone || '') : '',
                    email: email,
                    role: tm.role
                };
            })
        );
    } catch (e) {
        console.error('Failed to fetch members', e);
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className="container">
                    <a href="/" className={styles.backLink}>
                        ← 대시보드로 돌아가기
                    </a>
                    <h1 className={styles.teamName}>{team.name}</h1>
                    <div className={styles.teamMeta}>
                        <div className={styles.memberList}>
                            {members.map((m) => (
                                <span key={m.user_id} className={styles.participantInfo}>
                                    <span className={styles.participantName}>{m.name}</span>
                                    {m.participantType && (
                                        <span style={{
                                            fontSize: '0.7em',
                                            backgroundColor: '#eff6ff',
                                            color: '#1d4ed8',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            marginLeft: '6px',
                                            verticalAlign: 'middle'
                                        }}>
                                            {m.participantType === 'participating_org' ? '참여기관' :
                                                m.participantType === 'seoul_social_worker' ? '서울시 사회복지사' : m.participantType}
                                        </span>
                                    )}
                                    {m.org && <span className={styles.participantOrg} style={{ marginLeft: '6px' }}>{m.org}</span>}
                                    {/* Admin View: Email/Phone */}
                                    {m.email && <span className={styles.participantContact} style={{ fontSize: '0.8em', color: '#666', marginLeft: '5px' }}>({m.email} / {m.phone})</span>}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className={styles.headerActions}>
                        <div className={styles.stageBadge}>
                            {team.stage === 'intro' && '도입'}
                            {team.stage === 'validate' && '검증'}
                            {team.stage === 'complete' && '완성'}
                        </div>

                        {/* 편집 버튼 */}
                        {canEdit ? (
                            <Link href={`/teams/${params.id}/edit`} className={styles.editButton}>
                                ✏️ 편집하기
                            </Link>
                        ) : (
                            <button className={styles.editButtonDisabled} disabled title={editReason}>
                                🔒 편집 불가
                            </button>
                        )}
                    </div>

                    {/* 마감일 경고 */}
                    {editReason && lockType === 'soft' && (
                        <div className={styles.warningBanner}>
                            ⚠️ {editReason}
                        </div>
                    )}

                    {editReason && lockType === 'hard' && (
                        <div className={styles.errorBanner}>
                            🔒 {editReason}
                        </div>
                    )}
                </div>
            </header>

            <main className={styles.main}>
                <div className="container">
                    {/* 1. 프로젝트 정보 (New: Name, Track) */}
                    <section className={styles.section} id="info">
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>1️⃣</span>
                            프로젝트 정보
                        </h2>
                        <div className={styles.sectionContent}>
                            <div className={styles.field}>
                                <h3 className={styles.fieldLabel}>프로젝트명</h3>
                                <p className={styles.fieldValue} style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                                    {team.name}
                                </p>
                            </div>
                            <div className={styles.field}>
                                <h3 className={styles.fieldLabel}>분야</h3>
                                <p className={styles.fieldValue}>
                                    {project?.track ? (
                                        <span className={styles.trackBadge}>{project.track}</span>
                                    ) : (
                                        '아직 선택되지 않았습니다.'
                                    )}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 2. 프로젝트 목적 (New: problem_statement) */}
                    <section className={styles.section} id="purpose">
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>2️⃣</span>
                            프로젝트 목적
                        </h2>
                        <div className={styles.sectionContent}>
                            <div className={styles.field}>
                                <h3 className={styles.fieldLabel}>목적</h3>
                                <p className={styles.fieldValue}>
                                    {project?.problem_statement || '아직 작성되지 않았습니다.'}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 2. 문제의식 (New: situation, evidence1, evidence2) */}
                    <section className={styles.section} id="problem">
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>3️⃣</span>
                            문제의식 (프로젝트 필요성)
                        </h2>
                        <div className={styles.sectionContent}>
                            <div className={styles.field}>
                                <h3 className={styles.fieldLabel}>1) 계획 배경</h3>
                                <p className={styles.fieldValue}>
                                    {project?.situation || '아직 작성되지 않았습니다.'}
                                </p>
                            </div>
                            <div className={styles.field}>
                                <h3 className={styles.fieldLabel}>2) 기존 프로젝트와의 차별성</h3>
                                <p className={styles.fieldValue}>
                                    {project?.evidence1 || '아직 작성되지 않았습니다.'}
                                </p>
                            </div>
                            <div className={styles.field}>
                                <h3 className={styles.fieldLabel}>3) 프로젝트의 강점</h3>
                                <p className={styles.fieldValue}>
                                    {project?.evidence2 || '아직 작성되지 않았습니다.'}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 3. 프로젝트 내용 (New: solution, features) */}
                    <section className={styles.section} id="content">
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>4️⃣</span>
                            프로젝트 내용
                        </h2>
                        <div className={styles.sectionContent}>
                            <div className={styles.field}>
                                <h3 className={styles.fieldLabel}>핵심 내용 및 기능</h3>
                                <p className={styles.fieldValue}>
                                    {project?.solution || '아직 작성되지 않았습니다.'}
                                </p>
                            </div>
                            {project?.features && (
                                <div className={styles.field}>
                                    <h3 className={styles.fieldLabel}>추가 상세 기능</h3>
                                    <p className={styles.fieldValue}>
                                        {project.features}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 결과물 링크 */}
                    {(project?.prototype_link || project?.github_link) && (
                        <section className={styles.section} id="links">
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionIcon}>🔗</span>
                                결과물 링크
                            </h2>
                            <div className={styles.sectionContent}>
                                {project?.prototype_link && (
                                    <div className={styles.linkCard}>
                                        <h3>데모/사이트 링크</h3>
                                        <a href={project.prototype_link} target="_blank" rel="noopener noreferrer" className={styles.externalLink}>
                                            {project.prototype_link}
                                        </a>
                                    </div>
                                )}
                                {project?.github_link && (
                                    <div className={styles.linkCard}>
                                        <h3>소스코드 (GitHub 등)</h3>
                                        <a href={project.github_link} target="_blank" rel="noopener noreferrer" className={styles.externalLink}>
                                            {project.github_link}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* 4. 기대효과 (New: hypothesis1) */}
                    <section className={styles.section} id="effects">
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>5️⃣</span>
                            프로젝트로 인한 기대효과
                        </h2>
                        <div className={styles.sectionContent}>
                            <p className={styles.fieldValue}>
                                {project?.hypothesis1 || '아직 작성되지 않았습니다.'}
                            </p>
                        </div>
                    </section>

                    {/* 5. 활용 계획 (New: experiment_log, adoption_checklist) */}
                    <section className={styles.section} id="plan">
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>6️⃣</span>
                            프로젝트의 활용 계획
                        </h2>
                        <div className={styles.sectionContent}>
                            <div className={styles.field}>
                                <h3 className={styles.fieldLabel}>1) 사용 계획</h3>
                                <p className={styles.fieldValue}>
                                    {project?.experiment_log || '아직 작성되지 않았습니다.'}
                                </p>
                            </div>
                            <div className={styles.field}>
                                <h3 className={styles.fieldLabel}>2) 확산 전략</h3>
                                <p className={styles.fieldValue}>
                                    {project?.adoption_checklist || '아직 작성되지 않았습니다.'}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 관리자 액션 (삭제) */}
                    {['admin', 'judge'].includes(currentUser.role) && (
                        <section className={styles.section}>
                            <AdminActions teamId={params.id} isAdmin={true} />
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
