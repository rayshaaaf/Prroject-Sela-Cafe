package com.selacafe.order_service.config;

import com.selacafe.order_service.entity.DiningTable;
import com.selacafe.order_service.repository.DiningTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final DiningTableRepository diningTableRepository;

    @Override
    public void run(String... args) throws Exception {
        seedTable("T01", 4, "T01");
        seedTable("T02", 2, "T02");
        seedTable("T04", 4, "T04");
        seedTable("T12", 2, "T12");
        seedTable("T22", 6, "T22");
    }

    private void seedTable(String number, int capacity, String qr) {
        Optional<DiningTable> opt = diningTableRepository.findByTableNumber(number);
        if (opt.isEmpty()) {
            diningTableRepository.save(DiningTable.builder()
                    .tableNumber(number)
                    .capacity(capacity)
                    .qrCode(qr)
                    .status("AVAILABLE")
                    .build());
        } else {
            DiningTable table = opt.get();
            table.setQrCode(qr);
            table.setCapacity(capacity);
            diningTableRepository.save(table);
        }
    }
}
