package com.grupo4.subastas.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void enviarEmailConfirmacion(String destinatario, String nombre, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
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
    }
}
