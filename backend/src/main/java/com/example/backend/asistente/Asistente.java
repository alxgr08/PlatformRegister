package com.example.backend.asistente;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * Asistente del evento: contiene la base de pre-registro y los nuevos registrados.
 * fechaIngresoEvento != null  ->  la persona ya ingreso al evento general.
 */
@Entity
@Table(name = "asistente",
        indexes = @Index(name = "idx_asistente_ingreso", columnList = "fecha_ingreso_evento"))
public class Asistente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String dni;

    @Column(name = "nombre_completo", nullable = false, length = 200)
    private String nombreCompleto;

    @Column(length = 30)
    private String celular;

    @Column(length = 150)
    private String correo;

    @Column(length = 150)
    private String especialidad;

    // --- Campos del archivo de base de datos (Excel) ---
    @Column(length = 150)
    private String nombre;

    @Column(length = 150)
    private String apellidos;

    @Column(name = "tipo_documento", length = 20)
    private String tipoDocumento;

    @Column(name = "terminos_cmr")
    private Boolean terminosCmr;

    @Column(name = "terminos_condiciones")
    private Boolean terminosCondiciones;

    @Column(name = "fecha_registro_origen", length = 40)
    private String fechaRegistroOrigen;

    @Column(name = "tipo_registro", nullable = false, length = 50)
    private String tipoRegistro;

    @Column(name = "fecha_ingreso_evento")
    private LocalDateTime fechaIngresoEvento;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @PrePersist
    void prePersist() {
        if (creadoEn == null) {
            creadoEn = LocalDateTime.now();
        }
        if (tipoRegistro == null || tipoRegistro.isBlank()) {
            tipoRegistro = "PRE-REGISTRADO";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

    public String getCelular() { return celular; }
    public void setCelular(String celular) { this.celular = celular; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }

    public String getTipoDocumento() { return tipoDocumento; }
    public void setTipoDocumento(String tipoDocumento) { this.tipoDocumento = tipoDocumento; }

    public Boolean getTerminosCmr() { return terminosCmr; }
    public void setTerminosCmr(Boolean terminosCmr) { this.terminosCmr = terminosCmr; }

    public Boolean getTerminosCondiciones() { return terminosCondiciones; }
    public void setTerminosCondiciones(Boolean terminosCondiciones) { this.terminosCondiciones = terminosCondiciones; }

    public String getFechaRegistroOrigen() { return fechaRegistroOrigen; }
    public void setFechaRegistroOrigen(String fechaRegistroOrigen) { this.fechaRegistroOrigen = fechaRegistroOrigen; }

    public String getTipoRegistro() { return tipoRegistro; }
    public void setTipoRegistro(String tipoRegistro) { this.tipoRegistro = tipoRegistro; }

    public LocalDateTime getFechaIngresoEvento() { return fechaIngresoEvento; }
    public void setFechaIngresoEvento(LocalDateTime fechaIngresoEvento) { this.fechaIngresoEvento = fechaIngresoEvento; }

    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }
}
