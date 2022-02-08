import {
    ContextMediaMap,
    MediaContext,
    MediaDetails,
    SessionResponse
} from "../interfaces/externalService";
import {getMediaContextDetails, getMediaDetails, getSessionDetails} from "./apiRequestService";
import express from "express";
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
     * @returns Proper API response which contains response code and response data objects respectively:
     */
    public async sessionMediaContext() {

        try {
            let {id, status} = await getSessionDetails(this.sessionId);

            if (status === 'internal_manual_review') {
                const mediaDetails = await getMediaDetails(id);
                const mediaContextResponse = await getMediaContextDetails(id);

                const mediaContextDetails = await SessionMediaContext
                    .alignResponsesOfContextPropForMediaContextAndSessionMediaEndPoints(mediaContextResponse);

                const mediaIdMap = await this.mapMediaIdWithContextAndProbability(mediaContextDetails);

                const media = await SessionMediaContext.groupMediaByContextType(mediaDetails, mediaIdMap);

                media['document-front'].sort((documentA, documentB) =>
                    mediaIdMap[documentA.id].probability > mediaIdMap[documentB.id].probability ? -1 : 1);

                media['document-back'].sort((documentA, documentB) =>
                    mediaIdMap[documentA.id].probability > mediaIdMap[documentB.id].probability ? -1 : 1);

                status = 'uploaded'
                let data: SessionResponse = {id, status, media};

                return this.callback(this.res, null, data);
            }
        } catch (err: any) {
            console.error("API error: ", err);
            this.callback(this.res, {
                status: 500,
                message: 'Server Error'
            }, noResource())
        }
    }

    /**
     * @Desc: To to group each media with respective context.
     * @param mediaDetailArr : Array - a response array from calling session media end-point.
     * @param mediaIdMap : Object - an object containing mediaIds(as key) mapped with context and probability as values.
     * @returns contextMediaMap, mediaDetails: object with context mapped to media.
     */
    private static async groupMediaByContextType(mediaDetailArr: MediaDetails[], mediaIdMap: object) {
        const mediaDetails = [...mediaDetailArr];
        const contextMediaMap: ContextMediaMap = {'document-front': [], 'document-back': []};

        for (let mediaDetail of mediaDetails) {

            if (mediaDetail.id in mediaIdMap) {
                if (mediaDetail.context === mediaIdMap[mediaDetail.id].context) {
                    contextMediaMap[mediaDetail.context].push(mediaDetail)
                } else {
                    if (mediaIdMap[mediaDetail.id].probability > PROBABILITY_EQUILIBRIUM) {
                        mediaDetail.context = mediaIdMap[mediaDetail.id].context
                        contextMediaMap[mediaIdMap[mediaDetail.id].context].push(mediaDetail)
                    } else {
                        contextMediaMap[mediaDetail.context].push(mediaDetail)
                    }
                }
            }
        }
        return contextMediaMap;
    }

    /**
     * @Desc: To map each mediaId with it's corresponding context and probability.
     * @param mediaContextArr : Array - a response array from calling media context end-point.
     * @returns mediaIdMap : an object containing mediaIds(as key) mapped with context and probability as values.
     */
    private async mapMediaIdWithContextAndProbability(mediaContextArr: MediaContext[]) {
        const mediaContext: MediaContext[] = [...mediaContextArr];
        const mediaIdMap: Object = {};

        mediaContext.forEach(mediaContextElement => {
            mediaIdMap[mediaContextElement.mediaId] = {
                context: mediaContextElement.context,
                probability: mediaContextElement.probability
            }
        });

        return mediaIdMap;
    }

    /**
     * @Desc: To align the context property of media context end-point response
     * to that of session media end-point response.
     * @param mediaContextArr : Array - a response array from calling media context end-point.
     * @returns filtered array with context set to document-front and document-back.
     */
    private static async alignResponsesOfContextPropForMediaContextAndSessionMediaEndPoints(mediaContextArr: MediaContext[]) {
        const newMediaContextArr: MediaContext[] = [...mediaContextArr];
        const filterMediaContextArr: MediaContext[] = await SessionMediaContext.removeIrrelevantMedia(newMediaContextArr);

        filterMediaContextArr
            .forEach((filteredMediaContextElement) => {
                if (filteredMediaContextElement.context === 'front') filteredMediaContextElement.context = 'document-front'
                if (filteredMediaContextElement.context === 'back') filteredMediaContextElement.context = 'document-back'
            })
        return filterMediaContextArr;
    }

    /**
     * @param mediaContextArr : Array - a response array from calling media context end-point.
     * @returns filtered array containing relevant media.
     */
    private static async removeIrrelevantMedia(mediaContextArr: MediaContext[]) {
        const newMediaContextArr = [...mediaContextArr];
        return newMediaContextArr.filter((mediaContextElement) => mediaContextElement.context !== 'none')
    }

}
