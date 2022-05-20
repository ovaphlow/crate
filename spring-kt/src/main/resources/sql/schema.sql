CREATE TABLE IF NOT EXISTS bulletin (
    id bigint PRIMARY KEY,
    publish_time varchar not null,
    title varchar not null,
    tag varchar not null,
    detail varchar not null
);
