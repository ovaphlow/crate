# data structure

## migrate

## feedback

```sql
insert into ovaphlow.miscellaneous (ref_id, ref2_id, record_at, tag, detail)
select user_id, 0, datime
    , json_array(category, user_category)
    , json_object("status", status, "content", content, "ref_uuid", user_uuid, "origin_id", id)
from billboard.feedback;
```

## favorite

```sql
insert into ovaphlow.miscellaneous (ref_id, ref2_id, record_at, tag, detail)
select id, user_id, data_id, datime
    , json_array(category1, category2)
    , json_object("ref_uuid", user_uuid, "ref_uuid2", data_uuid, "origin_id", id)
from billboard.favorite;
```

## journal

```sql
insert into ovaphlow.miscellaneous (ref_id, ref2_id, record_at, tag, detail)
select user_id, 0, datime
    , json_array("操作记录", category, "登录")
    , json_object("ip", ip, "location", address, "origin_id", id)
from billboard.login_journal;
```

```sql
insert into ovaphlow.miscellaneous (ref_id, ref2_id, record_at, tag, detail)
select common_user_id, data_id, datime
    , json_array("操作记录", '个人用户', concat('浏览', category))
    , json_object("ref_uuid", common_user_uuid, "ref2_uuid", data_uuid, "origin_id", id)
from billboard.browse_journal;
```

```sql
insert into ovaphlow.miscellaneous (ref_id, ref2_id, record_at, tag, detail)
select user_id, data_id, datime
    , json_array("操作记录", category1, concat("编辑", category2))
    , json_object("remark", remark, "origin_id", id, "ref_uuid", user_uuid, "ref2_uuid", data_uuid)
from billboard.edit_journal;
```
