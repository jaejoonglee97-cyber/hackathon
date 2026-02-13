'use client';

import { useState, useMemo } from 'react';
import TeamCard, { Team } from './TeamCard';
import DashboardFilters, { FilterState } from './DashboardFilters';
import styles from './TeamGrid.module.css';

type TeamGridProps = {
    teams: Team[];
};

export default function TeamGrid({ teams }: TeamGridProps) {
    const [filters, setFilters] = useState<FilterState>({
        stage: 'all',
        field: 'all', // field info is not yet in Team type, assume it might be added or handle gracefully
        participantType: 'all',
        hasHelp: false,
        sortBy: 'recent',
    });

    const filteredTeams = useMemo(() => {
        let result = [...teams];

        // 1. Stage Filter
        if (filters.stage !== 'all') {
            result = result.filter((t) => t.stage === filters.stage);
        }

        // 2. Field (Track) Filter
        if (filters.field !== 'all') {
            result = result.filter((t) => t.track === filters.field);
        }

        // 3. Participant Type Filter
        if (filters.participantType !== 'all') {
            result = result.filter((t) => t.participantType === filters.participantType);
        }

        // 3. Has Help Filter (Removed based on request, but keeping placeholder if needed or just remove)
        // if (filters.hasHelp) {
        //     result = result.filter((t) => t.helpCount > 0);
        // }

        // 4. Sort
        result.sort((a, b) => {
            if (filters.sortBy === 'recent') {
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            }
            if (filters.sortBy === 'created') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            if (filters.sortBy === 'name') {
                return a.name.localeCompare(b.name, 'ko');
            }
            return 0;
        });

        return result;
    }, [teams, filters]);

    return (
        <section className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>모든 프로젝트 ({filteredTeams.length})</h2>
                <DashboardFilters onFilterChange={setFilters} />
            </div>

            {filteredTeams.length > 0 ? (
                <div className={styles.grid}>
                    {filteredTeams.map((team) => (
                        <TeamCard key={team.id} team={team} />
                    ))}
                </div>
            ) : (
                <div className={styles.empty}>
                    <p>조건에 맞는 프로젝트가 없습니다.</p>
                </div>
            )}
        </section>
    );
}
