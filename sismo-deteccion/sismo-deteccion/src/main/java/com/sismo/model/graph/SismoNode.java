package com.sismo.model.graph;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;
import org.springframework.data.neo4j.core.schema.Property;
import lombok.Data;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Data
@Node("Sismo")
public class SismoNode {
    @Id
    private String codigo; // Identificador único de negocio, asignado por app

    @Property("fecha")
    private LocalDate fecha;

    @Property("hora")
    private String hora;

    @Property("magnitud")
    private Double magnitud;

    @Property("latitud")
    private Double latitud;

    @Property("longitud")
    private Double longitud;

    @Property("profundidad")
    private Double profundidad;

    @Property("referencia_localizacion")
    private String referenciaLocalizacion;

    @Property("fecha_utc")
    private LocalDate fechaUTC;

    @Property("hora_utc")
    private String horaUTC;

    @Property("estatus")
    private String estatus;

    @Relationship(type = "OCURRIDO_EN", direction = Relationship.Direction.OUTGOING)
    private UbicacionNode ubicacion;

    @Relationship(type = "CERCANO_A", direction = Relationship.Direction.OUTGOING)
    private Set<SismoNode> sismosCercanos = new HashSet<>();

    @Relationship(type = "SIMILAR_MAGNITUD", direction = Relationship.Direction.OUTGOING)
    private Set<SismoNode> sismosSimilares = new HashSet<>();
}