import FlakeId from "flake-idgen";
import { DATACENTER_ID, WORKER_ID, EPOCH } from "../configuration.mjs";
import {
  miscellaneousRepositoryFilter,
  miscellaneousRepositoryFilterByIdRefIdRef1Id,
  miscellaneousRepositoryFilterByTag,
  miscellaneousRepositorySave,
} from "./miscellaneous-repository.mjs";

export const miscellaneousEndpointGet = async (ctx) => {
  const { id, refId, ref1Id } = ctx.params;
  if (
    parseInt(id, 10) > 0 &&
    parseInt(refId, 10) >= 0 &&
    parseInt(ref1Id, 10) >= 0
  ) {
    const result = await miscellaneousRepositoryFilterByIdRefIdRef1Id({
      id,
      refId,
      ref1Id,
    });
    if (result.length > 0) {
      const [row] = result;
      ctx.response.body = row;
    } else ctx.response.body = { id: 0 };
  } else {
    const { option } = ctx.request.query;
    if (option === "") {
      const result = await miscellaneousRepositoryFilter();
      ctx.response.body = result;
    }
    if (option === "filterBy-tag") {
      const { tag, take, skip } = ctx.request.query;
      const result = await miscellaneousRepositoryFilterByTag(
        { tag },
        take || "10",
        skip || "0"
      );
      ctx.response.body = result;
    }
  }
};

export const miscellaneousEndpointPost = async (ctx) => {
  const flakeIdGen = new FlakeId({
    datacenter: DATACENTER_ID,
    worker: WORKER_ID,
    epoch: EPOCH,
  });
  const fid = flakeIdGen.next();
  const { refId, ref1Id, tag, detail } = ctx.request.body;
  console.log(refId, ref1Id, tag, detail);
  const result = await miscellaneousRepositorySave({
    id: fid.readBigInt64BE(0),
    refId,
    ref1Id,
    publishTime: new Date(),
    tag,
    detail
  });
  if (result.affectedRows) ctx.response.status = 201;
  else ctx.response.status = 400;
};
