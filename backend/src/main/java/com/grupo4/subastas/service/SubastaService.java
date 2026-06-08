package com.grupo4.subastas.service;

import com.grupo4.subastas.dto.response.ItemResponse;
import com.grupo4.subastas.dto.response.SubastaResponse;
import com.grupo4.subastas.exception.CustomException;
import com.grupo4.subastas.model.entity.*;
import com.grupo4.subastas.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubastaService {

    private final SubastaRepository subastaRepository;
    private final CatalogoRepository catalogoRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final FotoRepository fotoRepository;
    private final ClienteRepository clienteRepository;

    private static final Map<String, Integer> NIVEL_CATEGORIA = Map.of(
            "comun", 1, "especial", 2, "plata", 3, "oro", 4, "platino", 5
    );

    @Transactional
    public List<SubastaResponse> listarSubastas(String categoria, String emailUsuario) {
        List<Subasta> subastas = categoria != null
                ? subastaRepository.findByCategoriaWithSubastador(categoria)
                : subastaRepository.findAllWithSubastador();

        String catUsuario = getCategoriaUsuario(emailUsuario);
        return subastas.stream()
                .map(s -> toResponse(s, catUsuario))
                .collect(Collectors.toList());
    }

    @Transactional
    public SubastaResponse obtenerSubasta(Integer id, String emailUsuario) {
        Subasta subasta = subastaRepository.findByIdWithSubastador(id)
                .orElseThrow(() -> new CustomException("Subasta no encontrada", HttpStatus.NOT_FOUND));
        String catUsuario = getCategoriaUsuario(emailUsuario);
        return toResponse(subasta, catUsuario);
    }

    @Transactional
    public List<ItemResponse> listarItems(Integer subastaId, boolean mostrarPrecios) {
        Catalogo catalogo = catalogoRepository.findBySubastaId(subastaId).orElse(null);
        if (catalogo == null) return List.of();

        return itemCatalogoRepository.findByCatalogoWithProducto(catalogo.getIdentificador())
                .stream()
                .map(ic -> toItemResponse(ic, mostrarPrecios))
                .collect(Collectors.toList());
    }

    @Transactional
    public ItemResponse obtenerItem(Integer itemId, boolean mostrarPrecios) {
        ItemCatalogo item = itemCatalogoRepository.findById(itemId)
                .orElseThrow(() -> new CustomException("Ítem no encontrado", HttpStatus.NOT_FOUND));
        return toItemResponse(item, mostrarPrecios);
    }

    private String getCategoriaUsuario(String email) {
        if (email == null) return null;
        return clienteRepository.findByPersonaEmail(email)
                .map(Cliente::getCategoria)
                .orElse(null);
    }

    private boolean puedeAcceder(String catSubasta, String catUsuario) {
        if (catSubasta == null || catUsuario == null) return false;
        int nivelSubasta = NIVEL_CATEGORIA.getOrDefault(catSubasta, 999);
        int nivelUsuario = NIVEL_CATEGORIA.getOrDefault(catUsuario, 0);
        return nivelUsuario >= nivelSubasta;
    }

    private SubastaResponse toResponse(Subasta s, String catUsuario) {
        String nombreSubastador = null;
        if (s.getSubastador() != null && s.getSubastador().getPersona() != null) {
            Persona p = s.getSubastador().getPersona();
            nombreSubastador = p.getNombre() +
                    (p.getApellido() != null ? " " + p.getApellido() : "");
        }

        return SubastaResponse.builder()
                .id(s.getIdentificador())
                .fecha(s.getFecha() != null ? s.getFecha().toString() : null)
                .hora(s.getHora() != null ? s.getHora().toString() : null)
                .estado(s.getEstado())
                .ubicacion(s.getUbicacion())
                .categoria(s.getCategoria())
                .moneda(s.getMoneda() != null ? s.getMoneda() : "ARS")
                .subastador(nombreSubastador)
                .puedeAcceder(puedeAcceder(s.getCategoria(), catUsuario))
                .build();
    }

    private ItemResponse toItemResponse(ItemCatalogo ic, boolean mostrarPrecios) {
        Producto p = ic.getProducto();
        List<Integer> fotoIds = fotoRepository.findIdsByProductoId(p.getIdentificador());

        return ItemResponse.builder()
                .id(ic.getIdentificador())
                .numeroPieza(p.getIdentificador())
                .descripcion(p.getDescripcionCatalogo())
                .precioBase(mostrarPrecios ? ic.getPrecioBase() : null)
                .subastado(ic.getSubastado())
                .fotoIds(fotoIds)
                .descripcionCompleta(p.getDescripcionCompleta())
                .build();
    }
}
