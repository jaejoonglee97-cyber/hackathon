// 필터 및 정렬 컴포넌트
'use client';

import { useState } from 'react';
import styles from './DashboardFilters.module.css';

export type FilterState = {
    stage: string;
    field: string;
    hasHelp: boolean;
    sortBy: 'recent' | 'help' | 'response';
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
    { value: 'case', label: '사례관리' },
    { value: 'admin', label: '행정' },
    { value: 'pr', label: '홍보' },
    { value: 'resource', label: '자원연계' },
];

const SORT_OPTIONS = [
    { value: 'recent', label: '최근 업데이트' },
    { value: 'help', label: 'Help 많은 순' },
    { value: 'response', label: '응답 빠른 순' },
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

            <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={filters.hasHelp}
                        onChange={(e) => handleChange('hasHelp', e.target.checked)}
                    />
                    <span>Help 있는 팀만</span>
                </label>
            </div>
        </div>
    );
}
