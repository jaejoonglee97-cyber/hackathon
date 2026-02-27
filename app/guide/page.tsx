import styles from './guide.module.css';
import ScrollReveal from '@/app/components/ScrollReveal';
import AwardTabs from './AwardTabs';

export default function GuidePage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className="container">
                    <a href="/" className={styles.backLink}>← 대시보드로 돌아가기</a>
                    <h1 className={styles.title}>이용 가이드 &amp; QnA</h1>
                    <p className={styles.subtitle}>해커톤 허브를 100% 활용하는 방법을 안내해 드립니다.</p>
                </div>
            </header>

            {/* 슬로건 배너 */}
            <ScrollReveal>
                <div style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%)',
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    color: 'white',
                }}>
                    <div className="container">
                        <p style={{
                            fontSize: '1.35rem',
                            fontWeight: 800,
                            lineHeight: 1.5,
                            margin: '0 0 0.6rem',
                            letterSpacing: '-0.02em',
                            wordBreak: 'keep-all',
                        }}>
                            ✨ 해커톤 이후,<br />서울 2만 사회복지사 앞에 내 앱이 올라가 있을 겁니다.
                        </p>
                        <p style={{
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.85)',
                            margin: 0,
                            lineHeight: 1.6,
                            wordBreak: 'keep-all',
                        }}>
                            아이디어는 있는데 시작이 어려웠던 분, 도전해 보고 싶었던 분, 내 결과물을 현장에 확산하고 싶은 분<br />
                            — 지금이 바로 그 기회입니다. 🚀
                        </p>
                    </div>
                </div>
            </ScrollReveal>

            <main className={styles.main}>
                <div className="container">

                    {/* ① 사업 개요 */}
                    <ScrollReveal>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>📋 사업 개요</h2>
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>열매똑똑 해커톤이란?</h3>
                                <p className={styles.cardText}>
                                    해커톤(Hackathon)의 핵심은 <strong>&lsquo;집중적으로 문제를 해결하고, 결과물을 만들어내는 것&rsquo;</strong>입니다.<br />
                                    열매똑똑 해커톤은 이 정신을 사회복지 현장에 가져왔습니다.
                                    <br /><br />
                                    🎯 <strong>우리가 푸는 문제</strong><br />
                                    매일 반복되는 서류 작업, 접근이 어려운 이용자 지원, 팀 간 공유가 안 되는 지식 —<br />
                                    현장에서 직접 느끼는 불편함을 <strong>AI와 디지털 도구</strong>로 해결하는 프로젝트를 만듭니다.
                                    <br /><br />
                                    👥 <strong>참가 대상</strong>
                                    <ul style={{ listStyle: 'disc', paddingLeft: '1.2rem', marginTop: '0.3rem', fontSize: '0.95rem' }}>
                                        <li><strong>열매똑똑 참여기관:</strong> 기존 1·2차년도 스마트워크 사업 참여 경험이 있는 기관</li>
                                        <li><strong>서울시 사회복지사:</strong> 서울 소재 사회복지시설·기관 종사자 누구나</li>
                                    </ul>
                                    <div style={{
                                        marginTop: '1.2rem',
                                        padding: '0.9rem 1.1rem',
                                        backgroundColor: '#eff6ff',
                                        border: '1.5px solid #93c5fd',
                                        borderRadius: '0.6rem',
                                        fontSize: '0.93rem',
                                        lineHeight: 1.75,
                                    }}>
                                        <strong style={{ fontSize: '1rem' }}>💡 코딩을 못해도 되나요?</strong><br />
                                        네, <strong>코딩이나 개발 경험은 전혀 필요 없습니다.</strong><br />
                                        현장의 문제를 가장 잘 아는 사람은 사회복지사입니다. 여러분의 경험과 아이디어가 핵심이고,<br />
                                        AI 도구가 기술적인 부분을 도와줍니다. 구글 시트, 앱시트, 노션 등 익숙한 도구도 충분합니다. 🌱
                                    </div>
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
                    </ScrollReveal>

                    {/* ② 사이트 활용 안내 */}
                    <ScrollReveal delay={100}>
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
                                    프로젝트 편집 페이지에서 <strong>[①프로젝트명 - ②목적 - ③문제의식 - ④내용 - ⑤기대효과 - ⑥활용계획]</strong> 내용을 채워나가세요.<br />
                                    진행 상황에 따라 단계를 직접 변경할 수 있습니다.
                                    <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem', fontSize: '0.95rem' }}>
                                        <li><strong>1단계(도입):</strong> 문제 정의 및 아이디어 구상</li>
                                        <li><strong>2단계(검증):</strong> 프로토타입 제작 및 가설 검증</li>
                                        <li><strong>3단계(완성):</strong> 결과물 도출 및 확산 계획 수립</li>
                                    </ul>
                                    <div style={{
                                        marginTop: '1rem',
                                        padding: '0.85rem 1rem',
                                        backgroundColor: '#fef3c7',
                                        border: '1.5px solid #f59e0b',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.95rem',
                                        lineHeight: 1.7,
                                    }}>
                                        ⚠️ <strong>심사는 &lsquo;3단계(완성)&rsquo; 상태의 프로젝트만 대상입니다.</strong><br />
                                        앱·결과물 구동이 잘 된다면 반드시 진행 단계를 <strong>&lsquo;3단계(완성)&rsquo;으로 변경</strong>하고 저장해 주세요.<br />
                                        <span style={{ color: '#92400e' }}>완성으로 바꾸지 않으면 심사 대상에서 제외될 수 있습니다!</span>
                                    </div>
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
                    </ScrollReveal>

                    {/* ③ 시상 안내 (탭 UI) */}
                    <ScrollReveal delay={200}>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>🏆 시상 안내</h2>

                            {/* 시상 개요 설명 */}
                            <div className={styles.card} style={{ marginBottom: '1rem' }}>
                                <h3 className={styles.cardTitle}>열매똑똑 해커톤 시상</h3>
                                <p className={styles.cardText} style={{ marginBottom: 0 }}>
                                    아래 <strong>&lsquo;부문별&rsquo;</strong>은 3가지 <strong>제출 주제</strong>를 기준으로 각각 수상자를 선정한다는 의미입니다.
                                    <ul style={{ marginTop: '0.4rem', paddingLeft: '1.2rem', fontSize: '0.93rem', lineHeight: 1.8 }}>
                                        <li>현장 업무경감 자동화</li>
                                        <li>이용자 지원 및 접근성 개선</li>
                                        <li>협업·지식관리·성과지표</li>
                                    </ul>
                                    특별상과 참여상은 주제 구분 없이 별도 선정됩니다.
                                </p>
                            </div>

                            {/* 탭 UI */}
                            <AwardTabs />
                        </section>
                    </ScrollReveal>

                    {/* ④ FAQ */}
                    <ScrollReveal delay={300}>
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
                                    <summary className={styles.faqQuestion}>Q. 이 해커톤은 개인 참가인가요, 팀 참가인가요? (여러 개 제출 가능한가요?)</summary>
                                    <div className={styles.faqAnswer}>
                                        A. 열매똑똑 해커톤은 <strong>개인 프로젝트 경진대회</strong>입니다.<br />
                                        원칙적으로 <strong>1인당 1개의 프로젝트만 제출</strong>할 수 있습니다. 한 명의 참가자가 하나의 프로젝트에 집중하여 등록하고 진행해 주시기 바랍니다.
                                    </div>
                                </details>
                                <details className={styles.faqItem}>
                                    <summary className={styles.faqQuestion}>Q. 다른 참가자의 프로젝트를 볼 수 있나요?</summary>
                                    <div className={styles.faqAnswer}>
                                        A. 네, 대시보드에서 다른 참가자의 카드를 클릭하면 진행 상황과 내용을 열람할 수 있습니다.<br />
                                        서로의 아이디어를 보고 배우며 인사이트를 얻어보세요!
                                    </div>
                                </details>
                                <details className={styles.faqItem}>
                                    <summary className={styles.faqQuestion}>Q. 접수 마감 이후에도 내용을 수정할 수 있나요?</summary>
                                    <div className={styles.faqAnswer}>
                                        A. <strong>마감일(3월 27일 18:00) 이후</strong>에는 내용 수정이 제한됩니다.<br />
                                        마감 후에는 제출된 내용을 기준으로 서류 심사가 진행되니, 반드시 마감 전에 저장을 완료해 주세요.
                                    </div>
                                </details>
                                <details className={styles.faqItem}>
                                    <summary className={styles.faqQuestion}>Q. AI 도구를 사용하면 감점이 되나요?</summary>
                                    <div className={styles.faqAnswer}>
                                        A. 아닙니다! AI 도구 활용 여부는 <strong>감점 요소가 없습니다.</strong><br />
                                        오히려 어떤 AI 도구를 어떻게 활용했는지 성실히 기록하면, 다른 기관이 따라 만들 수 있는 참고 자료가 됩니다.<br />
                                        사용한 AI 도구·범위·결과 확인 방법을 편집 화면에 솔직하게 기재해 주세요.
                                    </div>
                                </details>
                                <details className={styles.faqItem}>
                                    <summary className={styles.faqQuestion}>Q. 아직 완성이 안 된 프로젝트도 제출할 수 있나요?</summary>
                                    <div className={styles.faqAnswer}>
                                        A. 네, 가능합니다. 완성도보다 <strong>문제 정의(Why)의 명확성, 시도한 과정, 확산 가능성</strong>을 중심으로 심사합니다.<br />
                                        아이디어 단계라도 &ldquo;왜 이 문제를 해결하려 하는가&rdquo;를 잘 설명한 프로젝트를 적극 권장합니다.
                                    </div>
                                </details>
                                <details className={styles.faqItem}>
                                    <summary className={styles.faqQuestion}>Q. 제출물에 어떤 링크를 넣어야 하나요?</summary>
                                    <div className={styles.faqAnswer}>
                                        A. 프로토타입·결과물 링크(구글 시트, 앱시트, 노션, 웹앱, GitHub 등)를 자유롭게 첨부하면 됩니다.<br />
                                        단, <strong>링크는 권한 제한 공유(특정 인원에게만 공개)</strong>로 설정해 주세요.<br />
                                        &lsquo;전체 공개&rsquo; 링크에 개인정보가 포함된 경우 심사에서 불이익이 있을 수 있습니다.
                                    </div>
                                </details>
                                <details className={styles.faqItem}>
                                    <summary className={styles.faqQuestion}>Q. 제출물에 이용자(클라이언트) 개인정보를 포함할 수 있나요?</summary>
                                    <div className={styles.faqAnswer}>
                                        A. <strong>절대 포함하면 안 됩니다.</strong><br />
                                        실명·연락처·주민번호·사례 기록 등 개인식별정보는 반드시 제외하거나 비식별 처리(익명화·가명 처리) 후 업로드해 주세요.<br />
                                        편집 화면 하단의 &lsquo;안전성 체크리스트&rsquo;를 모두 체크해야 저장이 가능합니다.
                                    </div>
                                </details>
                                <details className={styles.faqItem}>
                                    <summary className={styles.faqQuestion}>Q. 심사 기준이 궁금해요.</summary>
                                    <div className={styles.faqAnswer}>
                                        A. 심사는 아래 기준을 종합 평가합니다.
                                        <ul style={{ marginTop: '0.4rem', paddingLeft: '1.2rem', lineHeight: 1.8 }}>
                                            <li><strong>문제 정의(Why)의 명확성</strong> — 현장 문제와 필요성을 잘 설명했는가</li>
                                            <li><strong>해결 방안의 창의성·실현 가능성</strong> — 현장에서 실제로 쓸 수 있는가</li>
                                            <li><strong>AI 활용의 적절성</strong> — AI를 도구로 잘 활용했는가 (사용 여부와 무관)</li>
                                            <li><strong>확산 가능성</strong> — 타 기관·현장에서 재사용할 수 있는가</li>
                                            <li><strong>안전성</strong> — 개인정보 보호 원칙을 준수했는가</li>
                                        </ul>
                                    </div>
                                </details>
                                <details className={styles.faqItem}>
                                    <summary className={styles.faqQuestion}>Q. 1차 서류 심사 결과는 어떻게 알 수 있나요?</summary>
                                    <div className={styles.faqAnswer}>
                                        A. 1차 서류 심사(4월 1일~3일) 결과는 <strong>개별 이메일</strong>로 안내드립니다.<br />
                                        입력하신 이메일 주소를 정확히 확인해 주세요.<br />
                                        추가 문의는 이 페이지의 <a href="/qna" style={{ color: '#7c3aed', fontWeight: 600 }}>문의 게시판</a>을 이용해 주세요.
                                    </div>
                                </details>
                            </div>
                        </section>
                    </ScrollReveal>

                </div>
            </main>
        </div>
    );
}
