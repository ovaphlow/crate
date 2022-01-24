# data structure

## migrate

## feedback

```sql
insert into ovaphlow.miscellaneous (id, ref_id, ref2_id, record_at, tag, detail)
select id, user_id, 0, datime
    , json_array(category, user_category)
    , json_object("status", status, "content", content, "ref_uuid", user_uuid)
from billboard.feedback;
```

## favorite

```sql
insert into ovaphlow.miscellaneous (id, ref_id, ref2_id, record_at, tag, detail)
select id, user_id, data_id, datime
    , json_array(category2, category1)
    , json_object("ref_uuid", user_uuid, "ref_uuid2", data_uuid)
from billboard.favorite;
```

## journal

```sql
insert into ovaphlow.miscellaneous (id, ref_id, ref2_id, record_at, tag, detail)
select id, user_id, 0, datime
    , json_array("操作记录", "登录", category)
    , json_object("ip", ip, "location", address)
from billboard.login_journal;
```

```sql
insert into ovaphlow.miscellaneous (id, ref_id, ref2_id, record_at, tag, detail)
select id, common_user_id, data_id, datime
    , json_array("操作记录", concat('浏览', category), '个人用户')
    , '{}'
from billboard.browse_journal
```

```sql
insert into ovaphlow.miscellaneous (id, ref_id, ref2_id, record_at, tag, detail)
select id, user_id, data_id, datime
    , json_array("操作记录", concat("编辑", category2), category1,
    json_object("remark", remark)
from billboard.edit_journal
```
