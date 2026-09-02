package com.barberhub.controller;

import com.barberhub.entity.Agendamento;
import com.barberhub.entity.Cliente;
import com.barberhub.entity.Financeiro;
import com.barberhub.entity.Servico;
import com.barberhub.repository.AgendamentoRepository;
import com.barberhub.repository.ClienteRepository;
import com.barberhub.repository.FinanceiroRepository;
import com.barberhub.repository.ServicoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/financeiro")
public class FinanceiroController {

    private final FinanceiroRepository repo;
    private final AgendamentoRepository agendamentoRepo;
    private final ClienteRepository clienteRepo;
    private final ServicoRepository servicoRepo;

    public FinanceiroController(FinanceiroRepository repo,
                                AgendamentoRepository agendamentoRepo,
                                ClienteRepository clienteRepo,
                                ServicoRepository servicoRepo) {
        this.repo = repo;
        this.agendamentoRepo = agendamentoRepo;
        this.clienteRepo = clienteRepo;
        this.servicoRepo = servicoRepo;
    }

    @GetMapping
    public List<Financeiro> listar() {
        return repo.findAll();
    }

    @GetMapping("/recentes")
    public List<Map<String, Object>> recentes() {
        Map<Integer, String> nomesClientes = new HashMap<>();
        for (Cliente c : clienteRepo.findAll()) {
            nomesClientes.put(c.getCliCodigo(), c.getCliNome());
        }

        Map<Integer, String> nomesServicos = new HashMap<>();
        for (Servico s : servicoRepo.findAll()) {
            nomesServicos.put(s.getSrvCodigo(), s.getSrvNome());
        }

        List<Financeiro> financeiros = repo.findTop15ByOrderByFinDataPagtoDescFinCodigoDesc();

        // Carrega todos os agendamentos referenciados de uma vez (evita N+1)
        List<Integer> agdCodigos = financeiros.stream()
                .map(Financeiro::getAgdCodigo)
                .filter(c -> c != null)
                .distinct()
                .collect(Collectors.toList());
        Map<Integer, Agendamento> agendamentos = new HashMap<>();
        for (Agendamento a : agendamentoRepo.findAllById(agdCodigos)) {
            agendamentos.put(a.getAgdCodigo(), a);
        }

        List<Map<String, Object>> resposta = new ArrayList<>();
        for (Financeiro f : financeiros) {
            Map<String, Object> item = new HashMap<>();
            item.put("finCodigo", f.getFinCodigo());
            item.put("finValorPago", f.getFinValorPago());
            item.put("finStatus", f.getFinStatus());
            item.put("finDataPagto", f.getFinDataPagto());

            Agendamento a = f.getAgdCodigo() != null ? agendamentos.get(f.getAgdCodigo()) : null;
            if (a != null) {
                item.put("horario", a.getAgdHorario());
                item.put("cliente", nomesClientes.getOrDefault(a.getCliCodigo(), "Cliente avulso"));
                item.put("servico", nomesServicos.getOrDefault(a.getSrvCodigo(), "Servico"));
                item.put("statusAgendamento", a.getAgdStatus());
            } else {
                item.put("horario", null);
                item.put("cliente", "Cliente avulso");
                item.put("servico", "Servico");
                item.put("statusAgendamento", "Concluido");
            }
            resposta.add(item);
        }
        return resposta;
    }

    @GetMapping("/resumo")
    public Map<String, Object> resumo() {
        BigDecimal total = repo.somaTotalRecebido();
        if (total == null) total = BigDecimal.ZERO;

        BigDecimal hoje = repo.somaPorData(LocalDate.now());
        if (hoje == null) hoje = BigDecimal.ZERO;

        BigDecimal ticket = repo.ticketMedio();
        if (ticket == null) ticket = BigDecimal.ZERO;

        long pagos = repo.countPorStatus("Pago");
        long pendentes = repo.countPorStatus("Pendente");

        Map<String, Object> r = new HashMap<>();
        r.put("totalRecebido", total);
        r.put("recebidoHoje", hoje);
        r.put("ticketMedio", ticket);
        r.put("pagamentosPagos", pagos);
        r.put("pagamentosPendentes", pendentes);
        return r;
    }

    @PostMapping
    public Financeiro criar(@RequestBody Financeiro financeiro) {
        if (financeiro.getFinDataPagto() == null) {
            financeiro.setFinDataPagto(LocalDate.now());
        }
        if (financeiro.getFinStatus() == null) {
            financeiro.setFinStatus("Pendente");
        }
        return repo.save(financeiro);
    }

    @PutMapping("/{id}/pagar")
    @Transactional
    public ResponseEntity<Financeiro> marcarComoPago(@PathVariable Integer id) {
        Optional<Financeiro> f = repo.findById(id);
        if (f.isEmpty()) return ResponseEntity.notFound().build();
        Financeiro atual = f.get();
        atual.setFinStatus("Pago");
        atual.setFinDataPagto(LocalDate.now());
        Financeiro salvo = repo.save(atual);

        // Reflete o pagamento na agenda: o atendimento correspondente passa a Concluido.
        if (atual.getAgdCodigo() != null) {
            agendamentoRepo.findById(atual.getAgdCodigo()).ifPresent(agd -> {
                if (!"Cancelado".equalsIgnoreCase(agd.getAgdStatus())) {
                    agd.setAgdStatus("Concluido");
                    agendamentoRepo.save(agd);
                }
            });
        }

        return ResponseEntity.ok(salvo);
    }
}
