import { ChangelogType } from '@prisma/client';
export declare class Changelog {
    id: string;
    title: string;
    description: string;
    type: ChangelogType;
    component?: string;
    module?: string;
    prUrl?: string;
    issueUrl?: string;
    commitHash?: string;
    affectedFiles: string[];
    apiChanges?: any;
    impact?: string;
    migration?: string;
    releaseId?: string;
    createdAt: Date;
    updatedAt: Date;
    authorId?: string;
}
