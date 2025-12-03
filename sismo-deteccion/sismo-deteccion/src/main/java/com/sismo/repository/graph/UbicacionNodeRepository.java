package com.sismo.repository.graph;

import com.sismo.model.graph.UbicacionNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UbicacionNodeRepository extends Neo4jRepository<UbicacionNode, String> {
    
    Optional<UbicacionNode> findByNombre(String nombre);
    
    @Query("MATCH (u:Ubicacion) " +
           "WHERE point.distance(point({latitude: u.latitud, longitude: u.longitud}), " +
           "point({latitude: $lat, longitude: $lon})) <= 5000 " + // 5km de tolerancia
           "RETURN u LIMIT 1")
    Optional<UbicacionNode> buscarUbicacionCercana(@Param("lat") Double latitud, 
                                                 @Param("lon") Double longitud);
}