import axios from "axios";

const baseUrl = `http://localhost:3000/api`;
const sessionId = `90d61876-b99a-443e-994c-ba882c8558b6`;

export const getRespondsData = async () => {
    try {
        const respond = await axios.get(`${baseUrl}/sessions/${sessionId}/media-context`);
        return respond.data;
    } catch (err: any) {
        return err.response.data
    }
}
