package com.selacafe.content_service.service.impl;

import com.selacafe.content_service.entity.Location;
import com.selacafe.content_service.exception.ResourceNotFoundException;
import com.selacafe.content_service.payload.req.LocationReq;
import com.selacafe.content_service.payload.res.LocationRes;
import com.selacafe.content_service.repository.LocationRepository;
import com.selacafe.content_service.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationServiceImpl implements LocationService {

    private final LocationRepository locationRepository;

    private LocationRes mapToResponse(Location location) {

        return LocationRes.builder()
                .id(location.getId())
                .name(location.getName())
                .addressId(location.getAddressId())
                .addressEn(location.getAddressEn())
                .city(location.getCity())
                .mapsUrl(location.getMapsUrl())
                .phone(location.getPhone())
                .openHours(location.getOpenHours())
                .isOpen(location.getIsOpen())
                .imageUrl(location.getImageUrl())
                .build();
    }

    @Override
    public LocationRes create(LocationReq request) {

        Location location = Location.builder()
                .name(request.getName())
                .addressId(request.getAddressId())
                .addressEn(request.getAddressEn())
                .city(request.getCity())
                .mapsUrl(request.getMapsUrl())
                .phone(request.getPhone())
                .openHours(request.getOpenHours())
                .isOpen(
                        request.getIsOpen() == null
                                ? true
                                : request.getIsOpen()
                )
                .imageUrl(request.getImageUrl())
                .build();

        Location savedLocation = locationRepository.save(location);

        return mapToResponse(savedLocation);
    }

    @Override
    public List<LocationRes> getAll() {

        return locationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<LocationRes> getOpenLocations() {

        return locationRepository.findByIsOpenTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public LocationRes getById(Long id) {

        Location location = locationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Location not found"
                        ));

        return mapToResponse(location);
    }

    @Override
    public LocationRes update(Long id, LocationReq request) {

        Location location = locationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Location not found"
                        ));

        location.setName(request.getName());
        location.setAddressId(request.getAddressId());
        location.setAddressEn(request.getAddressEn());
        location.setCity(request.getCity());
        location.setMapsUrl(request.getMapsUrl());
        location.setPhone(request.getPhone());
        location.setOpenHours(request.getOpenHours());
        location.setIsOpen(request.getIsOpen());
        location.setImageUrl(request.getImageUrl());

        Location updatedLocation = locationRepository.save(location);

        return mapToResponse(updatedLocation);
    }

    @Override
    public void delete(Long id) {

        Location location = locationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Location not found"
                        ));

        locationRepository.delete(location);
    }
}