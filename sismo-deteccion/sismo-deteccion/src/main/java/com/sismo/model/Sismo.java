package com.sismo.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "sismos")
public class Sismo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "hora")
    private String hora;

    @Column(nullable = true)
    private Double magnitud;
    
    @Column(name = "latitud")
    private double latitud;

    @Column(name = "longitud")
    private double longitud;

    @Column(name = "profundidad")
    private double profundidad;

    @Column(name = "referencia_localizacion")
    private String referenciaLocalizacion;
    
    @Column(name = "fecha_utc")
    private LocalDate fechaUTC;
    
    @Column(name = "hora_utc")
    private String horaUTC;

    @Column(name = "estatus")
    private String estatus;
}

