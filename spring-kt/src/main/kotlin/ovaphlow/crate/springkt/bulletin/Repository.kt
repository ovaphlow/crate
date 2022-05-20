package ovaphlow.crate.springkt.bulletin

import org.springframework.data.annotation.Id
import org.springframework.data.jdbc.repository.query.Query
import org.springframework.data.relational.core.mapping.Table
import org.springframework.data.repository.CrudRepository
import java.util.Date

@Table("bulletin")
data class Bulletin(
    @Id val id: Long,
    val publishTime: String,
    val title: String,
    val tag: String,
    val detail: String
)

interface Repository: CrudRepository<Bulletin, String> {
    @Query("select * from bulletin limit 10 offset 0")
    fun filter(): List<Bulletin>
}
