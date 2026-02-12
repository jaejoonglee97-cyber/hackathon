// 필터 및 정렬 컴포넌트
'use client';

import { useState } from 'react';
import styles from './DashboardFilters.module.css';

export type FilterState = {
    stage: string;
    field: string;
    hasHelp: boolean;
    sortBy: 'recent' | 'name' | 'created';
};

type DashboardFiltersProps = {
    onFilterChange: (filters: FilterState) => void;
};

const STAGE_OPTIONS = [
    { value: 'all', label: '전체 스테이지' },
    { value: 'intro', label: '도입' },
    { value: 'validate', label: '검증' },
    { value: 'complete', label: '완성' },
];

const FIELD_OPTIONS = [
    { value: 'all', label: '전체 분야' },
    { value: '현장 업무경감 자동화', label: '현장 업무경감 자동화' },
    { value: '이용자 지원 및 접근성 개선', label: '이용자 지원 및 접근성 개선' },
    { value: '협업·지식관리·성과지표', label: '협업·지식관리·성과지표' },
];

const SORT_OPTIONS = [
    { value: 'recent', label: '최근 업데이트 순' },
    { value: 'created', label: '등록일 순' },
    { value: 'name', label: '가나다 순' },
];

export default function DashboardFilters({ onFilterChange }: DashboardFiltersProps) {
    const [filters, setFilters] = useState<FilterState>({
        stage: 'all',
        field: 'all',
        hasHelp: false,
        sortBy: 'recent',
    });

    const handleChange = (key: keyof FilterState, value: string | boolean) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className={styles.filters}>
            <div className={styles.filterGroup}>
                <label htmlFor="stage-filter" className={styles.label}>
                    스테이지
                </label>
                <select
                    id="stage-filter"
                    className={styles.select}
                    value={filters.stage}
                    onChange={(e) => handleChange('stage', e.target.value)}
                >
                    {STAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.filterGroup}>
                <label htmlFor="field-filter" className={styles.label}>
                    분야
                </label>
                <select
                    id="field-filter"
                    className={styles.select}
                    value={filters.field}
                    onChange={(e) => handleChange('field', e.target.value)}
                >
                    {FIELD_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.filterGroup}>
                <label htmlFor="sort-by" className={styles.label}>
                    정렬
                </label>
                <select
                    id="sort-by"
                    className={styles.select}
                    value={filters.sortBy}
                    onChange={(e) => handleChange('sortBy', e.target.value as FilterState['sortBy'])}
                >
                    {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
