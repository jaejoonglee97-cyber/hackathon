import styles from './intro.module.css';
import ScrollReveal from '@/app/components/ScrollReveal';
import Carousel from './Carousel';
import PosterCarousel from './PosterCarousel';
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

                    {/* 사진 캐러셀 (작게) */}
                    <ScrollReveal>
                        <section className={styles.sectionCenter}>
                            <div className={styles.smallCarouselWrapper}>
                                <Carousel />
                            </div>
                        </section>
                    </ScrollReveal>

                    {/* 사업 소개 (담백하게) */}
                    <ScrollReveal delay={50}>
                        <section className={styles.section}>
                            <div className={styles.simpleIntroCard}>
                                <h2 className={styles.simpleTitle}>사업 소개</h2>
                                <p className={styles.introLead}>
                                    <strong>「열매똑똑 Smart work」</strong>는 서울 사회복지공동모금회의 지원으로 서울시사회복지사협회가 수행하는 3개년 디지털 역량강화 사업입니다.
                                </p>
                                <p className={styles.cardText}>
                                    우리는 불필요한 행정 시간을 줄여 사회복지사가 현장에 더 집중할 수 있는 기반을 만듭니다.
                                    멋진 도구를 넘어, 일하는 방식을 개선하여 주민을 더 깊게 만나는 현장을 지향합니다.
                                </p>
                            </div>
                        </section>
                    </ScrollReveal>

                    {/* 포스터 발자취 */}
                    <ScrollReveal delay={100}>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>🖼️ 활동 기록</h2>
                            <PosterCarousel />
                        </section>
                    </ScrollReveal>

                    {/* PDF 다운로드 섹션 */}
                    <ScrollReveal delay={200}>
                        <section className={styles.section}>
                            <div className={styles.pdfCard}>
                                <div className={styles.pdfInfo}>
                                    <span className={styles.pdfBadge}>성과사례집</span>
                                    <h3 className={styles.pdfTitle}>&ldquo;디지털 전환, 우리도 할 수 있어.&rdquo;</h3>
                                    <p className={styles.pdfDescription}>사회복지 현장의 생생한 디지털 전환 기록을 확인해 보세요.</p>
                                </div>
                                <a href="/files/똑똑Smart work 1차년도 성과사례집_디지털전환, 우리도 할 수 있어(E-book).pdf" className={styles.downloadButton} download>
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
