package com.sismo.service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.sismo.model.Sismo;
import com.sismo.repository.SismoRepository;

import jakarta.transaction.Transactional;

@Service
public class SismoService {

    private final SismoRepository sismoRepository;
    private static final Logger logger = LoggerFactory.getLogger(SismoService.class);

    public SismoService(SismoRepository sismoRepository) {
        this.sismoRepository = sismoRepository;
    }

    // Método para obtener todos los sismos
    public List<Sismo> obtenerTodos() {
        return sismoRepository.findAll();
    }

    // Método para filtrar sismos por magnitud
    public List<Sismo> obtenerPorMagnitud(double magnitud) {
        return sismoRepository.findByMagnitudGreaterThan(magnitud);
    }

    @Transactional
    public int cargarSismosDesdeCSV(File csvFile) throws IOException {
        int totalRegistros = 0;
        int registrosProcesados = 0;
        int registrosErroneos = 0;
        Map<String, Integer> erroresPorTipo = new HashMap<>();
        
        try (BufferedReader reader = new BufferedReader(new FileReader(csvFile, StandardCharsets.UTF_8))) {
            // Usar Apache Commons CSV para un manejo más robusto
            CSVParser parser = CSVFormat.DEFAULT
                .withFirstRecordAsHeader()
                .withIgnoreHeaderCase()
                .withTrim()
                .withIgnoreEmptyLines()
                .parse(reader);
            
            // Verificar que las columnas esperadas estén presentes
            Set<String> columnas = parser.getHeaderMap().keySet();
            logger.info("Columnas encontradas en CSV: {}", columnas);
            
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            List<Sismo> sismosBatch = new ArrayList<>();
            
            for (CSVRecord record : parser) {
                try {
                    registrosProcesados++;
                    
                    // Crear un mapa para facilitar el acceso a los campos
                    // Esto hace el código más robusto frente a cambios en el orden de columnas
                    Map<String, String> valores = new HashMap<>();
                    columnas.forEach(columna -> valores.put(columna.toLowerCase(), record.get(columna)));
                    
                    Sismo sismo = new Sismo();
                    boolean errorEnRegistro = false;
                    
                    // --- Procesar fecha ---
                    try {
                        String fechaStr = obtenerValorSeguro(valores, "fecha");
                        sismo.setFecha(LocalDate.parse(fechaStr, dateFormatter));
                    } catch (Exception e) {
                        logger.warn("Registro #{}: Error en formato de fecha: {}", record.getRecordNumber(), e.getMessage());
                        contarError(erroresPorTipo, "fecha_invalida");
                        errorEnRegistro = true;
                        // Usar fecha actual como respaldo
                        sismo.setFecha(LocalDate.now());
                    }
                    
                    sismo.setHora(obtenerValorSeguro(valores, "hora"));
                    
                    // --- Procesar magnitud ---
                    try {
                        String magnitudStr = obtenerValorSeguro(valores, "magnitud");
                        Double magnitud = parseMagnitud(magnitudStr);
                        
                        if (magnitud == 0.0) {
                            logger.debug("Registro #{}: Magnitud parseada como 0.0, valor original: '{}'", 
                                        record.getRecordNumber(), magnitudStr);
                        }
                        
                        sismo.setMagnitud(magnitud);
                    } catch (Exception e) {
                        logger.warn("Registro #{}: Error en magnitud: {}", record.getRecordNumber(), e.getMessage());
                        contarError(erroresPorTipo, "magnitud_invalida");
                        errorEnRegistro = true;
                        sismo.setMagnitud(0.0); // Valor por defecto
                    }
                    
                    // --- Procesar latitud ---
                    try {
                        String latitudStr = obtenerValorSeguro(valores, "latitud");
                        sismo.setLatitud(Double.parseDouble(latitudStr));
                    } catch (Exception e) {
                        logger.warn("Registro #{}: Error en latitud: {}", record.getRecordNumber(), e.getMessage());
                        contarError(erroresPorTipo, "latitud_invalida");
                        errorEnRegistro = true;
                        sismo.setLatitud(0.0); // Valor por defecto
                    }
                    
                    // --- Procesar longitud ---
                    try {
                        String longitudStr = obtenerValorSeguro(valores, "longitud");
                        sismo.setLongitud(Double.parseDouble(longitudStr));
                    } catch (Exception e) {
                        logger.warn("Registro #{}: Error en longitud: {}", record.getRecordNumber(), e.getMessage());
                        contarError(erroresPorTipo, "longitud_invalida");
                        errorEnRegistro = true;
                        sismo.setLongitud(0.0); // Valor por defecto
                    }
                    
                    // --- Procesar profundidad ---
                    try {
                        String profundidadStr = obtenerValorSeguro(valores, "profundidad");
                        sismo.setProfundidad(Double.parseDouble(profundidadStr));
                    } catch (Exception e) {
                        logger.warn("Registro #{}: Error en profundidad: {}", record.getRecordNumber(), e.getMessage());
                        contarError(erroresPorTipo, "profundidad_invalida");
                        errorEnRegistro = true;
                        sismo.setProfundidad(0.0); // Valor por defecto
                    }
                    
                    // El resto de campos no numéricos son más tolerantes a errores
                    sismo.setReferenciaLocalizacion(obtenerValorSeguro(valores, "referencia de localizacion"));
                    
                    try {
                        String fechaUTCStr = obtenerValorSeguro(valores, "fecha utc");
                        sismo.setFechaUTC(LocalDate.parse(fechaUTCStr, dateFormatter));
                    } catch (Exception e) {
                        // Usar fecha normal como respaldo
                        sismo.setFechaUTC(sismo.getFecha());
                    }
                    
                    sismo.setHoraUTC(obtenerValorSeguro(valores, "hora utc"));
                    sismo.setEstatus(obtenerValorSeguro(valores, "estatus"));
                    
                    // Si hubo algún error en el registro, contar como erróneo pero aun así intentar guardarlo
                    if (errorEnRegistro) {
                        registrosErroneos++;
                    }
                    
                    sismosBatch.add(sismo);
                    
                    // Guardar en lotes de 500
                    if (sismosBatch.size() >= 500) {
                        try {
                            sismoRepository.saveAll(sismosBatch);
                            totalRegistros += sismosBatch.size();
                            logger.debug("Guardado lote de {} registros en la base de datos", sismosBatch.size());
                        } catch (Exception e) {
                            logger.error("Error al guardar lote: {}", e.getMessage(), e);
                            guardarRegistrosPorRegistro(sismosBatch);
                        }
                        sismosBatch.clear();
                        
                        // Feedback periódico
                        if (totalRegistros % 2000 == 0) {
                            logger.info("Procesados {} registros (guardados: {}, con errores: {})",
                                    registrosProcesados, totalRegistros, registrosErroneos);
                        }
                    }
                } catch (Exception e) {
                    logger.error("Error inesperado procesando registro #{}: {}", record.getRecordNumber(), e.getMessage(), e);
                    registrosErroneos++;
                    contarError(erroresPorTipo, "error_general");
                }
            }
            
            // Guardar registros restantes
            if (!sismosBatch.isEmpty()) {
                try {
                    sismoRepository.saveAll(sismosBatch);
                    totalRegistros += sismosBatch.size();
                    logger.debug("Guardado lote final de {} registros", sismosBatch.size());
                } catch (Exception e) {
                    logger.error("Error al guardar lote final: {}", e.getMessage(), e);
                    guardarRegistrosPorRegistro(sismosBatch);
                }
            }
            
            // Resumen final
            logger.info("Carga de CSV completada:");
            logger.info("- Total registros procesados: {}", registrosProcesados);
            logger.info("- Registros guardados con éxito: {}", totalRegistros);
            logger.info("- Registros con errores/advertencias: {}", registrosErroneos);
            logger.info("- Desglose de errores por tipo: {}", erroresPorTipo);
            
            return totalRegistros;
        }
    }

