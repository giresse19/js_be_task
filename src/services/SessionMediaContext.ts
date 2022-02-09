import {
    ContextMediaMap,
    MediaContext,
    MediaDetails,
    ProbabilityContext,
    SessionResponse
} from "../interfaces/externalService";
import {getMediaContextDetails, getMediaDetails, getSessionDetails} from "./apiRequestService";
import * as express from "express";
import {noResource} from "../middlewares/apiResponse";
import {PROBABILITY_EQUILIBRIUM} from "../config";

export default class SessionMediaContext {
    private readonly sessionId: string;
    private readonly callback: Function;
    private readonly res: express.Response;

    constructor(res: express.Response, sessionId: string, callback: Function) {
        this.sessionId = sessionId;
        this.callback = callback
        this.res = res
    }

    /**
     * @returns Proper API response which contains response code and response data objects respectively.
     * If error, handles error appropriately as well.
     */
    public async sessionMediaContext() {

        try {
            const {id} = await getSessionDetails(this.sessionId);
            const mediaDetails = await getMediaDetails(id);
            const mediaContextResponse = await getMediaContextDetails(id);

            const mediaContextDetails = await SessionMediaContext.filterOutIrrelevantMediaAndAlignResponses(mediaContextResponse);

            const mediaIdMap = await this.mapMediaIdWithContextAndProbability(mediaContextDetails);

            const media = await SessionMediaContext.groupMediaByContextType(mediaDetails, mediaIdMap);

            media['document-front'].sort((documentA, documentB) =>
                mediaIdMap.get(documentB.id)!.probability - mediaIdMap.get(documentA.id)!.probability );

            media['document-back'].sort((documentA, documentB) =>
                mediaIdMap.get(documentB.id)!.probability - mediaIdMap.get(documentA.id)!.probability );

            let status = 'uploaded';

            let data: SessionResponse = {id, status, media};

            return this.callback(this.res, null, data);
        } catch (err: any) {
            console.error('Server error', err);
            this.callback(this.res, {
                status: err.response.statusCode,
                message: err.response.data
            }, noResource())
        }
    }

    /**
     * @Desc: To to group each media with respective context.
     * @param mediaDetailArr : Array - a response array from calling session media end-point.
     * @param mediaIdMap : Map - a map containing mediaIds(as key) mapped with context and probability as values.
     * @returns contextMediaMap, mediaDetails: object with context mapped to media.
     */
    private static async groupMediaByContextType(mediaDetailArr: MediaDetails[], mediaIdMap: Map<string, ProbabilityContext>) {
        const contextMediaMap: ContextMediaMap = {'document-front': [], 'document-back': []};

        for (let mediaDetail of mediaDetailArr) {
            let mediaContextId = mediaIdMap.get(mediaDetail.id);

            if (!mediaIdMap.has(mediaDetail.id)) continue;
            if (!mediaContextId) continue;

            if (mediaDetail.context === mediaContextId.context) {
                contextMediaMap[mediaDetail.context].push(mediaDetail);
            } else {
                if (mediaContextId.probability > PROBABILITY_EQUILIBRIUM) {
                    mediaDetail.context = mediaContextId.context;
                    contextMediaMap[mediaContextId.context].push(mediaDetail);
                } else {
                    contextMediaMap[mediaDetail.context].push(mediaDetail);
                }
            }
        }

        return contextMediaMap;
    }

    /**
     * @Desc: To map each mediaId with it's corresponding context and probability.
     * @param mediaContextArr : Array - a response array from calling media context end-point.
     * @returns mediaIdMap : a Map containing mediaIds(as key) with value context and probability.
     */
    private async mapMediaIdWithContextAndProbability(mediaContextArr: MediaContext[]) {
        const mediaIdMap: Map<string, ProbabilityContext> = new Map();

        mediaContextArr.forEach(mediaContextElement => {
            mediaIdMap.set(mediaContextElement.mediaId, {
                context: mediaContextElement.context,
                probability: mediaContextElement.probability
            })
        });

        return mediaIdMap;
    }

    /**
     * @Desc: To filter out irrelevant media and align the context property of media context end-point response
     * to that of session media end-point responses.
     * @param mediaContextArr : Array - a response array from calling media context end-point.
     * @returns filtered array with context set to document-front and document-back.
     */
    private static async filterOutIrrelevantMediaAndAlignResponses(mediaContextArr: MediaContext[]) {

        return mediaContextArr
            .filter(mediaContextElement => mediaContextElement.context !== 'none')
            .map((filteredMediaContextElement) => {

                if (filteredMediaContextElement.context === 'front') {
                    filteredMediaContextElement.context = 'document-front'
                }
                if (filteredMediaContextElement.context === 'back') {
                    filteredMediaContextElement.context = 'document-back'
                }

                return filteredMediaContextElement;
            });
    }

}
