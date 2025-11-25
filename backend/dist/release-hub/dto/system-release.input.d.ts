import { ReleaseType, ReleaseStatus } from '@prisma/client';
export declare class CreateSystemReleaseInput {
    version: string;
    versionNumber?: string;
    releaseType: ReleaseType;
    title: string;
    description?: string;
    summary?: string;
    features?: string[];
    improvements?: string[];
    bugfixes?: string[];
    breakingChanges?: string[];
    releaseNotes?: string;
    upgradeGuide?: string;
    deprecations?: string[];
    deploymentDate?: Date;
    releaseDate?: Date;
    thumbnailUrl?: string;
    videoUrl?: string;
    screenshotUrls?: string[];
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
}
export declare class UpdateSystemReleaseInput {
    version?: string;
    versionNumber?: string;
    releaseType?: ReleaseType;
    status?: ReleaseStatus;
    title?: string;
    description?: string;
    summary?: string;
    features?: string[];
    improvements?: string[];
    bugfixes?: string[];
    breakingChanges?: string[];
    releaseNotes?: string;
    upgradeGuide?: string;
    deprecations?: string[];
    deploymentDate?: Date;
    releaseDate?: Date;
    thumbnailUrl?: string;
    videoUrl?: string;
    screenshotUrls?: string[];
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
}
export declare class SystemReleaseWhereInput {
    status?: ReleaseStatus;
    releaseType?: ReleaseType;
    search?: string;
}