    // Método para parsear el valor de magnitud, manejando diferentes formatos
    private Double parseMagnitud(String magnitudStr) {
        if (magnitudStr == null || magnitudStr.trim().isEmpty()) {
            return 0.0; // Valor por defecto en lugar de null
        }
        
        try {
            // Paso 1: Limpiar el string
            String cleaned = magnitudStr.trim();
            
            // Paso 2: Reemplazar comas por puntos (para manejar formato europeo)
            cleaned = cleaned.replace(',', '.');
            
            // Paso 3: Eliminar cualquier carácter que no sea dígito, punto o signo negativo
            cleaned = cleaned.replaceAll("[^0-9.-]", "");
            
            // Paso 4: Si quedó vacío después de la limpieza, devolver valor por defecto
            if (cleaned.isEmpty() || cleaned.equals("-") || cleaned.equals(".")) {
                logger.warn("Valor de magnitud '{}' inválido después de limpieza", magnitudStr);
                return 0.0;
            }
            
            // Paso 5: Si hay múltiples puntos decimales, quedarse solo con el primero
            int firstDot = cleaned.indexOf('.');
            if (firstDot != -1) {
                int lastDot = cleaned.lastIndexOf('.');
                if (firstDot != lastDot) {
                    cleaned = cleaned.substring(0, firstDot + 1) + 
                            cleaned.substring(firstDot + 1).replace(".", "");
                }
            }
            
            // Paso 6: Parsear el valor limpio
            double valor = Double.parseDouble(cleaned);
            
            // Paso 7: Validar que el valor sea razonable para una magnitud de sismo
            if (valor < 0) {
                logger.warn("Magnitud negativa encontrada: {}, se corrige a valor absoluto", valor);
                return Math.abs(valor);
            }
            
            if (valor > 10.0) {
                logger.warn("Magnitud sospechosamente alta: {}, posible error de formato", valor);
                // Opción 1: Devolver un valor máximo razonable
                // return 10.0;
                
                // Opción 2: Intentar corregir (asumiendo que puede ser error de precisión decimal)
                while (valor > 10.0) {
                    valor /= 10;
                }
                logger.info("Magnitud corregida a: {}", valor);
                return valor;
            }
            
            return valor;
        } catch (NumberFormatException e) {
            logger.warn("No se pudo parsear valor de magnitud: '{}', usando valor por defecto", magnitudStr);
            return 0.0; // Retorna un valor por defecto en lugar de null
        }
    }
    
