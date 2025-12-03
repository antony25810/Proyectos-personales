package com.sismo.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;

@RestController
public class HomeController {

    public static class RoleResponse {
        private boolean isAdmin;
        private boolean isUser;

        // Constructor vacío
        public RoleResponse() {}

        public RoleResponse(boolean isAdmin, boolean isUser) {
            this.isAdmin = isAdmin;
            this.isUser = isUser;
        }

        // Getters y Setters
        public boolean isAdmin() {
            return isAdmin;
        }

        public void setAdmin(boolean admin) {
            isAdmin = admin;
        }

        public boolean isUser() {
            return isUser;
        }

        public void setUser(boolean user) {
            isUser = user;
        }
    }

    @GetMapping("/api/home")
    public RoleResponse home(Authentication authentication) {
        boolean isAdmin = false;
        boolean isUser = false;

        if (authentication != null) {
            Collection<? extends GrantedAuthority> roles = authentication.getAuthorities();
            isAdmin = roles.stream().anyMatch(role -> role.getAuthority().equals("ROLE_ADMIN"));
            isUser = roles.stream().anyMatch(role -> role.getAuthority().equals("ROLE_USER"));
        }else{
            isUser = true;
        }

        return new RoleResponse(isAdmin, isUser);
    }
}