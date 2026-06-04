/**
 * 결과물 아카이브 타입 정의
 * PRD §4.1 대중(Public Viewer) 열람, §6.4 FR-30 제출물 공개
 */

export type Track = 'A' | 'B' | 'C';
export type Award = '대상' | '최우수' | '우수' | '장려' | null;

export interface AppEntry {
    id: string;          // URL slug (예: dawith-welfare-hub)
    name: string;        // 앱 이름
    orgName: string;     // 기관명
    track: Track;
    award: Award;
    // score는 PRD 원칙에 따라 프론트엔드에서 노출하지 않음
    score: number;
    description: string; // 앱 한 줄 소개
    problem: string;     // 해결하려는 문제
    solution: string;    // 솔루션 설명
    tags: string[];      // 태그 목록
    appUrl?: string;     // 앱 접속 링크
    videoUrl?: string;   // 시연 영상 링크
    slideUrl?: string;   // 발표자료 링크
    imageUrl?: string;   // 썸네일 이미지 URL
    isPublished: boolean;
    createdAt: string;
}

export interface Comment {
    id: string;
    appId: string;
    parentId?: string;
    authorName: string;
    authorRole: 'visitor' | 'manager' | 'admin';
    content: string;
    passwordHash: string;
    isDeleted: boolean;
    createdAt: string;
}

/** passwordHash를 제외한 공개용 댓글 타입 */
export type CommentPublic = Omit<Comment, 'passwordHash'>;

/** 수상 등급 정렬 순서 */
export const AWARD_ORDER: Record<string, number> = {
    '대상': 0,
    '최우수': 1,
    '우수': 2,
    '장려': 3,
};

/** 트랙 라벨 */
export const TRACK_LABELS: Record<Track, string> = {
    A: '트랙 A',
    B: '트랙 B',
    C: '트랙 C',
};

/** 수상 배지 스타일 */
export const AWARD_STYLES: Record<string, { bg: string; color: string }> = {
    '대상': { bg: '#FAEEDA', color: '#633806' },
    '최우수': { bg: '#D3D1C7', color: '#2C2C2A' },
    '우수': { bg: '#F5C4B3', color: '#4A1B0C' },
    '장려': { bg: '#F1EFE8', color: '#5F5E5A' },
};

/** 트랙별 색상 */
export const TRACK_COLORS: Record<Track, { bg: string; color: string; accent: string }> = {
    A: { bg: 'hsl(215, 70%, 95%)', color: 'hsl(215, 70%, 35%)', accent: 'hsl(215, 70%, 50%)' },
    B: { bg: 'hsl(150, 60%, 95%)', color: 'hsl(150, 60%, 30%)', accent: 'hsl(150, 60%, 45%)' },
    C: { bg: 'hsl(270, 55%, 95%)', color: 'hsl(270, 55%, 35%)', accent: 'hsl(270, 55%, 55%)' },
};
