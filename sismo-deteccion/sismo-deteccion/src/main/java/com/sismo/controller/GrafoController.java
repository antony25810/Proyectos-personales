package com.sismo.controller;

import com.sismo.model.Sismo;
import com.sismo.model.graph.SismoNode;
import com.sismo.model.graph.UbicacionNode;
import com.sismo.service.GrafoService;
import com.sismo.service.SismoService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/grafos")
//@CrossOrigin(origins = "http://localhost", allowCredentials = "true")
@PreAuthorize("permitAll()")
public class GrafoController {
    
    private final GrafoService grafoService;
    private final SismoService sismoService;
    
    public GrafoController(GrafoService grafoService, SismoService sismoService) {
        this.grafoService = grafoService;
        this.sismoService = sismoService;
    }
    
    @GetMapping("/sismos")
    public List<SismoNode> obtenerTodosLosNodosSismo() {
        return grafoService.obtenerTodosLosNodosSismo();
    }
    
    @GetMapping("/ubicaciones")
    public List<UbicacionNode> obtenerTodasLasUbicaciones() {
        return grafoService.obtenerTodasLasUbicaciones();
    }
    
    @PostMapping("/cargar-existentes")
    public ResponseEntity<Map<String, Object>> cargarDatosExistentesANeo4j() {
        try {
            // Obtener todos los sismos desde el repositorio relacional
            List<Sismo> sismos = sismoService.obtenerPorMagnitud(7);
            
            if (!sismos.isEmpty()) {
                // Cargar los sismos a Neo4j
                grafoService.cargarSismosAGrafo(sismos);
                System.out.println("Cargados " + sismos.size() + " sismos existentes a Neo4j como grafos");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Datos cargados exitosamente a Neo4j");
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Error al cargar datos a Neo4j: " + e.getMessage());
            response.put("success", false);
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @GetMapping("/visualizacion")
    public Map<String, Object> obtenerDatosParaVisualizacion(
        @RequestParam(defaultValue = "0") double minMagnitud,
        @RequestParam(defaultValue = "10") double maxMagnitud,
        @RequestParam(defaultValue = "100") int limit) {
        
        List<SismoNode> sismos = grafoService.obtenerSismosFiltrados(minMagnitud, maxMagnitud, limit);

        

        // Solo obtener ubicaciones relacionadas con los sismos filtrados
        Set<String> ubicacionIds = sismos.stream()
            .filter(s -> s.getUbicacion() != null)
            .map(s -> s.getUbicacion().getCodigo())
            .collect(Collectors.toSet());
            
        List<UbicacionNode> ubicaciones = grafoService.obtenerUbicacionesPorIds(ubicacionIds);
        
        
        // Preparar nodos para la visualización (formato para bibliotecas como vis.js)
        List<Map<String, Object>> nodos = sismos.stream().map(s -> {
            Map<String, Object> nodo = new HashMap<>();
            nodo.put("id", "sismo_" + s.getCodigo());
            nodo.put("label", "Sismo " + s.getMagnitud());
            nodo.put("group", "sismo");
            nodo.put("title", String.format("Fecha: %s, Magnitud: %s", s.getFecha(), s.getMagnitud()));
            return nodo;
        }).collect(Collectors.toList());
        
        nodos.addAll(ubicaciones.stream().map(u -> {
            Map<String, Object> nodo = new HashMap<>();
            nodo.put("id", "ubicacion_" + u.getCodigo());
            nodo.put("label", u.getNombre());
            nodo.put("group", "ubicacion");
            return nodo;
        }).collect(Collectors.toList()));
        
        // Preparar aristas para la visualización
        List<Map<String, Object>> aristas = sismos.stream().flatMap(s -> {
            List<Map<String, Object>> edges = s.getSismosCercanos().stream().map(cercano -> {
                Map<String, Object> edge = new HashMap<>();
                edge.put("from", "sismo_" + s.getCodigo());
                edge.put("to", "sismo_" + cercano.getCodigo());
                edge.put("label", "CERCANO_A");
                return edge;
            }).collect(Collectors.toList());
            
            List<Map<String, Object>> edgesSimilares = s.getSismosSimilares().stream().map(similar -> {
                Map<String, Object> edge = new HashMap<>();
                edge.put("from", "sismo_" + s.getCodigo());
                edge.put("to", "sismo_" + similar.getCodigo());
                edge.put("label", "SIMILAR_MAGNITUD");
                return edge;
            }).collect(Collectors.toList());
            
            edges.addAll(edgesSimilares);
            
            if (s.getUbicacion() != null) {
                Map<String, Object> edgeUbicacion = new HashMap<>();
                edgeUbicacion.put("from", "sismo_" + s.getCodigo());
                edgeUbicacion.put("to", "ubicacion_" + s.getUbicacion().getCodigo());
                edgeUbicacion.put("label", "OCURRIDO_EN");
                edges.add(edgeUbicacion);
            }
            
            return edges.stream();
        }).collect(Collectors.toList());
        
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("nodes", nodos);
        resultado.put("edges", aristas);
        return resultado;
    }
}