import styles from './guide.module.css';


export default function GuidePage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className="container">
                    <a href="/" className={styles.backLink}>← 대시보드로 돌아가기</a>
                    <h1 className={styles.title}>이용 가이드 & QnA</h1>
                    <p className={styles.subtitle}>해커톤 허브를 100% 활용하는 방법을 안내해 드립니다.</p>
                </div>
            </header>

            <main className={styles.main}>
                <div className="container">
                    {/* 1. 사업 개요 (New) */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>📋 사업 개요</h2>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>열매똑똑 해커톤이란?</h3>
                            <p className={styles.cardText}>
                                사회복지 현장 문제를 사회복지사 관점에서 해결하는 아이디어 및 개선안을 발굴하고,<br />
                                스마트워크 활용 기반 우수 모델을 선정하여 확산시키고자 하는 사업입니다.
                                <br /><br />
                                👥 <strong>참가 대상</strong>
                                <ul style={{ listStyle: 'disc', paddingLeft: '1.2rem', marginTop: '0.3rem', fontSize: '0.95rem' }}>
                                    <li><strong>열매똑똑 참여기관 부문:</strong> 기존 1·2차년도 스마트워크 사업 참여 경험이 있는 기관</li>
                                    <li><strong>서울시 사회복지사 부문:</strong> 서울 소재 사회복지시설·기관 종사자 누구나</li>
                                </ul>
                            </p>
                            <br />
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>📅 주요 일정</h4>
                            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#4b5563', lineHeight: '1.6' }}>
                                <li><strong>온라인 접수:</strong> 2026. 3. 9.(월) ~ 3. 27.(금) 18:00</li>
                                <li><strong>1차 서류 심사:</strong> 2026. 4. 1.(수) ~ 4. 3.(금)</li>
                                <li><strong>최종 발표 및 시상:</strong> 2026. 4. 29.(수) (2차년도 성과공유회 2부)</li>
                            </ul>
                        </div>
                    </section>

                    {/* 2. 사이트 활용 안내 (Updated) */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>💻 사이트 활용 안내</h2>

                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>1. 프로젝트 등록 및 관리</h3>
                            <p className={styles.cardText}>
                                대시보드의 <strong style={{ color: '#ec4899' }}>[🚀 프로젝트 등록하기]</strong> 버튼으로 개인 프로젝트를 등록하세요.<br />
                                <br />
                                ✅ <strong>분야 선택:</strong> 편집 화면에서 아래 3가지 분야 중 하나를 꼭 선택해주세요.
                                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem', fontSize: '0.95rem' }}>
                                    <li>현장 업무경감 자동화</li>
                                    <li>이용자 지원 및 접근성 개선</li>
                                    <li>협업·지식관리·성과지표</li>
                                </ul>
                                ✅ <strong>이름 수정:</strong> 프로젝트 이름은 최대 <strong>3회</strong>까지만 수정 가능하니 신중하게 정해주세요!
                            </p>
                        </div>

                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>2. 단계별 프로젝트 발전</h3>
                            <p className={styles.cardText}>
                                프로젝트 편집 페이지에서 <strong>[Why - 가설 - 해결 - 검증]</strong> 내용을 채워나가세요.<br />
                                진행 상황에 따라 단계를 직접 변경할 수 있습니다.
                                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem', fontSize: '0.95rem' }}>
                                    <li><strong>1단계(도입):</strong> 문제 정의 및 아이디어 구상</li>
                                    <li><strong>2단계(검증):</strong> 프로토타입 제작 및 가설 검증</li>
                                    <li><strong>3단계(완성):</strong> 결과물 도출 및 확산 계획 수립</li>
                                </ul>
                            </p>
                        </div>

                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>3. 마감 기한 확인</h3>
                            <p className={styles.cardText}>
                                대시보드 상단의 <strong>D-Day 위젯</strong>을 통해 남은 시간을 실시간으로 확인할 수 있습니다.<br />
                                3월 27일(금) 18:00 정각에 접수가 마감되니 미리 저장해주세요.
                            </p>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>❓ 자주 묻는 질문 (FAQ)</h2>
                        <div className={styles.faqList}>
                            <details className={styles.faqItem}>
                                <summary className={styles.faqQuestion}>Q. 프로젝트 내용을 수정하고 싶어요.</summary>
                                <div className={styles.faqAnswer}>
                                    A. 프로젝트 상세 페이지에서 <strong>[✏️ 편집하기]</strong> 버튼을 누르면 내용을 수정할 수 있습니다.<br />
                                    단, 마감 기한이 지난 경우 수정이 제한될 수 있습니다.
                                </div>
                            </details>
                            <details className={styles.faqItem}>
                                <summary className={styles.faqQuestion}>Q. 이 해커톤은 개인 참가인가요, 팀 참가인가요?</summary>
                                <div className={styles.faqAnswer}>
                                    A. 열매똑똑 해커톤은 <strong>개인 프로젝트 경진대회</strong>입니다.<br />
                                    한 명의 참가자가 하나의 프로젝트를 등록하여 진행합니다.
                                </div>
                            </details>
                            <details className={styles.faqItem}>
                                <summary className={styles.faqQuestion}>Q. 다른 참가자의 프로젝트를 볼 수 있나요?</summary>
                                <div className={styles.faqAnswer}>
                                    A. 네, 대시보드에서 다른 참가자의 카드를 클릭하면 진행 상황과 내용을 열람할 수 있습니다.<br />
                                    서로의 아이디어를 보고 배우며 인사이트를 얻어보세요!
                                </div>
                            </details>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}
