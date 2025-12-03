package com.sismo.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserCache;
import org.springframework.security.core.userdetails.cache.NullUserCache;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.sismo.service.CustomUserDetailsService;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private CustomUserDetailsService customUserDetailsService;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors().configurationSource(corsConfigurationSource()).and()
            .authorizeHttpRequests(auth -> auth
                // Permitir OPTIONS para todos los endpoints (crucial para CORS preflight)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Rutas estáticas y públicas
                .requestMatchers("/registro", "/login", "/testConnection", "/css/**", "/js/**").permitAll()
                
                // Permitir explícitamente rutas de API públicas
                .requestMatchers(HttpMethod.GET, "/api/registro").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/registro").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/home").permitAll() 
                .requestMatchers("/api/sismos/**").permitAll()
                .requestMatchers("/api/grafos/**").permitAll()
                .requestMatchers("/api/usuarios/**").permitAll()
                .requestMatchers("/api/propagation/**").permitAll()
                
                // Rutas protegidas
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/user/**").hasRole("USER")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.ALWAYS)
                .invalidSessionUrl("/api/auth/session-invalid")
                .maximumSessions(1)
                .expiredUrl("/api/auth/session-expired")
            )
            .exceptionHandling(handling -> handling
                .authenticationEntryPoint((request, response, exception) -> {
                    System.out.println("Error de autenticación: " + exception.getMessage());
                   if (!response.isCommitted()) {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"error\":\"No autenticado\",\"message\":\"" + exception.getMessage() + "\"}");
                    }
                })
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(HttpServletResponse.SC_OK);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\":\"Cierre de sesión exitoso\"}");
                }).permitAll()
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Configura los orígenes permitidos
        /*configuration.setAllowedOrigins(Arrays.asList(    "http://localhost", 
    "http://localhost:80",
    "http://frontend",
    "http://frontend:80",
    "http://localhost:3000",
    "http://frontend:3000"));
        */

        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        
        // Permite todas las cabeceras comunes
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization", 
                "Content-Type", 
                "Accept", 
                "Origin", 
                "X-Requested-With",
                "Access-Control-Request-Method", 
                "Access-Control-Request-Headers"
        ));
        
        // Expone cabeceras necesarias
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization", 
                "Content-Type", 
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials"
        ));
        
        // Métodos permitidos, incluido OPTIONS para preflight
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        
        // Habilita credenciales (cookies, auth headers)
        configuration.setAllowCredentials(true);
        
        // Tiempo de cache para respuestas preflight
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Aplicar a todos los endpoints
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }   

}