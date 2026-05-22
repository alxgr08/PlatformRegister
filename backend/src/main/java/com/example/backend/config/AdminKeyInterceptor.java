package com.example.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Protege los endpoints de administracion (crear/editar/eliminar salas y carga CSV).
 * Exige la cabecera  X-Admin-Key  con la clave configurada en app.admin-key.
 *
 * Quedan ABIERTOS (no requieren clave):
 *   - cualquier peticion GET
 *   - el registro rapido en charlas  (.../registros)  usado por el personal de salas.
 */
@Component
public class AdminKeyInterceptor implements HandlerInterceptor {

    private final String adminKey;

    public AdminKeyInterceptor(@Value("${app.admin-key}") String adminKey) {
        this.adminKey = adminKey;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String metodo = request.getMethod();
        if ("OPTIONS".equalsIgnoreCase(metodo)) {
            return true;
        }
        String path = request.getRequestURI();
        // El modulo de carga (importar/exportar base de datos) exige clave en TODOS los metodos.
        boolean esCarga = path.contains("/api/carga/");
        if (!esCarga) {
            // Charlas: las lecturas (GET) y el registro rapido quedan abiertas.
            if ("GET".equalsIgnoreCase(metodo) || path.contains("/registros")) {
                return true;
            }
        }
        String provista = request.getHeader("X-Admin-Key");
        if (adminKey != null && adminKey.equals(provista)) {
            return true;
        }
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(
                "{\"status\":401,\"error\":\"Unauthorized\","
                        + "\"mensaje\":\"Falta o es invalida la cabecera X-Admin-Key.\"}");
        return false;
    }
}
