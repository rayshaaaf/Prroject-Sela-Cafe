package com.selacafe.content_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "address_id")
    private String addressId;

    @Column(name = "address_en")
    private String addressEn;

    @Column(name = "city")
    private String city;

    @Column(name = "maps_url")
    private String mapsUrl;

    @Column(name = "phone")
    private String phone;

    @Column(name = "open_hours")
    private String openHours;

    @Builder.Default
    @Column(name = "is_open")
    private Boolean isOpen = true;

    @Column(name = "image_url")
    private String imageUrl;
}