package ovaphlow.crate.springkt.bulletin

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/spring-api")
class Controller(
    private val repository: Repository,
) {
    @RequestMapping(path = ["/bulletin/{uuid}/{id}"], method = [RequestMethod.GET])
    fun getWithParam(@PathVariable("uuid") uuid: String, @PathVariable("id") id: String): ResponseEntity<Bulletin> {
        val bulletin: Bulletin = Bulletin(id, "title", LocalDateTime.now(), LocalDateTime.now(), "[]", "{}")
        return ResponseEntity.status(200).body(bulletin)
    }

    @RequestMapping(path = ["/bulletin"], method = [RequestMethod.GET])
    fun get(
        @RequestParam(value = "take", defaultValue = "10") take: Int,
        @RequestParam(value = "skip", defaultValue = "0") skip: Long
    ): ResponseEntity<List<Bulletin>> {
//        return ResponseEntity.status(200).body(repository.filter(take, skip))
        return ResponseEntity.status(200).body(repository.filter(take, skip))
    }

    @RequestMapping(path = ["/bulletin"], method = [RequestMethod.POST])
    fun post(@RequestBody bulletin: Bulletin): ResponseEntity<String> {
        repository.save(bulletin)
        return ResponseEntity.status(200).body("OK")
    }
}
