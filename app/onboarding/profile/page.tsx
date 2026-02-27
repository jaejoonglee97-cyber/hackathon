/* 온보딩: 프로필 완료 페이지 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './profile.module.css';

export default function OnboardingProfilePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        org: '',
        participantType: '',
        birthdate: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // 기존 프로필 불러오기 (수정 모드 지원)
    useEffect(() => {
        fetch('/api/auth/me').then(res => {
            if (res.ok) return res.json();
            throw new Error('Unauthorized');
        }).then(user => {
            if (user?.profile) {
                setFormData(prev => ({
                    ...prev,
                    name: user.profile.name || '',
                    phone: user.profile.phone || '',
                    org: user.profile.org || '',
                    participantType: user.profile.participant_type || '', // 기존 값 로드
                    birthdate: user.profile.birthdate || '',
                }));
            }
        }).catch(() => {
            // 로그인 안했거나 프로필 없음 -> 무시
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // 생년월일 형식 검증 (YYYY-MM-DD)
        if (formData.birthdate && !/^\d{4}-\d{2}-\d{2}$/.test(formData.birthdate)) {
            setError('생년월일 형식이 올바르지 않습니다. (예: 1990-01-15)');
            return;
        }

        if (!formData.participantType) {
            setError('참여 유형을 선택해주세요.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/onboarding/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '프로필 저장에 실패했습니다.');
            }

            // 대시보드로 이동 (프로젝트는 대시보드에서 생성)
            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.stepBadge}>프로필 완료</div>
                    <h1 className={styles.title}>참가자 정보 입력</h1>
                    <p className={styles.subtitle}>
                        해커톤 참여를 위해 기본 정보를 입력해주세요.
                        <br />
                        완료 후 대시보드에서 프로젝트를 등록할 수 있습니다.
                    </p>

                    {/* 개인정보 보호 안내 (FR-40) */}
                    <div className={styles.privacyNotice}>
                        ⚠️ 수집된 개인정보는 해커톤 운영 목적으로만 사용되며, 종료 후 파기됩니다.
                        <br />
                        실명·연락처·주소·사례 식별정보 등은 시스템에 최소한만 저장됩니다.
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && <div className={styles.error}>{error}</div>}

                        <div className={styles.formGroup}>
                            <label htmlFor="onboarding-name" className={styles.label}>
                                이름 <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                id="onboarding-name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={styles.input}
                                required
                                placeholder="홍길동"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="onboarding-phone" className={styles.label}>
                                휴대폰 <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="tel"
                                id="onboarding-phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={styles.input}
                                required
                                placeholder="010-1234-5678"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="onboarding-org" className={styles.label}>
                                소속 기관 <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                id="onboarding-org"
                                name="org"
                                value={formData.org}
                                onChange={handleChange}
                                className={styles.input}
                                required
                                placeholder="예: 서울시복지재단"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                참여 유형 <span className={styles.required}>*</span>
                            </label>
                            <div className={styles.radioGroup}>
                                <label className={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="participantType"
                                        value="participating_org"
                                        checked={formData.participantType === 'participating_org'}
                                        onChange={handleChange}
                                        className={styles.radioInput}
                                        required
                                    />
                                    열매똑똑 참여기관 부문 (1·2차년도)
                                </label>
                                <label className={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="participantType"
                                        value="seoul_social_worker"
                                        checked={formData.participantType === 'seoul_social_worker'}
                                        onChange={handleChange}
                                        className={styles.radioInput}
                                        required
                                    />
                                    서울시 사회복지사 부문
                                </label>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="onboarding-birthdate" className={styles.label}>
                                생년월일 <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="date"
                                id="onboarding-birthdate"
                                name="birthdate"
                                value={formData.birthdate}
                                onChange={handleChange}
                                className={styles.input}
                                required
                            />
                        </div>



                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? '저장 중...' : '프로필 저장 및 시작하기'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
