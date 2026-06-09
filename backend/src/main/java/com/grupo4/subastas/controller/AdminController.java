package com.grupo4.subastas.controller;

import com.grupo4.subastas.dto.request.CrearProductoRequest;
import com.grupo4.subastas.dto.request.CrearSubastaRequest;
import com.grupo4.subastas.dto.request.VincularItemCatalogoRequest;
import com.grupo4.subastas.dto.response.MedioPagoResponse;
import com.grupo4.subastas.dto.response.PreRegistracionResponse;
import com.grupo4.subastas.dto.response.SolicitudItemResponse;
import com.grupo4.subastas.model.entity.Catalogo;
import com.grupo4.subastas.model.entity.ItemCatalogo;
import com.grupo4.subastas.model.entity.Producto;
import com.grupo4.subastas.model.entity.Subasta;
import com.grupo4.subastas.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/solicitudes-usuarios")
    public ResponseEntity<List<PreRegistracionResponse>> listarSolicitudesUsuarios() {
        return ResponseEntity.ok(adminService.listarSolicitudesUsuarios());
    }

    @GetMapping("/solicitudes-items")
    public ResponseEntity<List<SolicitudItemResponse>> listarSolicitudesItems() {
        return ResponseEntity.ok(adminService.listarSolicitudes());
    }

    @PostMapping("/solicitudes-items/{id}/aprobar")
    public ResponseEntity<Map<String, String>> aprobarSolicitudItem(@PathVariable Integer id) {
        adminService.aprobarSolicitudItem(id);
        return ResponseEntity.ok(Map.of("mensaje", "Solicitud aprobada"));
    }

    @GetMapping("/medios-pago")
    public ResponseEntity<List<MedioPagoResponse>> listarMediosPago() {
        return ResponseEntity.ok(adminService.listarMediosPagoPendientes());
    }

    @PostMapping("/medios-pago/{id}/aprobar")
    public ResponseEntity<Map<String, String>> aprobarMedioPago(@PathVariable Integer id) {
        adminService.aprobarMedioPago(id);
        return ResponseEntity.ok(Map.of("mensaje", "Medio de pago aprobado"));
    }

    @PostMapping("/subastas")
    public ResponseEntity<Map<String, Object>> crearSubasta(@Valid @RequestBody CrearSubastaRequest request) {
        Subasta subasta = adminService.crearSubasta(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("id", subasta.getIdentificador(), "mensaje", "Subasta creada"));
    }

    @PostMapping("/productos")
    public ResponseEntity<Map<String, Object>> crearProducto(@Valid @RequestBody CrearProductoRequest request) {
        Producto producto = adminService.crearProducto(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("id", producto.getIdentificador(), "mensaje", "Producto creado"));
    }

    @PostMapping("/catalogos/{subastaId}")
    public ResponseEntity<Map<String, Object>> crearCatalogo(
            @PathVariable Integer subastaId,
            @RequestParam(defaultValue = "Catálogo principal") String descripcion) {
        Catalogo catalogo = adminService.crearCatalogo(subastaId, descripcion);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("id", catalogo.getIdentificador(), "mensaje", "Catálogo creado"));
    }

    @PostMapping("/itemscatalogo/{catalogoId}")
    public ResponseEntity<Map<String, Object>> vincularItem(
            @PathVariable Integer catalogoId,
            @Valid @RequestBody VincularItemCatalogoRequest request) {
        ItemCatalogo item = adminService.vincularItemAlCatalogo(catalogoId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("id", item.getIdentificador(), "mensaje", "Item vinculado al catálogo"));
    }
}
