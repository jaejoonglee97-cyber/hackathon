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
        hasHelp: false,
        sortBy: 'recent',
    });

    const filteredTeams = useMemo(() => {
        let result = [...teams];

        // 1. Stage Filter
        if (filters.stage !== 'all') {
            result = result.filter((t) => t.stage === filters.stage);
        }

        // 2. Field Filter
        // currently Team type doesn't have 'field' (org is agency name). 
        // If 'field' isn't available, we skip or use org? 
        // PRD mentions 'category/field'. Let's assume for MVP we skip or check if org matches?
        // Actually PRD FR-01 says "Filter: Stage, Field(Case/Admin/PR/Resource...)".
        // Schema 'teams' table doesn't have 'field' column explicitly listed in the 'def' I saw earlier? 
        // Let's check schema again. 'teams' has [id, name, org, member_ids, stage, created_at, updated_at].
        // So 'field' is missing from schema. I will ignore 'field' filter for now or treat 'org' as field? 
        // No, Organization is the Agency Name.
        // I will skipping field filter logic for now as data is missing.

        // 3. Has Help Filter
        if (filters.hasHelp) {
            result = result.filter((t) => t.helpCount > 0);
        }

        // 4. Sort
        result.sort((a, b) => {
            if (filters.sortBy === 'recent') {
                return new Date(b.recentUpdate || b.updatedAt).getTime() - new Date(a.recentUpdate || a.updatedAt).getTime();
            }
            if (filters.sortBy === 'help') {
                return b.helpCount - a.helpCount;
            }
            if (filters.sortBy === 'response') {
                // response time is not in Team type yet.
                return 0;
            }
            return 0;
        });

        return result;
    }, [teams, filters]);

    return (
        <section className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>모든 팀 ({filteredTeams.length})</h2>
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
                    <p>조건에 맞는 팀이 없습니다.</p>
                </div>
            )}
        </section>
    );
}
