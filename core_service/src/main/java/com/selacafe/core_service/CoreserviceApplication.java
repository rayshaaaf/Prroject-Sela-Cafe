package com.selacafe.core_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CoreserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CoreserviceApplication.class, args);

	}

}
