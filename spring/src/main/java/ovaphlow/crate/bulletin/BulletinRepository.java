package ovaphlow.crate.bulletin;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Table("bulletin")
class Bulletin {
    @Id
    private String id;
    private String title;
    private LocalDateTime publishTime;
    private LocalDateTime expireAt;
    private String tag;
    private String detail;
}

@Repository
interface BulletinRepository extends CrudRepository<Bulletin, String> {
    @Query("""
            select cast(id as char) id, title, publish_time, expire_at, tag, detail
            from bulletin
            order by publish_time desc
            limit :skip, :take
            """)
    List<Bulletin> filter(int take, long skip);
}
