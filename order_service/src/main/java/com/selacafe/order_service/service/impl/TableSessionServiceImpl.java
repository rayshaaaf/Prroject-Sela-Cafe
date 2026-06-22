package com.selacafe.order_service.service.impl;

import com.selacafe.order_service.entity.DiningTable;
import com.selacafe.order_service.entity.TableSession;
import com.selacafe.order_service.exception.BadRequestException;
import com.selacafe.order_service.exception.ResourceNotFoundException;
import com.selacafe.order_service.payload.req.ScanTableReq;
import com.selacafe.order_service.payload.res.TableSessionRes;
import com.selacafe.order_service.repository.DiningTableRepository;
import com.selacafe.order_service.repository.TableSessionRepository;
import com.selacafe.order_service.service.TableSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TableSessionServiceImpl implements TableSessionService {

        private final DiningTableRepository diningTableRepository;
        private final TableSessionRepository tableSessionRepository;

        @Override
        public TableSessionRes scanTable(ScanTableReq request) {

                DiningTable table = diningTableRepository.findByQrCode(
                                request.getQrCode())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Table not found"));

                if ("OCCUPIED".equals(table.getStatus())) {
                        java.util.Optional<TableSession> activeSession = tableSessionRepository
                                        .findByDiningTableIdAndStatus(table.getId(), "ACTIVE");
                        if (activeSession.isPresent()) {
                                return mapToResponse(activeSession.get());
                        }
                }

                table.setStatus("OCCUPIED");

                diningTableRepository.save(table);

                TableSession session = TableSession.builder()
                                .diningTable(table)
                                .startedAt(LocalDateTime.now())
                                .status("ACTIVE")
                                .build();

                session = tableSessionRepository.save(session);

                return mapToResponse(session);
        }

        @Override
        public TableSessionRes closeSession(Long sessionId) {

                TableSession session = tableSessionRepository.findById(sessionId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Session not found"));

                session.setStatus("CLOSED");
                session.setEndedAt(LocalDateTime.now());

                tableSessionRepository.save(session);

                DiningTable table = session.getDiningTable();

                table.setStatus("AVAILABLE");

                diningTableRepository.save(table);

                return mapToResponse(session);
        }

        private TableSessionRes mapToResponse(
                        TableSession session) {

                return TableSessionRes.builder()
                                .id(session.getId())
                                .tableId(
                                                session.getDiningTable().getId())
                                .tableNumber(
                                                session.getDiningTable()
                                                                .getTableNumber())
                                .startedAt(session.getStartedAt())
                                .endedAt(session.getEndedAt())
                                .status(session.getStatus())
                                .build();
        }

        @Override
        public TableSessionRes closeSession(
                        Long sessionId,
                        String role) {

                if (!role.equals("CASHIER")
                                && !role.equals("ADMIN")
                                && !role.equals("OWNER")) {

                        throw new BadRequestException(
                                        "Only CASHIER can close session");
                }

                TableSession session = tableSessionRepository
                                .findById(sessionId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Session not found"));

                if (!"ACTIVE".equals(session.getStatus())) {

                        throw new BadRequestException(
                                        "Session already closed");
                }

                session.setStatus("CLOSED");
                session.setEndedAt(LocalDateTime.now());

                DiningTable table = session.getDiningTable();
                table.setStatus("AVAILABLE");

                tableSessionRepository.save(session);
                diningTableRepository.save(table);

                return mapToResponse(session);
        }

        @Override
        public List<TableSessionRes> getAll() {
                return tableSessionRepository.findAllByOrderByStartedAtDesc()
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public List<TableSessionRes> getAllActive() {
                return tableSessionRepository.findAllByStatusOrderByStartedAtDesc("ACTIVE")
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }
}