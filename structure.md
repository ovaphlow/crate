# data structure

## migrate

## journal

```sql
insert into ovaphlow.miscellaneous (ref_id, ref2_id, record_time, tag, detail)
select user_id, 0, datime, json_array("操作记录", "登录", category), json_object("ip", ip, "location", address, "origin_id", id)
from billboard.login_journal
```

```sql
insert into ovaphlow.miscellaneous (ref_id, ref2_id, record_time, tag, detail)
select common_user_id, data_id, datime
    , json_array("操作记录", concat('浏览', category), '个人用户')
    , json_object("origin_id", id)
from billboard.browse_journal
```

```sql
insert into ovaphlow.miscellaneous (ref_id, ref2_id, record_time, tag, detail) 
select user_id, data_id, datime
    , json_array("操作记录", concat("编辑", category2), category1,
    json_object("remark", remark, "origin_id", id)
from billboard.edit_journal
```

## favorite

```sql
insert into ovaphlow.miscellaneous (ref_id, ref2_id, record_time, tag, detail)
select
  user_id
  , data_id
  , datime
  , json_object("category", category2
                , "tag", category1
                , "ref_uuid", user_uuid
                , "ref_uuid2", data_uuid)
  , id
from
  billboard.favorite
```
