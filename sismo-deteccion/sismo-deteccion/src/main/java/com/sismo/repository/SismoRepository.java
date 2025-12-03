package com.sismo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sismo.model.Sismo;

@Repository
public interface SismoRepository extends JpaRepository<Sismo, Long> {
    List<Sismo> findByMagnitudGreaterThan(double magnitud);
}

