package com.grupo4.subastas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SubastasApplication {
    public static void main(String[] args) {
        SpringApplication.run(SubastasApplication.class, args);
    }
}
