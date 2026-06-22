package com.selacafe.order_service.config;

import com.selacafe.order_service.entity.DiningTable;
import com.selacafe.order_service.repository.DiningTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final DiningTableRepository diningTableRepository;

    @Override
    public void run(String... args) throws Exception {
        seedDiningTables();
    }

    private void seedDiningTables() {
        // Table number -> capacity
        String[][] tables = {
            {"T01", "4"},
            {"T02", "4"},
            {"T03", "6"},
            {"T04", "6"},
            {"T05", "2"},
            {"T06", "2"},
            {"T07", "8"},
            {"T08", "4"},
            {"T09", "4"},
            {"T10", "6"}
        };

        for (String[] tableData : tables) {
            String tableNumber = tableData[0];
            int capacity = Integer.parseInt(tableData[1]);

            // Only insert if not already present
            if (diningTableRepository.findByTableNumber(tableNumber).isEmpty()) {
                DiningTable table = DiningTable.builder()
                        .tableNumber(tableNumber)
                        .capacity(capacity)
                        .qrCode("QR-" + tableNumber)
                        .status("AVAILABLE")
                        .build();
                diningTableRepository.save(table);
                System.out.println("[DataInitializer] Seeded dining table: " + tableNumber);
            }
        }
    }
}
