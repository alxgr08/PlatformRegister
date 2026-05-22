package com.example.backend.charla.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * Objetos de transferencia (DTO) del modulo de charlas / salas.
 */
public final class CharlaDto {

    private CharlaDto() {
    }

    /** Cuerpo para crear una charla. */
    public record CrearRequest(
            @NotBlank(message = "El nombre de la charla es obligatorio") String nombre,
            @NotBlank(message = "La sala es obligatoria") String sala,
            @NotNull(message = "La hora de inicio es obligatoria") LocalDateTime horaInicio,
            @NotNull(message = "La hora de fin es obligatoria") LocalDateTime horaFin,
            @NotNull(message = "El aforo es obligatorio")
            @Min(value = 0, message = "El aforo no puede ser negativo") Integer aforo
    ) {
    }

    /** Cuerpo para editar una charla. */
    public record ActualizarRequest(
            @NotBlank(message = "El nombre de la charla es obligatorio") String nombre,
            @NotBlank(message = "La sala es obligatoria") String sala,
            @NotNull(message = "La hora de inicio es obligatoria") LocalDateTime horaInicio,
            @NotNull(message = "La hora de fin es obligatoria") LocalDateTime horaFin,
            @NotNull(message = "El aforo es obligatorio")
            @Min(value = 0, message = "El aforo no puede ser negativo") Integer aforo,
            Boolean oculta
    ) {
    }

    /** Cuerpo para ocultar / mostrar una charla. */
    public record VisibilidadRequest(
            @NotNull(message = "Indique el valor de 'oculta'") Boolean oculta
    ) {
    }

    /** Cuerpo para inscribir un DNI en una charla. */
    public record RegistrarRequest(
            @NotBlank(message = "El DNI es obligatorio") String dni
    ) {
    }

    /** Datos de una charla con su estado de ocupacion calculado. */
    public record Respuesta(
            Long id,
            String nombre,
            String sala,
            LocalDateTime horaInicio,
            LocalDateTime horaFin,
            int aforo,
            int registrados,
            int disponibles,
            int porcentajeOcupacion,
            String nivelOcupacion,
            String estado,
            boolean oculta,
            boolean finalizada
    ) {
    }

    /** Una inscripcion dentro de una charla. */
    public record RegistroRespuesta(
            Long registroId,
            Long charlaId,
            String dni,
            String nombreCompleto,
            LocalDateTime registradoEn
    ) {
    }
}
