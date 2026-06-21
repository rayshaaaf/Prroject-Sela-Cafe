package com.selacafe.core_service.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.selacafe.core_service.entity.Role;
import com.selacafe.core_service.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {


private final RoleRepository roleRepository;

@Override
public void run(String... args) {

    if (roleRepository.count() == 0) {

        roleRepository.save(
            Role.builder()
                .name("ADMIN")
                .description("Administrator akses penuh")
                .build()
        );

        roleRepository.save(
            Role.builder()
                .name("OWNER")
                .description("Pemilik Cafe")
                .build()
        );

        roleRepository.save(
            Role.builder()
                .name("CUSTOMER")
                .description("Pelanggan aplikasi")
                .build()
        );

        roleRepository.save(
            Role.builder()
                .name("CASHIER")
                .description("Kasir kelola order dan meja")
                .build()
        );

        roleRepository.save(
            Role.builder()
                .name("KITCHEN")
                .description("Dapur update status masak")
                .build()
        );

        roleRepository.save(
            Role.builder()
                .name("COURIER")
                .description("Kurir update status pengiriman")
                .build()
        );
    }
}


}
