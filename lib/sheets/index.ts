/**
 * lib/sheets — 통합 Google Sheets DB 레이어 공개 API
 *
 * 사용법:
 *   import { sheets } from '@/lib/sheets/schema';
 *   import { getRowBy, listRows, appendRow, updateRow } from '@/lib/sheets';
 */

// schema 상수 re-export
export { sheets, type SheetName, type ColumnOf } from './schema';

// DB CRUD + 편의 헬퍼 re-export
export {
    IS_DEV_MODE,
    getRowBy,
    listRows,
    appendRow,
    updateRow,
    deleteRow,
    getUserAuth,
    getUserProfile,
    getConfigValue,
    getActiveDeadlines,
    checkDeadlineLock,
    isProfileComplete,
    checkProfileComplete,
    upsertScore,
} from './client';
