package com.sismo.interceptor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.Enumeration;

@Component
public class SessionDebugFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(SessionDebugFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        HttpSession session = request.getSession(false); // No crear una nueva si no existe
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        logger.debug("---- Debugging Session ----");
        if (session != null) {
            logger.debug("Session ID: {}", session.getId());
            logger.debug("Session Creation Time: {}", new java.util.Date(session.getCreationTime()));
            logger.debug("Session Last Accessed Time: {}", new java.util.Date(session.getLastAccessedTime()));
            logger.debug("Session Max Inactive Interval: {} seconds", session.getMaxInactiveInterval());
            
            // Mostrar atributos de sesión relacionados con la seguridad
            Enumeration<String> attributeNames = session.getAttributeNames();
            while (attributeNames.hasMoreElements()) {
                String name = attributeNames.nextElement();
                if (name.contains("SPRING_SECURITY")) {
                    logger.debug("Session Attribute: {} = {}", name, session.getAttribute(name));
                }
            }
        } else {
            logger.debug("No session found.");
        }
        
        // Imprimir SecurityContext
        logger.debug("SecurityContext:");
        if (auth != null) {
            logger.debug(" - Principal: {}", auth.getName());
            logger.debug(" - Authenticated: {}", auth.isAuthenticated());
            logger.debug(" - Authorities: {}", auth.getAuthorities());
        } else {
            logger.debug(" - No authentication found");
        }
        
        // Imprimir cookies
        Cookie[] cookies = request.getCookies();
        if (cookies != null && cookies.length > 0) {
            logger.debug("Cookies:");
            for (Cookie cookie : cookies) {
                logger.debug(" - {}: {} (Path: {}, Secure: {}, HttpOnly: {})", 
                          cookie.getName(), cookie.getValue(), cookie.getPath(), 
                          cookie.getSecure(), cookie.isHttpOnly());
            }
        } else {
            logger.debug("No cookies found");
        }
        
        logger.debug("---------------------------");
        
        filterChain.doFilter(request, response);
    }
}