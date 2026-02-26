import styles from './intro.module.css';
import ScrollReveal from '@/app/components/ScrollReveal';
import Carousel from './Carousel';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '열매똑똑 스마트워크란? | 열매똑똑 해커톤',
    description: '서울시 사회복지기관의 디지털 전환을 지원하는 열매똑똑 스마트워크 사업을 소개합니다.',
};

export default function IntroPage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className="container">
                    <a href="/" className={styles.backLink}>← 대시보드로 돌아가기</a>
                    <h1 className={styles.title}>열매똑똑 스마트워크란?</h1>
                    <p className={styles.subtitle}>디지털 기술로 사회복지 현장의 내일을 만듭니다.</p>
                </div>
            </header>

            <main className={styles.main}>
                <div className="container">

                    {/* 사업 소개 섹션 */}
                    <ScrollReveal>
                        <section className={styles.section}>
                            <div className={styles.introCard}>
                                <p className={styles.introLead}>
                                    서울시 사회복지기관·단체의 업무효율을 높이기 위한 디지털 역량강화 사업 <strong>「열매똑똑 Smart work」</strong>는<br />
                                    서울 사회복지공동모금회의 지원으로, 서울시사회복지사협회가 수행하는 3개년 사업입니다.
                                </p>
                                <div className={styles.carouselWrapper}>
                                    <Carousel />
                                </div>
                            </div>
                        </section>
                    </ScrollReveal>

                    {/* 핵심 목표 섹션 */}
                    <ScrollReveal delay={100}>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>🎯 왜 디지털 전환인가?</h2>
                            <div className={styles.grid}>
                                <div className={styles.card}>
                                    <div className={styles.icon}>✨</div>
                                    <h3 className={styles.cardTitle}>오직 사람에게 집중하기 위해</h3>
                                    <p className={styles.cardText}>
                                        우리가 디지털 전환, 업무 효율화를 이야기하는 이유는 &lsquo;멋진 도구&rsquo;가 아니라,
                                        불필요한 행정 시간을 줄여 <strong>사회복지사들이 현장에 더 집중할 수 있는 기반</strong>을 만들기 위해서입니다.
                                    </p>
                                </div>
                                <div className={styles.card}>
                                    <div className={styles.icon}>🚀</div>
                                    <h3 className={styles.cardTitle}>현장으로 가는 시간</h3>
                                    <p className={styles.cardText}>
                                        결국 목표는 서류와 취합에 빼앗긴 시간을 되찾아
                                        <strong>이용자·주민을 더 자주, 더 깊이 만나는 현장</strong>으로 가는 것입니다.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </ScrollReveal>

                    {/* 사업 수행 방식 섹션 */}
                    <ScrollReveal delay={200}>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>🛠️ 이렇게 일합니다</h2>
                            <div className={styles.methodology}>
                                <div className={styles.methodStep}>
                                    <div className={styles.stepNumber}>1</div>
                                    <h4>현황 분석</h4>
                                    <p>각 기관의 업무 현황을<br />먼저 정밀하게 분석합니다.</p>
                                </div>
                                <div className={styles.stepArrow}>→</div>
                                <div className={styles.methodStep}>
                                    <div className={styles.stepNumber}>2</div>
                                    <h4>스마트워크 도입</h4>
                                    <p>기관 상황에 맞는<br />일하는 방식을 정리하여 도입합니다.</p>
                                </div>
                                <div className={styles.stepArrow}>→</div>
                                <div className={styles.methodStep}>
                                    <div className={styles.stepNumber}>3</div>
                                    <h4>체질 개선</h4>
                                    <p>조직의 &lsquo;일하는 방식&rsquo;을<br />근본적으로 개선합니다.</p>
                                </div>
                            </div>
                            <div className={styles.experienceCard} style={{ marginTop: '3rem' }}>
                                <p className={styles.cardText}>
                                    참여기관들은 실제로 <strong>협업 방식, 업무환경·시스템, 업무효율화·자동화</strong> 같은 개선 과제를 도출해 실행해 왔습니다.
                                </p>
                            </div>
                        </section>
                    </ScrollReveal>

                    {/* 자료 공유 섹션 */}
                    <ScrollReveal delay={300}>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>📚 성과 공유</h2>
                            <div className={styles.pdfCard}>
                                <div className={styles.pdfInfo}>
                                    <span className={styles.pdfBadge}>1차년도 성과사례집</span>
                                    <h3 className={styles.pdfTitle}>&ldquo;디지털 전환, 우리도 할 수 있어.&rdquo;</h3>
                                    <p className={styles.pdfDescription}>사회복지 현장의 생생한 디지털 전환 이야기와 변화의 기록을 확인해 보세요.</p>
                                </div>
                                <a href="/files/digital_transformation_case_study.pdf" className={styles.downloadButton} download>
                                    <span className={styles.downloadIcon}>📥</span>
                                    PDF 다운로드
                                </a>
                            </div>
                        </section>
                    </ScrollReveal>

                </div>
            </main>
        </div>
    );
}
