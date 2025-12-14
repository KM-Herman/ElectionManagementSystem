import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5020/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface UserDto {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface PositionDto {
    id: number;
    title: string;
    description: string;
}

export interface CandidateDto {
    id: number;
    name: string;
    manifesto: string;
    voteCount: number;
}

export interface AuditLog {
    id: number;
    action: string;
    details: string;
    timestamp: string;
    performedBy: string;
}

export interface DashboardData {
    positions: PositionDto[];
    candidatesByPosition: Record<number, CandidateDto[]>;
    userVotedPositionIds: number[];
}
export interface PendingCandidate {
    id: number;
    name: string;
    position: string;
    manifesto: string;
    degree: string;
    nationalId: string;
    hasBeenInJail: boolean;
    maritalStatus: string;
    userId: number;
}

export interface Notification {
    id: number;
    userId: number;
    message: string;
    isRead: boolean;
    dateSent: string;
    user?: UserDto;
}

export interface CandidateApplicationRequest {
    positionId: number;
    manifesto: string;
    degree: string;
    hasBeenInJail: boolean;
    maritalStatus: string;
    nationalId: string;
}

export interface UpdateProfileRequest {
    name: string;
    profileDetails: string;
}

export interface UpdateManifestoRequest {
    manifesto: string;
}

export default api;