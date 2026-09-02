package com.barberhub.repository;

import com.barberhub.entity.Financeiro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface FinanceiroRepository extends JpaRepository<Financeiro, Integer> {

    @Query("SELECT SUM(f.finValorPago) FROM Financeiro f WHERE f.finStatus = 'Pago'")
    BigDecimal somaTotalRecebido();

    List<Financeiro> findByAgdCodigo(Integer agdCodigo);

    @Query("SELECT AVG(f.finValorPago) FROM Financeiro f")
    BigDecimal ticketMedio();

    @Query("SELECT SUM(f.finValorPago) FROM Financeiro f WHERE f.finStatus = 'Pago' " +
            "AND (:inicio IS NULL OR f.finDataPagto >= :inicio) " +
            "AND (:fim IS NULL OR f.finDataPagto <= :fim)")
    BigDecimal somaRecebidoPorPeriodo(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT AVG(f.finValorPago) FROM Financeiro f WHERE f.finStatus = 'Pago' " +
            "AND (:inicio IS NULL OR f.finDataPagto >= :inicio) " +
            "AND (:fim IS NULL OR f.finDataPagto <= :fim)")
    BigDecimal ticketMedioPorPeriodo(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT f.finDataPagto, SUM(f.finValorPago) FROM Financeiro f " +
            "WHERE (:inicio IS NULL OR f.finDataPagto >= :inicio) " +
            "AND (:fim IS NULL OR f.finDataPagto <= :fim) " +
            "GROUP BY f.finDataPagto ORDER BY f.finDataPagto")
    List<Object[]> faturamentoPorDia(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    List<Financeiro> findTop15ByOrderByFinDataPagtoDescFinCodigoDesc();

    @Query("SELECT COUNT(f) FROM Financeiro f WHERE f.finStatus = :status")
    long countPorStatus(String status);

    @Query("SELECT SUM(f.finValorPago) FROM Financeiro f WHERE f.finDataPagto = :data")
    java.math.BigDecimal somaPorData(java.time.LocalDate data);
}
