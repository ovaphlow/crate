package ovaphlow.crate.springkt.bulletin

@org.springframework.stereotype.Service
class Service(val db: Repository) {
    fun filter(): List<Bulletin> = db.filter()

    fun save(bulletin: Bulletin) {
        db.save(bulletin)
    }
}
