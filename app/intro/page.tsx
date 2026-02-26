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
                    <p className={styles.subtitle}>더 많이 만나기 위해, 더 스마트하게 일합니다.</p>
                </div>
                {/* 캐러셀을 헤더 하단에 통합 */}
                <div className={styles.heroCarouselWrapper}>
                    <Carousel />
                </div>
            </header>

            <main className={styles.main}>
                <div className="container">

                    {/* 사업 소개 */}
                    <ScrollReveal delay={50}>
                        <section className={styles.section}>
                            <div className={styles.simpleIntroCard}>
                                <h2 className={styles.simpleTitle}>사업 소개</h2>
                                <p className={styles.introLead}>
                                    <span className={styles.phrase}><strong>열매똑똑 Smart Work</strong>는</span><br />
                                    <span className={styles.phrase}>사회복지사가 다시 사람에게 집중할 수 있도록,</span><br />
                                    <span className={styles.phrase}><strong>일하는 방식의 변화</strong>를 함께 만들어가는 사업입니다.</span>
                                </p>
                                <div className={styles.introDivider} />
                                <p className={styles.cardText}>
                                    <span className={styles.phrase}>기술은 도구입니다.</span><br />
                                    <span className={styles.phrase}>반복되는 행정 업무는 도구에게 맡기고,</span><br />
                                    <span className={styles.phrase}>가벼워진 몸과 마음으로 우리를 기다리는</span>{' '}
                                    <span className={styles.phrase}>사람들에게 돌아가는 것 —</span><br />
                                    <span className={styles.phrase}>그것이 <strong>열매똑똑</strong>이 지향하는 방향입니다.</span>
                                </p>
                                <div className={styles.cardCta}>
                                    <span className={styles.phrase}>처음엔 막막해 보여도 괜찮습니다.</span><br />
                                    <span className={styles.phrase}><strong>열매똑똑이 함께하면, 달라집니다.</strong></span>
                                </div>
                            </div>
                        </section>
                    </ScrollReveal>

                    {/* 왜 디지털 전환이 필요한가? 설득 섹션 */}
                    <ScrollReveal delay={100}>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>왜 지금, 디지털 전환인가?</h2>
                            <div className={styles.whyGrid}>
                                <div className={styles.whyCard}>
                                    <div className={styles.whyQuote}>
                                        &ldquo;오늘도 서류를 작성하다 보니,<br />
                                        정작 어르신을 만날 시간이 없었습니다.&rdquo;
                                    </div>
                                    <p className={styles.whyText}>
                                        많은 사회복지사가 하루의 상당한 시간을
                                        기록·취합·보고 등 반복 행정에 사용합니다.
                                        그 시간만큼 <strong>현장에서 사람과 만나는 시간은 줄어듭니다.</strong>
                                    </p>
                                </div>
                                <div className={styles.whyCard}>
                                    <div className={styles.whyQuote}>
                                        &ldquo;도구가 아니라,<br />
                                        사람에 집중하고 싶습니다.&rdquo;
                                    </div>
                                    <p className={styles.whyText}>
                                        디지털 전환은 사회복지사를 기계로 대체하는 것이 아닙니다.
                                        <strong>사람만이 할 수 있는 일에 더 많은 시간과 에너지를 쏟을 수 있도록</strong>,
                                        반복적인 일은 기술이 대신 처리합니다.
                                    </p>
                                </div>
                                <div className={styles.whyCard}>
                                    <div className={styles.whyQuote}>
                                        &ldquo;변화는 거창하지 않아도 됩니다.<br />
                                        일하는 방식 하나를 바꾸는 것으로 시작합니다.&rdquo;
                                    </div>
                                    <p className={styles.whyText}>
                                        열매똑똑 Smart work는 참여 기관과 함께
                                        <strong>현장에 맞는 현실적인 변화</strong>를 찾아갑니다.
                                        거창한 시스템이 아닌, 지금 당장 쓸 수 있는 변화입니다.
                                    </p>
                                </div>
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
