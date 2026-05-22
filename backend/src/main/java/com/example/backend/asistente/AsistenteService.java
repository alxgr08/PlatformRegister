package com.example.backend.asistente;

import com.example.backend.asistente.dto.AsistenteDto;
import com.example.backend.common.ApiException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Logica del modulo de asistentes: busqueda por DNI, alta de nuevos
 * asistentes y registro de ingreso al evento general.
 */
@Service
public class AsistenteService {

    private final AsistenteRepository repo;

    public AsistenteService(AsistenteRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public AsistenteDto.Busqueda buscarPorDni(String dni) {
        return repo.findByDni(normalizar(dni))
                .map(a -> new AsistenteDto.Busqueda(true, aRespuesta(a)))
                .orElseGet(() -> new AsistenteDto.Busqueda(false, null));
    }

    @Transactional(readOnly = true)
    public AsistenteDto.Respuesta obtenerPorDni(String dni) {
        return aRespuesta(buscarEntidad(dni));
    }

    @Transactional(readOnly = true)
    public Page<AsistenteDto.Respuesta> listar(Pageable pageable) {
        return repo.findAll(pageable).map(this::aRespuesta);
    }

    @Transactional
    public AsistenteDto.Respuesta crear(AsistenteDto.CrearRequest req) {
        String dni = normalizar(req.dni());
        if (repo.existsByDni(dni)) {
            throw new ApiException(HttpStatus.CONFLICT, "Ya existe un asistente con el DNI " + dni);
        }
        Asistente a = new Asistente();
        a.setDni(dni);
        a.setNombreCompleto(req.nombreCompleto().trim());
        a.setNombre(req.nombreCompleto().trim());
        a.setCelular(limpiar(req.celular()));
        a.setCorreo(limpiar(req.correo()));
        a.setEspecialidad(limpiar(req.especialidad()));
        a.setTipoRegistro("NUEVO REGISTRADO");
        return aRespuesta(repo.save(a));
    }

    /** Edita los datos de un asistente existente (correccion de datos). */
    @Transactional
    public AsistenteDto.Respuesta actualizar(String dni, AsistenteDto.ActualizarRequest req) {
        Asistente a = buscarEntidad(dni);
        String nombre = req.nombreCompleto().trim();
        a.setNombreCompleto(nombre);
        a.setNombre(nombre);
        a.setApellidos(null);
        a.setCelular(limpiar(req.celular()));
        a.setCorreo(limpiar(req.correo()));
        a.setEspecialidad(limpiar(req.especialidad()));
        return aRespuesta(repo.save(a));
    }

    /** Registra el ingreso de la persona al evento general (una sola vez por DNI). */
    @Transactional
    public AsistenteDto.Respuesta registrarIngreso(String dni) {
        Asistente a = buscarEntidad(dni);
        if (a.getFechaIngresoEvento() != null) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "El DNI " + a.getDni() + " ya fue registrado al evento.");
        }
        a.setFechaIngresoEvento(LocalDateTime.now());
        return aRespuesta(repo.save(a));
    }

    /** Deshace el ingreso al evento (correccion de errores). */
    @Transactional
    public AsistenteDto.Respuesta deshacerIngreso(String dni) {
        Asistente a = buscarEntidad(dni);
        if (a.getFechaIngresoEvento() == null) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "El DNI " + a.getDni() + " no tiene un ingreso al evento registrado.");
        }
        a.setFechaIngresoEvento(null);
        return aRespuesta(repo.save(a));
    }

    @Transactional(readOnly = true)
    public AsistenteDto.Estadisticas estadisticas() {
        return new AsistenteDto.Estadisticas(repo.count(), repo.countByFechaIngresoEventoIsNotNull());
    }

    /** Busca la entidad por DNI o lanza 404. Uso interno / otros modulos. */
    Asistente buscarEntidad(String dni) {
        return repo.findByDni(normalizar(dni))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "No existe un asistente con el DNI " + dni));
    }

    private String normalizar(String dni) {
        return dni == null ? null : dni.trim();
    }

    private String limpiar(String valor) {
        if (valor == null) {
            return null;
        }
        String v = valor.trim();
        return v.isEmpty() ? null : v;
    }

    private AsistenteDto.Respuesta aRespuesta(Asistente a) {
        return new AsistenteDto.Respuesta(
                a.getId(), a.getDni(), a.getNombreCompleto(), a.getNombre(), a.getApellidos(),
                a.getCelular(), a.getCorreo(), a.getEspecialidad(), a.getTipoRegistro(),
                a.getFechaIngresoEvento() != null, a.getFechaIngresoEvento());
    }
}
