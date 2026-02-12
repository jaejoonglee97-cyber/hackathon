// 팀 상세 페이지 - 권한 체크 및 마감일 표시
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getMyProject } from '@/lib/permissions';
import { getCurrentUser } from '@/lib/auth';
import { listRows, getRowBy } from '@/lib/sheets';
import styles from './team.module.css';

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
        members = await Promise.all(
            teamMembers.map(async (tm) => {
                const profile = await getRowBy('users_profile', 'user_id', tm.user_id);
                return {
                    ...tm,
                    name: profile?.name || '알 수 없음',
                    org: profile?.org || '',
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
                                    {m.org && <span className={styles.participantOrg}>{m.org}</span>}
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
                    {/* FR-10: Why (문제/고객) */}
                    <section className={styles.section} id="why">
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>🎯</span>
                            Why - 왜 만드는가?
                        </h2>
                        <div className={styles.sectionContent}>
                            <div className={styles.field}>
                                <h3 className={styles.fieldLabel}>대상 (누구)</h3>
                                <p className={styles.fieldValue}>
                                    {project?.target_audience || '아직 작성되지 않았습니다.'}
                                </p>
                            </div>

                            <div className={styles.field}>
                                <h3 className={styles.fieldLabel}>상황 (언제)</h3>
                                <p className={styles.fieldValue}>
                                    {project?.situation || '아직 작성되지 않았습니다.'}
                                </p>
                            </div>

                            <div className={styles.field}>
                                <h3 className={styles.fieldLabel}>문제 (무엇)</h3>
                                <p className={styles.fieldValue}>
                                    {project?.problem_statement || '아직 작성되지 않았습니다.'}
                                </p>
                            </div>

                            <div className={styles.evidenceSection}>
                                <h3 className={styles.fieldLabel}>
                                    증거 (인터뷰/관찰/업무로그)
                                    <span className={styles.privacyWarning}>
                                        ⚠️ 개인정보(실명/연락처/사례식별정보) 금지
                                    </span>
                                </h3>
                                <ul className={styles.evidenceList}>
                                    {project?.evidence1 && <li>{project.evidence1}</li>}
                                    {project?.evidence2 && <li>{project.evidence2}</li>}
                                    {project?.evidence3 && <li>{project.evidence3}</li>}
                                    {!project?.evidence1 && !project?.evidence2 && !project?.evidence3 && (
                                        <li className={styles.emptyText}>아직 작성되지 않았습니다.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* FR-11: 가설 */}
                    <section className={styles.section} id="hypothesis">
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>💭</span>
                            가설
                        </h2>
                        <div className={styles.sectionContent}>
                            <ul className={styles.hypothesisList}>
                                {project?.hypothesis1 && (
                                    <li className={styles.hypothesisItem}>{project.hypothesis1}</li>
                                )}
                                {project?.hypothesis2 && (
                                    <li className={styles.hypothesisItem}>{project.hypothesis2}</li>
                                )}
                                {!project?.hypothesis1 && !project?.hypothesis2 && (
                                    <li className={styles.emptyText}>아직 작성되지 않았습니다.</li>
                                )}
                            </ul>
                        </div>
                    </section>

                    {/* FR-12: 해결 (솔루션/업무흐름) */}
                    <section className={styles.section} id="solution">
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>⚙️</span>
                            해결 방법
                        </h2>
                        <div className={styles.sectionContent}>
                            <div className={styles.field}>
                                <h3 className={styles.fieldLabel}>솔루션 설명</h3>
                                <p className={styles.fieldValue}>
                                    {project?.solution || '아직 작성되지 않았습니다.'}
                                </p>
                            </div>

                            <div className={styles.field}>
                                <h3 className={styles.fieldLabel}>핵심 기능</h3>
                                <p className={styles.fieldValue}>
                                    {project?.features || '아직 작성되지 않았습니다.'}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* FR-13: 프로토타입/데모 */}
                    <section className={styles.section} id="prototype">
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>🔗</span>
                            프로토타입/데모
                        </h2>
                        <div className={styles.sectionContent}>
                            {project?.prototype_link && (
                                <div className={styles.linkCard}>
                                    <h3>프로토타입 링크</h3>
                                    <a
                                        href={project.prototype_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.externalLink}
                                    >
                                        {project.prototype_link}
                                    </a>
                                </div>
                            )}

                            {project?.github_link && (
                                <div className={styles.linkCard}>
                                    <h3>GitHub 레포지토리</h3>
                                    <a
                                        href={project.github_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.externalLink}
                                    >
                                        {project.github_link}
                                    </a>
                                </div>
                            )}

                            {!project?.prototype_link && !project?.github_link && (
                                <p className={styles.emptyText}>아직 작성되지 않았습니다.</p>
                            )}
                        </div>
                    </section>

                    {/* FR-14: 검증 로그 */}
                    <section className={styles.section} id="experiment">
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>🔬</span>
                            검증 로그
                        </h2>
                        <div className={styles.sectionContent}>
                            <div className={styles.field}>
                                <h3 className={styles.fieldLabel}>실험 내용 및 결과</h3>
                                <p className={styles.fieldValue}>
                                    {project?.experiment_log || '아직 작성되지 않았습니다.'}
                                </p>
                            </div>

                            <div className={styles.insightBox}>
                                <h3 className={styles.fieldLabel}>
                                    🎓 틀렸던 가정 1개 (Insight 강제)
                                </h3>
                                <p className={styles.fieldValue}>
                                    {project?.wrong_assumption || '아직 작성되지 않았습니다.'}
                                </p>
                            </div>

                            <div className={styles.field}>
                                <h3 className={styles.fieldLabel}>다음에 검증할 것</h3>
                                <p className={styles.fieldValue}>
                                    {project?.next_test || '아직 작성되지 않았습니다.'}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* FR-15: 확산/운영 계획 */}
                    <section className={styles.section} id="adoption">
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>🌱</span>
                            확산/운영 계획
                        </h2>
                        <div className={styles.sectionContent}>
                            <div className={styles.field}>
                                <h3 className={styles.fieldLabel}>
                                    타 기관 재사용 체크리스트
                                </h3>
                                <p className={styles.fieldValue}>
                                    {project?.adoption_checklist || '아직 작성되지 않았습니다.'}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
