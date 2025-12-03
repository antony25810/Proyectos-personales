package com.sismo.model.graph;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;

import lombok.Data;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@Node("Ubicacion")
public class UbicacionNode {
    @Id
    private String codigo; // Identificador único de negocio, asignado por app
    
    @Property("nombre")
    private String nombre;
    
    @Property("latitud")
    private Double latitud;
    
    // Constructor para asignar un ID automáticamente
    @Property("longitud")
    private Double longitud;

        public UbicacionNode() {
        this.codigo = UUID.randomUUID().toString();
    }
    
    // Relación con sismos ocurridos en esta ubicación
    @Relationship(type = "TIENE_SISMO", direction = Relationship.Direction.OUTGOING)
    private Set<SismoNode> sismos = new HashSet<>();
}