package com.example.backend.asistente;

import com.example.backend.asistente.dto.AsistenteDto;
import com.example.backend.charla.CharlaService;
import com.example.backend.charla.dto.CharlaDto;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Modulo de Asistentes: registro de ingreso al evento general.
 */
@RestController
@RequestMapping("/api/asistentes")
public class AsistenteController {

    private final AsistenteService service;
    private final CharlaService charlaService;

    public AsistenteController(AsistenteService service, CharlaService charlaService) {
        this.service = service;
        this.charlaService = charlaService;
    }

    /** Busca un asistente por DNI. Devuelve {encontrado, asistente}. */
    @GetMapping("/buscar")
    public AsistenteDto.Busqueda buscar(@RequestParam String dni) {
        return service.buscarPorDni(dni);
    }

    /** Conteos generales (total y total ingresados al evento). */
    @GetMapping("/estadisticas")
    public AsistenteDto.Estadisticas estadisticas() {
        return service.estadisticas();
    }

    /** Lista paginada de asistentes. */
    @GetMapping
    public Page<AsistenteDto.Respuesta> listar(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "50") int tamano) {
        int tam = Math.min(Math.max(tamano, 1), 200);
        return service.listar(PageRequest.of(Math.max(pagina, 0), tam, Sort.by("id")));
    }

    /** Obtiene un asistente por DNI (404 si no existe). */
    @GetMapping("/{dni}")
    public AsistenteDto.Respuesta obtener(@PathVariable String dni) {
        return service.obtenerPorDni(dni);
    }

    /** Charlas en las que el asistente ya esta inscrito. */
    @GetMapping("/{dni}/charlas")
    public List<CharlaDto.Respuesta> charlasDelAsistente(@PathVariable String dni) {
        return charlaService.charlasDeAsistente(dni);
    }

    /** Crea un nuevo asistente (tipo "NUEVO REGISTRADO"). */
    @PostMapping
    public ResponseEntity<AsistenteDto.Respuesta> crear(@Valid @RequestBody AsistenteDto.CrearRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(req));
    }

    /** Edita los datos de un asistente existente. */
    @PutMapping("/{dni}")
    public AsistenteDto.Respuesta actualizar(@PathVariable String dni,
                                             @Valid @RequestBody AsistenteDto.ActualizarRequest req) {
        return service.actualizar(dni, req);
    }

    /** Registra el ingreso del asistente al evento general. */
    @PostMapping("/{dni}/ingreso")
    public AsistenteDto.Respuesta registrarIngreso(@PathVariable String dni) {
        return service.registrarIngreso(dni);
    }

    /** Deshace el ingreso del asistente al evento. */
    @DeleteMapping("/{dni}/ingreso")
    public AsistenteDto.Respuesta deshacerIngreso(@PathVariable String dni) {
        return service.deshacerIngreso(dni);
    }
}
