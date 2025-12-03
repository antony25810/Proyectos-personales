package com.sismo.model;

public class RegistroResponse {
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