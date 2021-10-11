# Migrate

## Jounal

### login journal 登录日志

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

### browse journal 浏览日志

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
  , json_object("category", concat('浏览', category)
                , "tag", '个人用户'
                , "ref_uuid", common_user_uuid
                , "ref_uuid2", data_uuid)
  , id
from
  billboard.browse_journal
```

### edit journal 编辑日志

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

## Favorite 收藏

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

## Feedback 投诉与意见反馈

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

## Message 消息

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

````sql
insert
  into
  ovaphlow.message (ref_id
                    , ref_id2
                    , dtime
                    , detail
                    , origin_id)
select case when category = 'common_to_ent' then common_user_id
            when category = 'ent_to_common' then ent_user_id
            else 0
            end ref_id
  , case when category = 'common_to_ent' then ent_user_id
         when category = 'ent_to_common' then common_user_id
         else 0
         end ref_id2
  , datime
  , json_object('category', '咨询企业'
                , 'tag', case when category = 'common_to_ent' then '个人用户'
                              when category = 'ent_to_common' then '企业用户'
                              else ''
                              end
                , 'content', content
                , 'status', status) detail
  , id
from billboard.message

```

## 平台用户

```sql
insert
  into
  ovaphlow.subscriber (username
                       , detail
                       , origin_id)
select
  username
  , json_object("uuid", uuid
                "tag", "平台"
                , "name", name
                , "password", password)
  , id
from
  billboard.mis_user
````

## setting 基础数据

```sql
insert into ovaphlow.setting (category
                              , ref_id
                              , ref_id2
                              , detail)
select category
  , master_id
  , 0
  , json_object('uuid', `uuid`
                , 'name', name
                , 'remark', comment)
from billboard.common_data
```
