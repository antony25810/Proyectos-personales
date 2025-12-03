package com.sismo.controller;

import com.sismo.model.UserModel;
import com.sismo.repository.UserRepository;
import com.sismo.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/perfil")
public class PerfilController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UserRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public Map<String, Object> mostrarPerfil(@AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = new HashMap<>();
        Optional<UserModel> usuario = usuarioService.buscarPorUsername(userDetails.getUsername());

        if (usuario.isPresent()) {
            response.put("usuario", usuario.get());
        } else {
            response.put("error", "Usuario no encontrado");
        }

        return response;
    }

    @PostMapping("/actualizar")
    public Map<String, Object> actualizarPerfil(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("nombre") String nombre,
            @RequestParam("email") String email) {

        Map<String, Object> response = new HashMap<>();
        boolean cambiado = usuarioService.actualizarPerfil(userDetails.getUsername(), nombre, email);

        if (cambiado) {
            response.put("mensaje", "Perfil actualizado exitosamente");
            response.put("success", true);
            // Si el nombre de usuario cambió, cerramos la sesión y forzamos un nuevo inicio
            if (!nombre.equals(userDetails.getUsername())) {
                response.put("logout", true);
            }
        } else {
            response.put("error", "Error al actualizar el perfil");
        }

        return response;
    }

    @PostMapping("/actualizar-contrasena")
    public Map<String, Object> actualizarContraseña(
            @RequestParam("currentPassword") String currentPassword,
            @RequestParam("newPassword") String nuevaPassword,
            @RequestParam("confirmPassword") String confirmPassword) {

        Map<String, Object> response = new HashMap<>();

        // Obtener el usuario autenticado actual
        String username = ((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        UserModel usuario = usuarioRepository.findByUsername(username).orElse(null);

        if (usuario == null) {
            response.put("error", "Error: No se pudo encontrar el usuario.");
            return response;
        }

        // Verificar que la contraseña actual sea correcta
        if (!passwordEncoder.matches(currentPassword, usuario.getPassword())) {
            response.put("error", "Error: La contraseña actual es incorrecta.");
            return response;
        }

        // Verificar que las contraseñas nuevas coincidan
        if (!nuevaPassword.equals(confirmPassword)) {
            response.put("error", "Error: Las contraseñas nuevas no coinciden.");
            return response;
        }

        // Actualizar la contraseña
        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);

        response.put("mensaje", "¡Contraseña actualizada con éxito!");
        response.put("success", true);
        return response;
    }
}