package com.grupo4.subastas.config;

import com.grupo4.subastas.util.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(new CorsConfig().corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Admin endpoints → solo ADMIN
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/auth/**").permitAll()
                // Pujas y conexión a subasta → siempre requieren autenticación
                .requestMatchers("/subastas/*/conectar").authenticated()
                .requestMatchers("/subastas/*/pujas").authenticated()
                // Resto de subastas/items/fotos → público (lectura)
                .requestMatchers(HttpMethod.GET, "/subastas/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/items/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/fotos/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
