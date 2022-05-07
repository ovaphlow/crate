import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../utility/mysql";

export const filter = async (take: string, skip: string) => {
  const client = pool.promise();
  const sql = `
  select cast(id as char) id, title, publish_time, expire_at, tag, detail
  from bulletin
  order by publish_time desc, expire_at desc
  limit ${skip}, ${take}
  `;
  const [result] = await client.execute(sql, []);
  return result;
};

export const filterByIdUuid = async (id: string, uuid: string) => {
  const client = pool.promise();
  const sql = `
  select cast(id as char) id, title, publish_time, expire_at, tag, detail
  from bulletin
  where id = ? and json_contains(detail, ?)
  `;
  const param = [id, uuid];
  const [result]: [RowDataPacket[], FieldPacket[]] = await client.execute(sql, param);
  return result;
};

export const filterByTag = async (tag: string, take: string, skip: string) => {
  const client = pool.promise();
  const sql = `
  select cast(id as char) id, title, publish_time, expire_at, tag, detail
  from bulletin
  where json_contains(tag, ?)
  order by publish_time desc
  limit ${skip}, ${take}
  `;
  const param = [tag];
  const [result] = await client.execute(sql, param);
  return result;
};

export const remove = async (id: string) => {
  const client = pool.promise();
  const sql = "delete from bulletin where id = ?";
  const param = [id];
  const [result]: [ResultSetHeader, FieldPacket[]] = await client.execute(sql, param);
  return result;
};

export const save = async (
  id: string,
  title: string,
  publishTime: string,
  expireAt: string,
  tag: string,
  detail: string
) => {
  const client = pool.promise();
  const sql = `
  insert into bulletin (
      id, title, publish_time, expire_at, tag, detail
  ) values (?, ?, ?, ?, ?, ?)
  `;
  const param = [id, title, publishTime, expireAt, tag || "{}", detail || "{}"];
  const [result]: [ResultSetHeader, FieldPacket[]] = await client.execute(
    sql,
    param
  );
  return result;
};

export const update = async (
  id: string,
  title: string,
  publishTime: string,
  expireAt: string,
  tag: string,
  detail: string,
) => {
  const client = pool.promise();
  const sql = `
  update bulletin
  set title = ?, publish_time = ?, expire_at = ?, tag = ?, detail = ?
  where id = ?
  `;
  const param = [title, publishTime, expireAt, tag, detail, id];
  const [result]: [ResultSetHeader, FieldPacket[]] = await client.execute(
    sql,
    param
  );
  return result;
}
