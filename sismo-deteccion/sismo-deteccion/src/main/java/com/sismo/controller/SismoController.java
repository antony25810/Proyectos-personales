package com.sismo.controller;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sismo.model.Sismo;
import com.sismo.service.SismoService;

@RestController
@RequestMapping("/api/sismos")
public class SismoController {
    private final SismoService sismoService;
    private static final Logger logger = LoggerFactory.getLogger(SismoController.class);

    public SismoController(SismoService sismoService) {
        this.sismoService = sismoService;
    }

    // Endpoint para obtener todos los sismos
    @GetMapping
    public List<Sismo> obtenerTodos() {
        return sismoService.obtenerTodos();
    }

    // Endpoint para obtener sismos por magnitud mínima
    @GetMapping("/magnitud/{minMagnitud}")
    public List<Sismo> obtenerPorMagnitud(@PathVariable double minMagnitud) {
        return sismoService.obtenerPorMagnitud(minMagnitud);
    }

    // Endpoint para cargar datos desde un CSV
    @PostMapping("/cargar")
    public ResponseEntity<Map<String, Object>> cargarDesdeCSV(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            logger.error("Archivo CSV vacío recibido");
            return ResponseEntity.badRequest().body(Map.of(
                "estado", "error", 
                "mensaje", "El archivo está vacío"
            ));
        }
        
        logger.info("Recibido archivo CSV: {}, tamaño: {} bytes", 
                file.getOriginalFilename(), file.getSize());
        
        try {
            // Crear directorio temporal si no existe
            File tempDir = new File("/tmp/sismos-csv");
            if (!tempDir.exists()) {
                tempDir.mkdirs();
            }
            
            // Guardar el archivo en un lugar conocido
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            File csvFile = new File(tempDir, timestamp + "_" + file.getOriginalFilename());
            file.transferTo(csvFile);
            logger.info("Archivo guardado temporalmente en: {}", csvFile.getAbsolutePath());
            
            // PROCESAMIENTO SÍNCRONO - SIN CompletableFuture
            logger.info("Iniciando procesamiento SÍNCRONO de: {}", csvFile.getName());
            long startTime = System.currentTimeMillis();
            int totalRegistros = sismoService.cargarSismosDesdeCSV(csvFile);
            long endTime = System.currentTimeMillis();
            logger.info("Procesamiento completado: {} registros en {} ms", 
                    totalRegistros, (endTime - startTime));
            
            // Eliminar el archivo temporal
            if (csvFile.exists()) {
                boolean deleted = csvFile.delete();
                logger.info("Archivo temporal eliminado: {}", deleted);
            }
            
            // Verificar que los datos se guardaron realmente
            long totalEnBD = sismoService.obtenerTodos().size();
            logger.info("Total de registros en BD después de la carga: {}", totalEnBD);
            
            return ResponseEntity.ok().body(Map.of(
                "estado", "completado", 
                "mensaje", "Archivo procesado correctamente.",
                "registrosProcesados", totalRegistros,
                "totalEnBaseDatos", totalEnBD,
                "timestamp", timestamp,
                "nombreArchivo", file.getOriginalFilename()
            ));
            
        } catch (Exception e) {
            logger.error("Error al procesar archivo CSV: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "estado", "error", 
                "mensaje", "Error al procesar el archivo: " + e.getMessage()
            ));
        }
    }
    
    // Endpoint para verificar estado del procesamiento
    @GetMapping("/cargar/estado/{timestamp}")
    public ResponseEntity<Map<String, Object>> verificarEstadoProcesamiento(@PathVariable String timestamp) {
        // Implementar lógica para verificar el estado si es necesario
        // Podrías usar una tabla en BD o un servicio para almacenar estados
        return ResponseEntity.ok(Map.of("estado", "completado"));
    }
}

