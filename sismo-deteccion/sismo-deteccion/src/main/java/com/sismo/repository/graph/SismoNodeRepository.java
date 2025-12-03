package com.sismo.repository.graph;

import com.sismo.model.graph.SismoNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SismoNodeRepository extends Neo4jRepository<SismoNode, String> {
    
    List<SismoNode> findByMagnitudGreaterThan(Double magnitud);

    @Query("MATCH (s:Sismo) WHERE s.magnitud >= $minMagnitud AND s.magnitud <= $maxMagnitud " +
              "RETURN s LIMIT $limit")
       List<SismoNode> findSismosByMagnitudRange(@Param("minMagnitud") Double minMagnitud, 
                                          @Param("maxMagnitud") Double maxMagnitud,
                                          @Param("limit") Integer limit);
    
    @Query("MATCH (s:Sismo) WHERE s.magnitud > $magnitud RETURN s")
    List<SismoNode> buscarPorMagnitudMayorQue(@Param("magnitud") Double magnitud);
    
    @Query("MATCH (s:Sismo) " +
           "WHERE point.distance(point({latitude: s.latitud, longitude: s.longitud}), " +
           "point({latitude: $lat, longitude: $lon})) <= $distanciaKm * 1000 " +
           "RETURN s")
    List<SismoNode> buscarSismosCercanos(@Param("lat") Double latitud, 
                                         @Param("lon") Double longitud, 
                                         @Param("distanciaKm") Integer distanciaKm);

                                         @Query("MATCH (s:Sismo) WHERE s.magnitud >= $minMagnitud AND s.magnitud <= $maxMagnitud " +
                                         "RETURN s ORDER BY s.fecha DESC LIMIT $limit")
                                  List<SismoNode> findByMagnitudBetweenOrderByFechaDescLimit(
                                      @Param("minMagnitud") Double minMagnitud, 
                                      @Param("maxMagnitud") Double maxMagnitud, 
                                      @Param("limit") Integer limit);
}