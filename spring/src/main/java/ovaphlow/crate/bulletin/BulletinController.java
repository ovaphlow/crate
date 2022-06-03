package ovaphlow.crate.bulletin;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/crate-api")
public class BulletinController {

    private final BulletinRepository bulletinRepository;

    public BulletinController(BulletinRepository bulletinRepository) {
        this.bulletinRepository = bulletinRepository;
    }

    @GetMapping("/bulletin")
    public ResponseEntity<List<Bulletin>> get(
            @RequestParam(value = "option", defaultValue = "") String option,
            @RequestParam(value = "take", defaultValue = "10") int take,
            @RequestParam(value = "skip", defaultValue = "0") long skip
    ) {
        if ("".equals(option)) {
            return ResponseEntity.status(200).body(bulletinRepository.filter(take, skip));
        }
        return ResponseEntity.status(200).body(new ArrayList<>());
    }
}
