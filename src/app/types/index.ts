export interface DegreeMetadata {
    studentName: string;
    university: string;
    dateOfBirth: number;
    graduationDate: number;
    grade: string;
    score: number;
    image: string;
    attributes: {
        trait_type: string;
        value: string | number;
    }[];
}

export interface FormData {
    studentName: string;
    university: string;
    dateOfBirth: string;
    graduationDate: string;
    grade: string;
    score: string;
}

export enum DegreeStatus {
    Pending,
    Approved,
    Rejected
}

export interface Degree {
    studentName: string;
    university: string;
    dateOfBirth: number;
    graduationDate: number;
    grade: string;
    score: number;
    ipfsHash: string;
    status: DegreeStatus;
    issuer: string;
    timestamp: number;
}