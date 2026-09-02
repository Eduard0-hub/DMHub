package com.barberhub.controller;

import com.barberhub.entity.Agendamento;
import com.barberhub.entity.Financeiro;
import com.barberhub.entity.Servico;
import com.barberhub.repository.AgendamentoRepository;
import com.barberhub.repository.FinanceiroRepository;
import com.barberhub.repository.ServicoRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {

    private final AgendamentoRepository repo;
    private final ServicoRepository servicoRepo;
    private final FinanceiroRepository financeiroRepo;

    public AgendamentoController(AgendamentoRepository repo,
                                 ServicoRepository servicoRepo,
                                 FinanceiroRepository financeiroRepo) {
        this.repo = repo;
        this.servicoRepo = servicoRepo;
        this.financeiroRepo = financeiroRepo;
    }

    @GetMapping
    public List<Agendamento> listar() {
        return repo.findAll();
    }

    @GetMapping("/recentes")
    public List<Agendamento> recentes() {
        return repo.findTop10ByOrderByAgdDataDescAgdHorarioDesc();
    }

    @GetMapping("/por-cliente/{cliCodigo}")
    public List<Agendamento> porCliente(@PathVariable Integer cliCodigo) {
        return repo.findByCliCodigoOrderByAgdDataDescAgdHorarioDesc(cliCodigo);
    }

    @GetMapping("/por-barbeiro/{barCodigo}")
    public List<Agendamento> porBarbeiro(@PathVariable Integer barCodigo) {
        return repo.findByBarCodigoOrderByAgdDataDescAgdHorarioDesc(barCodigo);
    }

    /** Horarios ja ocupados (nao cancelados) de um barbeiro numa data. */
    @GetMapping("/disponibilidade")
    public List<String> disponibilidade(@RequestParam Integer barCodigo,
                                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return repo.findByBarCodigoAndAgdData(barCodigo, data).stream()
                .filter(a -> !"Cancelado".equalsIgnoreCase(a.getAgdStatus()))
                .map(Agendamento::getAgdHorario)
                .filter(h -> h != null)
                .map(LocalTime::toString)
                .collect(Collectors.toList());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> criar(@RequestBody Agendamento agendamento) {
        if (agendamento.getAgdStatus() == null) {
            agendamento.setAgdStatus("Agendado");
        }
        if (agendamento.getCliCodigo() != null && agendamento.getCliCodigo() <= 0) {
            agendamento.setCliCodigo(null);
        }
        if (agendamento.getAgdIdentificacao() == null || agendamento.getAgdIdentificacao().isBlank()) {
            agendamento.setAgdIdentificacao("Cliente");
        }

        if (estaOcupado(agendamento.getBarCodigo(), agendamento.getAgdData(),
                agendamento.getAgdHorario(), null)) {
            return ResponseEntity.status(409)
                    .body(Map.of("erro", "Este horario ja esta ocupado para o barbeiro selecionado"));
        }

        if (agendamento.getAgdPreco() == null && agendamento.getSrvCodigo() != null) {
            Optional<Servico> servico = servicoRepo.findById(agendamento.getSrvCodigo());
            servico.ifPresent(s -> agendamento.setAgdPreco(s.getSrvPreco()));
        }

        Agendamento salvo = repo.save(agendamento);

        Financeiro fin = new Financeiro();
        fin.setAgdCodigo(salvo.getAgdCodigo());
        fin.setFinValorPago(salvo.getAgdPreco() != null ? salvo.getAgdPreco() : BigDecimal.ZERO);
        fin.setFinStatus("Pendente");
        fin.setFinDataPagto(salvo.getAgdData() != null ? salvo.getAgdData() : LocalDate.now());
        financeiroRepo.save(fin);

        return ResponseEntity.ok(salvo);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> reagendar(@PathVariable Integer id, @RequestBody Agendamento dados) {
        Optional<Agendamento> existente = repo.findById(id);
        if (existente.isEmpty()) return ResponseEntity.notFound().build();

        Agendamento atual = existente.get();

        Integer barCodigo = dados.getBarCodigo() != null ? dados.getBarCodigo() : atual.getBarCodigo();
        LocalDate data = dados.getAgdData() != null ? dados.getAgdData() : atual.getAgdData();
        LocalTime horario = dados.getAgdHorario() != null ? dados.getAgdHorario() : atual.getAgdHorario();

        if (estaOcupado(barCodigo, data, horario, id)) {
            return ResponseEntity.status(409)
                    .body(Map.of("erro", "Este horario ja esta ocupado para o barbeiro selecionado"));
        }

        atual.setBarCodigo(barCodigo);
        atual.setAgdData(data);
        atual.setAgdHorario(horario);
        if (dados.getSrvCodigo() != null) atual.setSrvCodigo(dados.getSrvCodigo());
        if (dados.getAgdPreco() != null) atual.setAgdPreco(dados.getAgdPreco());
        if (dados.getAgdStatus() != null) atual.setAgdStatus(dados.getAgdStatus());

        return ResponseEntity.ok(repo.save(atual));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> remover(@PathVariable Integer id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        financeiroRepo.deleteAll(financeiroRepo.findByAgdCodigo(id));
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<Agendamento> alterarStatus(@PathVariable Integer id, @RequestBody Map<String, String> dados) {
        Optional<Agendamento> agd = repo.findById(id);
        if (agd.isEmpty()) return ResponseEntity.notFound().build();

        Agendamento atual = agd.get();
        String novoStatus = dados.get("status");
        atual.setAgdStatus(novoStatus);
        repo.save(atual);

        if ("Concluido".equalsIgnoreCase(novoStatus)) {
            financeiroRepo.findByAgdCodigo(id).forEach(fin -> {
                fin.setFinStatus("Pago");
                fin.setFinDataPagto(LocalDate.now());
                financeiroRepo.save(fin);
            });
        } else if ("Cancelado".equalsIgnoreCase(novoStatus)) {
            // Atendimento cancelado nao deve gerar cobranca pendente no financeiro.
            financeiroRepo.findByAgdCodigo(id).forEach(fin -> {
                fin.setFinStatus("Cancelado");
                financeiroRepo.save(fin);
            });
        }

        return ResponseEntity.ok(atual);
    }

    /** true se o barbeiro ja possui agendamento nao cancelado no mesmo dia/horario (ignorando idIgnorar). */
    private boolean estaOcupado(Integer barCodigo, LocalDate data, LocalTime horario, Integer idIgnorar) {
        if (barCodigo == null || data == null || horario == null) return false;
        return repo.findByBarCodigoAndAgdDataAndAgdHorario(barCodigo, data, horario).stream()
                .filter(a -> !"Cancelado".equalsIgnoreCase(a.getAgdStatus()))
                .anyMatch(a -> idIgnorar == null || !a.getAgdCodigo().equals(idIgnorar));
    }
}
