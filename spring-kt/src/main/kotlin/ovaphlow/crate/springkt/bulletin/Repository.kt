package ovaphlow.crate.springkt.bulletin

import org.springframework.data.annotation.Id
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

data class Bulletin(
    @Id val id: String,
    val title: String,
    val publishTime: LocalDateTime,
    val expireAt: LocalDateTime,
    val tag: String,
    val detail: String
)

@Repository
class Repository(
    private val jdbcTemplate: JdbcTemplate
) {
    fun filter(take: Int, skip: Long): List<Bulletin> {
        val q = """
            select cast(id as char) id, title, publish_time, expire_at, tag, detail
            from bulletin
            order by publish_time desc
            limit ?, ?
        """.trimIndent()
        val result = jdbcTemplate.query(q, arrayOf(skip, take)) { rs, _ ->
            Bulletin(
                rs.getString("id"),
                rs.getString("title"),
                rs.getTimestamp("publish_time").toLocalDateTime(),
                rs.getTimestamp("expire_at").toLocalDateTime(),
                rs.getString("tag"),
                rs.getString("detail")
            )
        }
        return result
    }

    fun filterByIdDetail(id: String, detail: String): Bulletin {
        val q = """
            select cast(id as char) id, title, publish_time, expire_at, tag, detail
            from bulletin
            where id = ? and json_contains(detail, ?)
        """.trimIndent()
        val result = jdbcTemplate.queryForObject(q, arrayOf(id, detail)) { rs, _ ->
            Bulletin(
                rs.getString("id"),
                rs.getString("title"),
                rs.getTimestamp("publish_time").toLocalDateTime(),
                rs.getTimestamp("expire_at").toLocalDateTime(),
                rs.getString("tag"),
                rs.getString("detail")
            )
        }
        return result!!
    }

    fun save(data: Bulletin) {
        val q = """
            insert into bulletin (
                id, title, publish_time, expire_at, tag, detail
            ) values (?, ?, ?, ?, ?, ?)
        """.trimIndent()
        jdbcTemplate.update(q, data.id, data.title, data.publishTime, data.expireAt, data.tag, data.detail)
    }
}
