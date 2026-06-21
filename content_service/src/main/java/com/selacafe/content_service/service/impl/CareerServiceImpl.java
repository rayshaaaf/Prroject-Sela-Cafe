package com.selacafe.content_service.service.impl;

import com.selacafe.content_service.entity.Career;
import com.selacafe.content_service.exception.ResourceNotFoundException;
import com.selacafe.content_service.payload.req.CareerReq;
import com.selacafe.content_service.payload.res.CareerRes;
import com.selacafe.content_service.repository.CareerRepository;
import com.selacafe.content_service.service.CareerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CareerServiceImpl implements CareerService {

    private final CareerRepository careerRepository;

    private CareerRes mapToResponse(Career career) {

        return CareerRes.builder()
                .id(career.getId())
                .positionId(career.getPositionId())
                .positionEn(career.getPositionEn())
                .descriptionId(career.getDescriptionId())
                .descriptionEn(career.getDescriptionEn())
                .requirementsId(career.getRequirementsId())
                .requirementsEn(career.getRequirementsEn())
                .isOpen(career.getIsOpen())
                .build();
    }

    @Override
    public CareerRes create(CareerReq request) {

        Career career = Career.builder()
                .positionId(request.getPositionId())
                .positionEn(request.getPositionEn())
                .descriptionId(request.getDescriptionId())
                .descriptionEn(request.getDescriptionEn())
                .requirementsId(request.getRequirementsId())
                .requirementsEn(request.getRequirementsEn())
                .isOpen(
                        request.getIsOpen() == null
                                ? true
                                : request.getIsOpen()
                )
                .build();

        Career savedCareer = careerRepository.save(career);

        return mapToResponse(savedCareer);
    }

    @Override
    public List<CareerRes> getAll() {

        return careerRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CareerRes> getOpenCareers() {

        return careerRepository.findByIsOpenTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public CareerRes getById(Long id) {

        Career career = careerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Career not found"
                        ));

        return mapToResponse(career);
    }

    @Override
    public CareerRes update(Long id, CareerReq request) {

        Career career = careerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Career not found"
                        ));

        career.setPositionId(request.getPositionId());
        career.setPositionEn(request.getPositionEn());
        career.setDescriptionId(request.getDescriptionId());
        career.setDescriptionEn(request.getDescriptionEn());
        career.setRequirementsId(request.getRequirementsId());
        career.setRequirementsEn(request.getRequirementsEn());
        career.setIsOpen(request.getIsOpen());

        Career updatedCareer = careerRepository.save(career);

        return mapToResponse(updatedCareer);
    }

    @Override
    public void delete(Long id) {

        Career career = careerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Career not found"
                        ));

        careerRepository.delete(career);
    }
}