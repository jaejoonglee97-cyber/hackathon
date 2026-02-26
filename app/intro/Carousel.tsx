'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './Carousel.module.css';

const images = [
    { src: '/intro/photo1.png', alt: '활동 사진 1' },
    { src: '/intro/photo2.png', alt: '활동 사진 2' },
    { src: '/intro/photo3.jpg', alt: '활동 사진 3' },
    { src: '/intro/photo4.jpg', alt: '활동 사진 4' },
    { src: '/intro/photo5.jpeg', alt: '활동 사진 5' },
    { src: '/intro/photo6.jpg', alt: '활동 사진 6' },
    { src: '/intro/photo7.jpg', alt: '활동 사진 7' },
    { src: '/intro/photo8.jpg', alt: '활동 사진 8' },
    { src: '/intro/photo9.jpg', alt: '활동 사진 9' },
    { src: '/intro/photo10.jpg', alt: '활동 사진 10' },
];

export default function Carousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, []);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    return (
        <div className={styles.carouselContainer}>
            <div className={styles.carouselInner} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {images.map((image, index) => (
                    <div key={index} className={styles.slide}>
                        <div className={styles.imagePlaceholder}>
                            <img src={image.src} alt={image.alt} className={styles.image} />
                        </div>
                    </div>
                ))}
            </div>

            <button className={styles.prevButton} onClick={prevSlide} aria-label="이전 슬라이드">
                &#10094;
            </button>
            <button className={styles.nextButton} onClick={nextSlide} aria-label="다음 슬라이드">
                &#10095;
            </button>

            <div className={styles.indicators}>
                {images.map((_, index) => (
                    <button
                        key={index}
                        className={`${styles.indicator} ${index === currentIndex ? styles.activeIndicator : ''}`}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`${index + 1}번 슬라이드로 이동`}
                    />
                ))}
            </div>
        </div>
    );
}