    // Método para obtener un valor de forma segura del mapa de valores
    private String obtenerValorSeguro(Map<String, String> valores, String campo) {
        String valor = valores.getOrDefault(campo.toLowerCase(), "");
        return valor != null ? valor.trim() : "";
    }

    // Método para contar errores por tipo
    private void contarError(Map<String, Integer> erroresPorTipo, String tipoError) {
        erroresPorTipo.put(tipoError, erroresPorTipo.getOrDefault(tipoError, 0) + 1);
    }

    // Método mejorado para guardar registros individuales cuando falla un lote
    private int guardarRegistrosPorRegistro(List<Sismo> sismos) {
        int guardados = 0;
        for (Sismo sismo : sismos) {
            try {
                sismoRepository.save(sismo);
                guardados++;
            } catch (Exception e) {
                logger.warn("Error guardando sismo individual (fecha:{}, magnitud:{}, latitud:{}, longitud:{}): {}",
                        sismo.getFecha(), sismo.getMagnitud(), sismo.getLatitud(), sismo.getLongitud(),
                        e.getMessage());
            }
        }
        logger.info("De {} registros en el lote fallido, se salvaron {} individualmente", sismos.size(), guardados);
        return guardados;
    }
        
    // Método para cargar desde MultipartFile (wrapper del método principal)
    @Transactional
    public int cargarSismosDesdeCSV(MultipartFile file) throws IOException {
        // Crear archivo temporal
        File tempFile = File.createTempFile("sismos_upload_", ".csv");
        file.transferTo(tempFile);
        
        try {
            return cargarSismosDesdeCSV(tempFile);
        } finally {
            // Limpiar archivo temporal
            if (tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

}
