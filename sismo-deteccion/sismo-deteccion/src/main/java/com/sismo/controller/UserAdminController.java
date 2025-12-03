package com.sismo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import com.sismo.model.UserModel;
import com.sismo.service.UsuarioService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/usuarios")
@PreAuthorize("hasRole('ROLE_ADMIN')") // Restringe todo el controlador solo a administradores
public class UserAdminController {

    @Autowired
    private UsuarioService usuarioService;

    // Obtener todos los usuarios
    @GetMapping
    public ResponseEntity<List<UserModel>> obtenerTodosUsuarios() {
        List<UserModel> usuarios = usuarioService.obtenerTodosUsuarios();
        return ResponseEntity.ok(usuarios);
    }

    // Obtener usuario por username
    @GetMapping("/{username}")
    public ResponseEntity<UserModel> obtenerUsuarioPorUsername(@PathVariable String username) {
        Optional<UserModel> usuario = usuarioService.buscarPorUsername(username);
        return usuario.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Registrar nuevo usuario
    @PostMapping
    public ResponseEntity<String> registrarUsuario(@RequestBody Map<String, String> datos) {
        String username = datos.get("username");
        String email = datos.get("email");
        String password = datos.get("password");
        
        boolean registrado = usuarioService.registrarUsuario(username, email, password);

        if (registrado) {
            return ResponseEntity.status(HttpStatus.CREATED).body("Usuario registrado exitosamente");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error al registrar el usuario");
        }
    }

    // Actualizar usuario
    @PutMapping("/{id}")
    public ResponseEntity<String> actualizarUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, String> datos) {
        
        String username = datos.get("username");
        String email = datos.get("email");
        String rol = datos.get("rol");
        
        boolean actualizado = usuarioService.actualizarUsuarioAdmin(id, username, email, rol);

        if (actualizado) {
            return ResponseEntity.ok("Usuario actualizado exitosamente");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
        }
    }

    // Eliminar usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarUsuario(@PathVariable Long id) {
        try {
            usuarioService.eliminarUsuario(id);
            return ResponseEntity.ok("Usuario eliminado exitosamente");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el usuario");
        }
    }

    // Cambiar contraseña (desde el panel de administración)
    @PostMapping("/cambiar-password")
    public ResponseEntity<String> cambiarContrasenaAdmin(@RequestBody Map<String, String> datos) {
        String username = datos.get("username");
        String contrasenaNueva = datos.get("contrasenaNueva");
        
        boolean cambiado = usuarioService.actualizarPasswordAdmin(contrasenaNueva, username);

        if (cambiado) {
            return ResponseEntity.ok("Contraseña actualizada exitosamente");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
        }
    }
}