package com.example.backend.admin;

import com.example.backend.common.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Verificacion de la clave de administracion.
 * El frontend la usa una sola vez para "ingresar como administrador".
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final String adminKey;

    public AdminController(@Value("${app.admin-key}") String adminKey) {
        this.adminKey = adminKey;
    }

    public record LoginRequest(String clave) {
    }

    public record LoginResponse(boolean ok) {
    }

    /** Valida la clave de administracion: 200 si es correcta, 401 si no lo es. */
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest req) {
        if (adminKey != null && req != null && adminKey.equals(req.clave())) {
            return new LoginResponse(true);
        }
        throw new ApiException(HttpStatus.UNAUTHORIZED, "Clave de administracion incorrecta.");
    }
}
