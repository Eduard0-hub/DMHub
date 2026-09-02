package com.barberhub.repository;

import com.barberhub.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    Optional<Cliente> findByCliEmail(String cliEmail);

    @Query("SELECT c FROM Cliente c WHERE c.cliEmail = :login OR c.cliTelefone = :login")
    Optional<Cliente> findByLogin(@Param("login") String login);
}
