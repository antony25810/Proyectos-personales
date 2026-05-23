package com.sismo.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final List<String> allowedOriginPatterns;

    public SecurityConfig(
            @Value("${app.cors.allowed-origin-patterns:http://localhost:3000,http://localhost,http://127.0.0.1:3000,http://frontend,http://frontend:80}")
            String allowedOriginPatternsValue) {
        this.allowedOriginPatterns = Arrays.stream(allowedOriginPatternsValue.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .toList();
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
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
                .requestMatchers(HttpMethod.GET, "/api/sismos/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/grafos/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/propagation/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/propagation/**").permitAll()

                // Operaciones de mutación restringidas
                .requestMatchers(HttpMethod.POST, "/api/sismos/cargar").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/grafos/cargar-existentes").hasRole("ADMIN")
                
                // Rutas protegidas
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/perfil/**").authenticated()
                .requestMatchers("/api/user/**").hasRole("USER")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .invalidSessionUrl("/api/auth/session-invalid")
                .maximumSessions(1)
                .expiredUrl("/api/auth/session-expired")
            )
            .exceptionHandling(handling -> handling
                .authenticationEntryPoint((request, response, exception) -> {
                   if (!response.isCommitted()) {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"error\":\"No autenticado\"}");
                    }
                })
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
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

        // Lista explícita de orígenes permitidos para evitar CORS abierto con credenciales.
        configuration.setAllowedOriginPatterns(allowedOriginPatterns);
        
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