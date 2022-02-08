import {MediaContext, MediaDetails, Session} from "../interfaces/externalService";
import {API} from "../config";

export const getSessionDetails = async (sessionId: string): Promise<Session> => {
    const sessionDetails = await API.get<Session>(`/sessions/${sessionId}`);
    return sessionDetails.data
}

export const getMediaDetails = async (sessionId: string): Promise<MediaDetails[]> => {
    const mediaDetails = await API.get<MediaDetails[]>(`/sessions/${sessionId}/media`);
    return mediaDetails.data;
}

export const getMediaContextDetails = async (sessionId: string): Promise<MediaContext[]> => {
    const mediaContext = await API.get<MediaContext[]>(`media-context/${sessionId}`);
    return mediaContext.data;
}