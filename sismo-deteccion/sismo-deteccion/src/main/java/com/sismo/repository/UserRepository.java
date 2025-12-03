package com.sismo.repository;

import com.sismo.model.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserModel, Long> {
    @Query("SELECT u FROM UserModel u JOIN FETCH u.roles WHERE u.username = :username")
    Optional<UserModel> findByUsername(String username);
}