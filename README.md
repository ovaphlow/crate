# CRATE

## Bulletin

| COLUMN | TYPE | DESCRIPTION | DEFAULT |
| - | - | - | - |
| id  | bigint | pk | |
| title  | varchar | index | |
| published_at | datetime | index | now() |
| expired_at | datetime | index | |
| tag | json | | [] |
| detail | json | | {} |

## Journal

favorite, journal, message

| COLUMN | TYPE | DESCRIPTION | DEFAULT |
| - | - | - | - |
| id | bigint | pk | |
| ref_id | bigint | index | 0 |
| ref1_id | bigint | index | 0 |
| tag | json | | [] |
| detail | json | | {} |
| created_at | datetime | index | now() |

## Setting

| COLUMN | TYPE | DESCRIPTION | DEFAULT |
| - | - | - | - |
| id | bigint | pk | |
| ref_id | bigint | index | 0 |
| ref1_id | bigint | index | 0 |
| tag | json | | [] |
| detail | json | | {} |

## Staging

| COLUMN | TYPE | DESCRIPTION | DEFAULT |
| - | - | - | - |
| id | bigint | pk | |
| ref_id | bigint | index | 0 |
| title | varchar | index | |
| tag | json | | [] |
| detail | json | | {} |
