package com.sismo.service;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.sismo.model.UserModel;
import com.sismo.repository.UserRepository;

import jakarta.transaction.Transactional;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.stream.Collectors;
import java.util.List;

@Service
@Transactional
public class CustomUserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Buscar el usuario en la base de datos
        UserModel userModel = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        // Convertir los roles del usuario en una lista de SimpleGrantedAuthority
        List<SimpleGrantedAuthority> authorities = userModel.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toList());

        // Retornar el usuario con credenciales y roles
        return User.withUsername(userModel.getUsername())
                .password(userModel.getPassword()) // Contraseña ya encriptada en la BD
                .authorities(authorities) // Asignar lista de roles correctamente
                .build();
    }
}