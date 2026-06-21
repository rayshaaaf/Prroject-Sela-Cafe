package com.selacafe.order_service.service.impl;

import com.selacafe.order_service.entity.DiningTable;
import com.selacafe.order_service.exception.ResourceNotFoundException;
import com.selacafe.order_service.payload.req.DiningTableReq;
import com.selacafe.order_service.payload.res.DiningTableRes;
import com.selacafe.order_service.repository.DiningTableRepository;
import com.selacafe.order_service.service.DiningTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DiningTableServiceImpl implements DiningTableService {

    private final DiningTableRepository diningTableRepository;

    @Override
    public DiningTableRes create(DiningTableReq request) {

        DiningTable table = DiningTable.builder()
                .tableNumber(request.getTableNumber())
                .capacity(request.getCapacity())
                .qrCode(request.getQrCode())
                .status("AVAILABLE")
                .build();

        table = diningTableRepository.save(table);

        return mapToResponse(table);
    }

    @Override
    public DiningTableRes update(
            Long id,
            DiningTableReq request) {

        DiningTable table = diningTableRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Table not found"));

        table.setTableNumber(request.getTableNumber());
        table.setCapacity(request.getCapacity());
        table.setQrCode(request.getQrCode());

        table = diningTableRepository.save(table);

        return mapToResponse(table);
    }

    @Override
    public void delete(Long id) {

        DiningTable table = diningTableRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Table not found"));

        diningTableRepository.delete(table);
    }

    @Override
    public DiningTableRes getById(Long id) {

        DiningTable table = diningTableRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Table not found"));

        return mapToResponse(table);
    }

    @Override
    public List<DiningTableRes> getAll() {

        return diningTableRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private DiningTableRes mapToResponse(
            DiningTable table) {

        return DiningTableRes.builder()
                .id(table.getId())
                .tableNumber(table.getTableNumber())
                .capacity(table.getCapacity())
                .qrCode(table.getQrCode())
                .status(table.getStatus())
                .build();
    }
}