import { Course } from '../../courses/entities/course.entity';
import { User } from '../../../graphql/models/user.model';
export declare class Certificate {
    id: string;
    enrollmentId: string;
    userId: string;
    courseId: string;
    certificateNumber: string;
    courseName: string;
    instructorName: string;
    completionDate: Date;
    grade?: string;
    verificationUrl?: string;
    issueDate: Date;
    createdAt: Date;
    updatedAt: Date;
    user?: User;
    course?: Course;
}
export declare class CertificateVerification {
    valid: boolean;
    certificate: Certificate;
}
export declare class CertificateStats {
    total: number;
    thisMonth: number;
    thisYear: number;
}
