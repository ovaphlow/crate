import { pool } from "./mysql.mjs";

/*
CREATE TABLE `staging` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `publish_time` datetime NOT NULL,
  `ref_id` bigint NOT NULL COMMENT '用户id、',
  `name` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  `tag` json NOT NULL COMMENT '类别',
  `detail` json NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ref_id` (`ref_id`),
  KEY `idx_publish_time` (`publish_time`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='临时数据，验证码等';
*/

export const filterByRefIdTag = async ({ refId, tag }) => {
  const client = pool.promise();
  const q = `
  select *
  from staging
  where ref_id = ?
    and json_contains(tag, ?)
  order by id desc
  `;
  const param = [refId, tag];
  const [result] = await client.query(q, param);
  return result;
};

export const save = async ({ refId, name, tag, detail }) => {
  const client = pool.promise();
  const q = `
  insert into staging (
    publish_time, ref_id, name, tag, detail
  )
  values (?, ?, ?, ?, ?)
  `;
  const param = [new Date(), refId, name, tag, detail];
  const [result] = await client.query(q, param);
  return result;
};

export const update = async ({ refId, name, tag, detail, id }) => {
  const client = pool.promise();
  const q = `
  update staging
  set publish_time = ?
    , ref_id = ?
    , name = ?
    , tag = ?
    , detail = ?
  where id = ?
  `
  const param = [new Date(), refId, name, tag, detail, id];
  const [result] = await client.query(q, param);
  return result;
}