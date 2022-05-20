package ovaphlow.crate.springkt.bulletin

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
@RequestMapping("/spring-api")
class Controller(
    private val service: Service
) {
    @RequestMapping(path = ["/bulletin/{uuid}/{id}"], method = [RequestMethod.GET])
    fun getByParam(@PathVariable("uuid") uuid: String, @PathVariable("id") id: Long): ResponseEntity<Bulletin> {
        val bulletin: Bulletin = Bulletin(id, "2022-05-19T12:34:56", "title", "[]", "{}")
        return ResponseEntity.status(200).body(bulletin)
    }

    @RequestMapping(path = ["/bulletin"], method = [RequestMethod.GET])
    fun get(): ResponseEntity<List<Bulletin>> {
        return ResponseEntity.status(200).body(service.filter());
    }

    @RequestMapping(path = ["/bulletin"], method = [RequestMethod.POST])
    fun post(@RequestBody bulletin: Bulletin): ResponseEntity<String> {
        service.save(bulletin)
        return ResponseEntity.status(200).body("OK")
    }
}
