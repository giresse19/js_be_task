export interface Session {
    id: string;
    status: string;
}

export interface ContextMediaMap {
    'document-front': Array<MediaDetails>;
    'document-back': Array<MediaDetails>;
}

export interface SessionResponse extends Session {
    media: ContextMediaMap;
}

export interface MediaDetails {
    id: string;
    mimeType: string;
    context: string;
}

export interface MediaContext {
    id: string;
    mediaId: string;
    context: string;
    probability: number;
}

export interface Error {
    status: number;
    message: string;
}

export interface ProbabilityContext {
    context: string;
    probability: number;
}






