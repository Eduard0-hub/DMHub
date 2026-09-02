package com.barberhub.repository;

import com.barberhub.entity.Barbeiro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BarbeiroRepository extends JpaRepository<Barbeiro, Integer> {
    @Query("SELECT b FROM Barbeiro b WHERE b.barEmail = :login OR b.barTelefone = :login")
    Optional<Barbeiro> findByLogin(@Param("login") String login);
}
