package com.sismo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.sismo.service.UsuarioService;

@RestController
@RequestMapping("/api/registro")
public class RegistroController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public String mostrarPaginaRegistro() {
        System.out.println("Accediendo a página de registro (GET)");
        return "Accediendo a página de registro (GET)";
    }

    @PostMapping
    public RegistroResponse registrarUsuario(@RequestBody RegistroRequest request) {
        
        System.out.println("Procesando formulario de registro (POST)");
        System.out.println("Datos recibidos - Usuario: " + request.getNombre() + ", Email: " + request.getEmail());
        
        RegistroResponse response = new RegistroResponse();
        
        // Validar que las contraseñas coinciden
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            response.setMensaje("Las contraseñas no coinciden");
            response.setError(true);
            response.setUsuarioForm(request.getNombre());
            response.setEmailForm(request.getEmail());
            return response;
        }
        
        try {
            // Importante: aquí pasamos request.getNombre() como "usuario" para el servicio
            boolean registrado = usuarioService.registrarUsuario(request.getNombre(), request.getEmail(), request.getPassword());
            
            System.out.println("Resultado del registro: " + (registrado ? "ÉXITO" : "FALLIDO"));
            
            if (registrado) {
                response.setMensaje("Registro exitoso. Ahora puedes iniciar sesión.");
                response.setError(false);
            } else {
                response.setMensaje("Error al registrar el usuario. Es posible que el nombre de usuario ya exista.");
                response.setError(true);
                response.setUsuarioForm(request.getNombre());
                response.setEmailForm(request.getEmail());
            }
        } catch (Exception e) {
            System.err.println("Excepción en el controlador de registro: " + e.getMessage());
            e.printStackTrace();
            
            response.setMensaje("Error técnico al procesar el registro: " + e.getMessage());
            response.setError(true);
            response.setUsuarioForm(request.getNombre());
            response.setEmailForm(request.getEmail());
        }
        
        return response;
    }
    
    // Clase para recibir los datos JSON
    static class RegistroRequest {
        private String nombre;  // Mantenemos "nombre" aquí para que coincida con el frontend
        private String email;
        private String password;
        private String confirmPassword;
        
        // Getters y setters
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        
        public String getConfirmPassword() { return confirmPassword; }
        public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    }
    
    // Clase de respuesta
    static class RegistroResponse {
        private String mensaje;
        private boolean error;
        private String usuarioForm;
        private String emailForm;

        // Getters y setters
        public String getMensaje() {
            return mensaje;
        }

        public void setMensaje(String mensaje) {
            this.mensaje = mensaje;
        }

        public boolean isError() {
            return error;
        }

        public void setError(boolean error) {
            this.error = error;
        }

        public String getUsuarioForm() {
            return usuarioForm;
        }

        public void setUsuarioForm(String usuarioForm) {
            this.usuarioForm = usuarioForm;
        }

        public String getEmailForm() {
            return emailForm;
        }

        public void setEmailForm(String emailForm) {
            this.emailForm = emailForm;
        }
    }
}