import styles from './guide.module.css';
import QnABoard from './QnABoard';

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
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>📅 사이트 활용 안내</h2>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>1. 프로젝트 등록하기</h3>
                            <p className={styles.cardText}>
                                대시보드 우측 상단의 <strong>[🚀 프로젝트 등록하기]</strong> 버튼을 눌러보세요.<br />
                                프로젝트 이름과 간단한 소개를 입력하면 전용 워크스페이스가 생성됩니다.
                            </p>
                        </div>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>2. 단계별 프로젝트 발전</h3>
                            <p className={styles.cardText}>
                                프로젝트 페이지에서 <strong>[Why - 가설 - 해결 - 검증]</strong> 순서로 내용을 채워나가세요.<br />
                                각 단계는 해커톤 진행 상황에 맞춰 <strong>도입 → 검증 → 완성</strong> 단계로 표시됩니다.
                            </p>
                        </div>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>3. 마감 기한 준수</h3>
                            <p className={styles.cardText}>
                                문서 제출 마감 기한이 설정된 경우, 기한 내에 내용을 작성하고 저장해야 합니다.<br />
                                마감 이후에는 수정이 불가능할 수 있으니 대시보드의 D-Day 배너를 꼭 확인하세요!
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
                                <summary className={styles.faqQuestion}>Q. 팀원을 추가할 수 있나요?</summary>
                                <div className={styles.faqAnswer}>
                                    A. 현재 별도의 팀원 초대 기능은 제공되지 않습니다.<br />
                                    운영진에게 문의해주시면 팀원을 추가해 드립니다.
                                </div>
                            </details>
                            <details className={styles.faqItem}>
                                <summary className={styles.faqQuestion}>Q. 다른 팀의 프로젝트를 볼 수 있나요?</summary>
                                <div className={styles.faqAnswer}>
                                    A. 네, 대시보드에서 다른 팀의 카드를 클릭하면 진행 상황과 내용을 열람할 수 있습니다.<br />
                                    서로의 아이디어를 보고 배우며 인사이트를 얻어보세요!
                                </div>
                            </details>
                        </div>
                    </section>

                    <QnABoard />
                </div>
            </main>
        </div>
    );
}
