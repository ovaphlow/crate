package ovaphlow.crate.springkt.bulletin

import org.springframework.data.annotation.Id
import org.springframework.data.jdbc.repository.query.Query
import org.springframework.data.relational.core.mapping.Table
import org.springframework.data.repository.CrudRepository
import java.time.LocalDateTime

@Table("bulletin")
data class Bulletin(
    @Id val id: String,
    val title: String,
    val publishTime: LocalDateTime,
    val expireAt: LocalDateTime,
    val tag: String,
    val detail: String
)

interface Repository : CrudRepository<Bulletin, String> {
    @Query(
        """
        select cast(id as char) id, title, publish_time, expire_at, tag, detail from bulletin
        order by publish_time desc
        limit :skip, :take
        """
    )
    fun filter(take: Int, skip: Long): List<Bulletin>
}
