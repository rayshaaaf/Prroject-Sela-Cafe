package com.selacafe.order_service.controller;

import com.selacafe.order_service.payload.req.DiningTableReq;
import com.selacafe.order_service.payload.res.ApiRes;
import com.selacafe.order_service.payload.res.DiningTableRes;
import com.selacafe.order_service.service.DiningTableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class DiningTableController {

    private final DiningTableService diningTableService;

    @PostMapping("/create")
    public ResponseEntity<ApiRes<DiningTableRes>> create(
            @Valid @RequestBody DiningTableReq request) {

        return ResponseEntity.ok(
                ApiRes.<DiningTableRes>builder()
                        .success(true)
                        .message("Table created")
                        .data(diningTableService.create(request))
                        .build()
        );
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiRes<DiningTableRes>> update(
            @PathVariable Long id,
            @Valid @RequestBody DiningTableReq request) {

        return ResponseEntity.ok(
                ApiRes.<DiningTableRes>builder()
                        .success(true)
                        .message("Table updated")
                        .data(diningTableService.update(id, request))
                        .build()
        );
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiRes<String>> delete(
            @PathVariable Long id) {

        diningTableService.delete(id);

        return ResponseEntity.ok(
                ApiRes.<String>builder()
                        .success(true)
                        .message("Table deleted")
                        .data(null)
                        .build()
        );
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<ApiRes<DiningTableRes>> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiRes.<DiningTableRes>builder()
                        .success(true)
                        .message("Success")
                        .data(diningTableService.getById(id))
                        .build()
        );
    }

    @GetMapping("/get")
    public ResponseEntity<ApiRes<List<DiningTableRes>>> getAll() {

        return ResponseEntity.ok(
                ApiRes.<List<DiningTableRes>>builder()
                        .success(true)
                        .message("Success")
                        .data(diningTableService.getAll())
                        .build()
        );
    }
}