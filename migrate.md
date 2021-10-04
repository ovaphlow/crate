# Migrate

## Jounal

### login journal

```sql
insert
  into
  ovaphlow.logbook (ref_id
                    , ref_id2
                    , dtime
                    , detail
                    , origin_id)
select
  user_id
  , 0
  , datime
  , json_object("category", "登录"
                , "tag", category
                , "ip", ip
                , "location", address)
  , id
from
  billboard.login_journal
```

### browse journal

```sql
insert
  into
  ovaphlow.logbook (ref_id
                    , ref_id2
                    , dtime
                    , detail
                    , origin_id)
select
  common_user_id
  , data_id
  , datime
  , json_object("category", '浏览'
                , "tag", category
                , "ref_uuid", common_user_uuid
                , "ref_uuid2", data_uuid)
  , id
from
  billboard.browse_journal
```

### edit journal

```sql
insert
  into
  ovaphlow.logbook (ref_id
                    , ref_id2
                    , dtime
                    , detail
                    , origin_id)
select
  user_id
  , data_id
  , datime
  , json_object("category", concat("编辑", category2)
                , "tag", category1
                , "ref_uuid", user_uuid
                , "ref_uuid2", data_uuid
                , "remark", remark)
  , id
from
  billboard.edit_journal
```

## Favorite

```sql
insert
  into
  ovaphlow.favorite (ref_id
                     , ref_id2
                     , dtime
                     , detail
                     , origin_id)
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

## Feedback

```sql
insert
  into
  ovaphlow.feedback (ref_id
                     , dtime
                     , detail
                     , origin_id)
select
  user_id
  , datime
  , json_object("category", category
                , "tag", user_category
                , "ref_uuid", user_uuid
                , "conent", content)
  , id
from
  billboard.feedback
```

## Message

```sql
insert
  into
  ovaphlow.message (ref_id
                    , ref_id2
                    , dtime
                    , detail
                    , origin_id)
select
  0
  , user_id
  , datime
  , json_object("category", category
                , "tag", user_category
                , "title", title
                , "content", content
                , "status", status)
  , id
from
  billboard.sys_message
```
