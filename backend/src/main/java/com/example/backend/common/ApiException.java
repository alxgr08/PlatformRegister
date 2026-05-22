package com.example.backend.common;

import org.springframework.http.HttpStatus;

/**
 * Excepcion de negocio: lleva el codigo HTTP con el que debe responderse al cliente.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String mensaje) {
        super(mensaje);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
