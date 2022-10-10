import { pool } from "../mysql.mjs";

const columns = ["id", "title", "published_at", "expired_at", "tag", "detail"];

export const filter = async (option, data) => {
  const client = pool.promise();
  if (option === "filterBy-id") {
    const q = `
        select ${columns.join(", ")}, cast(id as char) _id
        from crate.bulletin
        where id = ?
            and json_contains(detail, json_object("uuid", ?))
        `;
    const [result] = await client.query(q, [data["id"], data["uuid"]]);
    return result;
  }
  if (option === "filterBy-publishedAtRange-detail") {
    const q = `
        select ${columns.join(", ")}, cast(id as char) _id
        from crate.bulletin
        where published_at >= ?
            and published_at <= ?
            and json_contains(detail, ?)
        order by published_at desc
        limit ?, ?
        `;
    const [result] = await client.query(q, [
      data["time"],
      data["time1"],
      data["detail"],
      data["skip"],
      data["take"],
    ]);
    return result;
  }
};

export const save = async (data) => {
  const client = pool.promise();
  const q = `
    insert into crate.bulletin (
        ${columns.join(", ")}
    ) values (
        ?, ?, now(), ?, ?, ?
    )
    `;
  const [result] = await client.execute(q, [
    data["id"],
    data["title"],
    data["expiredAt"],
    data["tag"],
    data["detail"],
  ]);
  return result;
};
