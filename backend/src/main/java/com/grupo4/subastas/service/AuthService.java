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
import com.grupo4.subastas.model.entity.Usuario;
import com.grupo4.subastas.repository.ClienteRepository;
import com.grupo4.subastas.repository.PaisRepository;
import com.grupo4.subastas.repository.PersonaRepository;
import com.grupo4.subastas.repository.PreRegistracionRepository;
import com.grupo4.subastas.repository.TokenConfirmacionRepository;
import com.grupo4.subastas.repository.UsuarioRepository;
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
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final PreRegistracionRepository preRegistracionRepository;
    private final TokenConfirmacionRepository tokenConfirmacionRepository;
    private final PaisRepository paisRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    private static final Integer SISTEMA_EMPLEADO_ID = 1;

    @Transactional
    public void registroPaso1(RegistroStep1Request request) {
        if (preRegistracionRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("Ya existe una solicitud con ese email", HttpStatus.CONFLICT);
        }
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("El email ya está registrado", HttpStatus.CONFLICT);
        }

        // Se guarda la solicitud y se aprueba automáticamente: el usuario recibe
        // el token por mail para completar el registro y generar su clave personal.
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
        preRegistracion = preRegistracionRepository.save(preRegistracion);

        aprobar(preRegistracion, "comun");
    }

    /**
     * Aprueba una pre-registración por su id. La empresa, tras verificar los datos
     * mediante su investigación externa, aprueba al postor, le asigna una categoría
     * y le envía el mail para que complete el registro y genere su clave personal.
     */
    @Transactional
    public void aprobarRegistro(Integer preRegistracionId, String categoria) {
        PreRegistracion pre = preRegistracionRepository.findById(preRegistracionId)
                .orElseThrow(() -> new CustomException("Pre-registro no encontrado", HttpStatus.NOT_FOUND));
        aprobar(pre, categoria);
    }

    /** Variante por email (más cómoda para la demo): aprueba la pre-registración pendiente de ese email. */
    @Transactional
    public void aprobarRegistroPorEmail(String email, String categoria) {
        PreRegistracion pre = preRegistracionRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("No hay una pre-registración para " + email, HttpStatus.NOT_FOUND));
        aprobar(pre, categoria);
    }

    private void aprobar(PreRegistracion pre, String categoria) {
        if (!"pendiente".equals(pre.getEstado())) {
            throw new CustomException("Esta solicitud ya fue procesada", HttpStatus.BAD_REQUEST);
        }

        Persona persona = Persona.builder()
                .nombre(pre.getNombre())
                .documento(pre.getNumeroDocumento())
                .direccion(pre.getDomicilio())
                .estado("activo")
                .build();
        persona = personaRepository.save(persona);

        Usuario usuario = Usuario.builder()
                .persona(persona)
                .apellido(pre.getApellido())
                .email(pre.getEmail())
                .rol("USER")
                .build();
        usuarioRepository.save(usuario);

        // El país es opcional: si el valor no existe en la tabla paises, se deja en
        // null para no violar la clave foránea.
        Integer numeroPais = pre.getNumeroPais();
        if (numeroPais != null && !paisRepository.existsByNumero(numeroPais)) {
            numeroPais = null;
        }

        Cliente cliente = new Cliente();
        cliente.setPersona(persona);
        cliente.setNumeroPais(numeroPais);
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

        Usuario usuario = usuarioRepository.findById(tokenConf.getClienteId())
                .orElseThrow(() -> new CustomException("Usuario no encontrado", HttpStatus.NOT_FOUND));

        usuario.setClavePersonal(passwordEncoder.encode(request.getClavePersonal()));
        usuarioRepository.save(usuario);

        tokenConf.setUsado("si");
        tokenConfirmacionRepository.save(tokenConf);
    }

    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException("Email o clave incorrectos", HttpStatus.UNAUTHORIZED));

        if (usuario.getClavePersonal() == null) {
            throw new CustomException("Debés completar el registro primero", HttpStatus.UNAUTHORIZED);
        }
        if (!passwordEncoder.matches(request.getClavePersonal(), usuario.getClavePersonal())) {
            throw new CustomException("Email o clave incorrectos", HttpStatus.UNAUTHORIZED);
        }

        Cliente cliente = clienteRepository.findById(usuario.getIdentificador())
                .orElseThrow(() -> new CustomException("Cliente no encontrado", HttpStatus.NOT_FOUND));

        if (!"si".equals(cliente.getAdmitido())) {
            throw new CustomException("Tu registro aún no ha sido aprobado por un administrador", HttpStatus.FORBIDDEN);
        }

        Persona persona = cliente.getPersona();
        String rol = usuario.getRol() != null ? usuario.getRol() : "USER";
        String token = jwtUtil.generateToken(usuario.getEmail(), persona.getIdentificador(), rol);

        UsuarioResponse usuarioResponse = UsuarioResponse.builder()
                .id(persona.getIdentificador())
                .nombre(persona.getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
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
