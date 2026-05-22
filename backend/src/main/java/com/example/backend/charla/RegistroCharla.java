package com.example.backend.charla;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

/**
 * Inscripcion de un asistente en una charla.
 * La restriccion unica (charla_id, asistente_id) impide registros duplicados:
 * un DNI no puede inscribirse dos veces en la misma charla.
 */
@Entity
@Table(name = "registro_charla",
        uniqueConstraints = @UniqueConstraint(name = "uk_registro_charla",
                columnNames = {"charla_id", "asistente_id"}),
        indexes = {
                @Index(name = "idx_registro_charla_charla", columnList = "charla_id"),
                @Index(name = "idx_registro_charla_asistente", columnList = "asistente_id")
        })
public class RegistroCharla {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "charla_id", nullable = false)
    private Long charlaId;

    @Column(name = "asistente_id", nullable = false)
    private Long asistenteId;

    @Column(name = "dni", nullable = false, length = 20)
    private String dni;

    @Column(name = "registrado_en", nullable = false)
    private LocalDateTime registradoEn;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCharlaId() { return charlaId; }
    public void setCharlaId(Long charlaId) { this.charlaId = charlaId; }

    public Long getAsistenteId() { return asistenteId; }
    public void setAsistenteId(Long asistenteId) { this.asistenteId = asistenteId; }

    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }

    public LocalDateTime getRegistradoEn() { return registradoEn; }
    public void setRegistradoEn(LocalDateTime registradoEn) { this.registradoEn = registradoEn; }
}
