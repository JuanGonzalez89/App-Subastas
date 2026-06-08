package com.grupo4.subastas.service;

import com.grupo4.subastas.dto.request.LoginRequest;
import com.grupo4.subastas.dto.request.RegistroStep1Request;
import com.grupo4.subastas.dto.request.RegistroStep2Request;
import com.grupo4.subastas.dto.response.AuthResponse;
import com.grupo4.subastas.dto.response.UsuarioResponse;
import com.grupo4.subastas.exception.CustomException;
import com.grupo4.subastas.model.entity.Cliente;
import com.grupo4.subastas.model.entity.Persona;
import com.grupo4.subastas.model.entity.PreRegistracion;
import com.grupo4.subastas.model.entity.TokenConfirmacion;
import com.grupo4.subastas.repository.ClienteRepository;
import com.grupo4.subastas.repository.PersonaRepository;
import com.grupo4.subastas.repository.PreRegistracionRepository;
import com.grupo4.subastas.repository.TokenConfirmacionRepository;
import com.grupo4.subastas.util.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PersonaRepository personaRepository;
    private final ClienteRepository clienteRepository;
    private final PreRegistracionRepository preRegistracionRepository;
    private final TokenConfirmacionRepository tokenConfirmacionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    // ID del empleado SISTEMA creado en el seed (primera persona insertada = ID 1)
    private static final Integer SISTEMA_EMPLEADO_ID = 1;

    public void registroPaso1(RegistroStep1Request request) {
        if (preRegistracionRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("Ya existe una solicitud con ese email", HttpStatus.CONFLICT);
        }
        if (personaRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("El email ya está registrado", HttpStatus.CONFLICT);
        }

        PreRegistracion preRegistracion = PreRegistracion.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .email(request.getEmail())
                .numeroDocumento(request.getNumeroDocumento())
                .documentoFrente(request.getDocumentoFrente())
                .documentoDorso(request.getDocumentoDorso())
                .domicilio(request.getDomicilio())
                .numeroPais(request.getNumeroPais())
                .estado("pendiente")
                .build();

        preRegistracionRepository.save(preRegistracion);
    }

    @Transactional
    public void aprobarRegistro(Integer preRegistracionId, String categoria) {
        PreRegistracion pre = preRegistracionRepository.findById(preRegistracionId)
                .orElseThrow(() -> new CustomException("Pre-registro no encontrado", HttpStatus.NOT_FOUND));

        if (!pre.getEstado().equals("pendiente")) {
            throw new CustomException("Esta solicitud ya fue procesada", HttpStatus.BAD_REQUEST);
        }

        Persona persona = Persona.builder()
                .nombre(pre.getNombre())
                .apellido(pre.getApellido())
                .email(pre.getEmail())
                .documento(pre.getNumeroDocumento())
                .direccion(pre.getDomicilio())
                .estado("activo")
                .rol("USER")
                .build();
        persona = personaRepository.save(persona);

        Cliente cliente = new Cliente();
        cliente.setPersona(persona);
        cliente.setNumeroPais(pre.getNumeroPais());
        cliente.setAdmitido("si");
        cliente.setCategoria(categoria);
        cliente.setVerificador(SISTEMA_EMPLEADO_ID);
        clienteRepository.save(cliente);

        String token = UUID.randomUUID().toString();
        TokenConfirmacion tokenConf = TokenConfirmacion.builder()
                .clienteId(persona.getIdentificador())
                .token(token)
                .fechaExpiracion(LocalDateTime.now().plusHours(48))
                .usado("no")
                .build();
        tokenConfirmacionRepository.save(tokenConf);

        pre.setEstado("aprobado");
        preRegistracionRepository.save(pre);

        emailService.enviarEmailConfirmacion(pre.getEmail(), pre.getNombre(), token);
    }

    @Transactional
    public void registroPaso2(RegistroStep2Request request) {
        TokenConfirmacion tokenConf = tokenConfirmacionRepository.findByToken(request.getToken())
                .orElseThrow(() -> new CustomException("Token inválido", HttpStatus.BAD_REQUEST));

        if (tokenConf.getUsado().equals("si")) {
            throw new CustomException("El token ya fue utilizado", HttpStatus.BAD_REQUEST);
        }
        if (tokenConf.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new CustomException("El token ha expirado", HttpStatus.BAD_REQUEST);
        }

        Cliente cliente = clienteRepository.findById(tokenConf.getClienteId())
                .orElseThrow(() -> new CustomException("Usuario no encontrado", HttpStatus.NOT_FOUND));

        cliente.setClavePersonal(passwordEncoder.encode(request.getClavePersonal()));
        clienteRepository.save(cliente);

        tokenConf.setUsado("si");
        tokenConfirmacionRepository.save(tokenConf);
    }

    public AuthResponse login(LoginRequest request) {
        Cliente cliente = clienteRepository.findByPersonaEmail(request.getEmail())
                .orElseThrow(() -> new CustomException("Email o clave incorrectos", HttpStatus.UNAUTHORIZED));

        if (cliente.getClavePersonal() == null) {
            throw new CustomException("Debés completar el registro primero", HttpStatus.UNAUTHORIZED);
        }
        if (!passwordEncoder.matches(request.getClavePersonal(), cliente.getClavePersonal())) {
            throw new CustomException("Email o clave incorrectos", HttpStatus.UNAUTHORIZED);
        }

        Persona persona = cliente.getPersona();
        String rol = persona.getRol() != null ? persona.getRol() : "USER";
        String token = jwtUtil.generateToken(persona.getEmail(), persona.getIdentificador(), rol);

        UsuarioResponse usuarioResponse = UsuarioResponse.builder()
                .id(persona.getIdentificador())
                .nombre(persona.getNombre())
                .apellido(persona.getApellido())
                .email(persona.getEmail())
                .categoria(cliente.getCategoria())
                .admitido(cliente.getAdmitido())
                .rol(rol)
                .build();

        return AuthResponse.builder()
                .token(token)
                .tipo("Bearer")
                .usuario(usuarioResponse)
                .build();
    }
}
