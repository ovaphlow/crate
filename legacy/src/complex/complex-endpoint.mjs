import { bulletinRepositoryFilter } from "../bulletin/bulletin-repository.mjs";
import {
    filterByDetailRefId2DtimeRange,
    journalRepositoryFilterByDetailDtimeRangeRefId2s,
} from "../journal/journal-repository.mjs";

export const complexEndpointBulletinJournal = async (ctx) => {
    const { option } = ctx.request.query;
    if (option === "statsBulletin") {
        const { bulletinId, refId2s } = ctx.request.query;
        if (!bulletinId > 0) {
            ctx.response.stauts = 400;
            return;
        }
        const bulletinList = await bulletinRepositoryFilter("filterBy-id", {
            id: bulletinId,
        });
        if (bulletinList.length != 1) {
            ctx.response.status = 404;
            return;
        }
        const result = await filterByDetailRefId2DtimeRange({
            detail: JSON.stringify({ category: "浏览招聘会" }),
            dtimeEnd: bulletinList[0].expire_at,
            dtimeBegin: bulletinList[0].publish_time,
            refId2: bulletinId,
        });
        const result1 = await filterByDetailRefId2DtimeRange({
            detail: JSON.stringify({ category: "参加招聘会并浏览企业详情" }),
            dtimeEnd: bulletinList[0].expire_at,
            dtimeBegin: bulletinList[0].publish_time,
            refId2: bulletinId,
        });
        const a = [];
        result.forEach((v, i) => {
            if (a.indexOf(v.ref_id) === -1) {
                a.push(v.ref_id);
            }
        });
        const result2 = await journalRepositoryFilterByDetailDtimeRangeRefId2s({
            detail: JSON.stringify({ category: "参加招聘会并投递简历" }),
            dtimeEnd: bulletinList[0].expire_at,
            dtimeBegin: bulletinList[0].publish_time,
            refId2s,
        });
        ctx.response.body = {
            qty: result.length + result1.length,
            qty1: a.length,
            qty2: result2.length,
        };
    } else ctx.response.status = 200;
};
