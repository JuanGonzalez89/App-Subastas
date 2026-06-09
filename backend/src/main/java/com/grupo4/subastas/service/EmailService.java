package com.grupo4.subastas.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void enviarEmailConfirmacion(String destinatario, String nombre, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("juanignaciogonzalez.ca@gmail.com");
            message.setTo(destinatario);
            message.setSubject("Confirmá tu registro - Sistema de Subastas");
            message.setText(
                "Hola " + nombre + ",\n\n" +
                "Tu solicitud de registro fue aprobada.\n\n" +
                "Tu token de confirmación es:\n\n" +
                "  " + token + "\n\n" +
                "Ingresá a la app, andá a 'Completar registro' e ingresá este token " +
                "junto con tu nueva clave personal.\n\n" +
                "El token es válido por 48 horas.\n\n" +
                "Sistema de Subastas - Grupo 4"
            );
            mailSender.send(message);
            log.info("Email de confirmación enviado a {}", destinatario);
        } catch (Exception e) {
            // Si el email falla (ej: credenciales no configuradas en desarrollo),
            // solo se loguea el token para que el dev pueda usarlo manualmente.
            log.warn("No se pudo enviar email a {}. Token: {} | Error: {}", destinatario, token, e.getMessage());
        }
    }
}
