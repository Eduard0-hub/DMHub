package com.barberhub.controller;

import com.barberhub.entity.Cliente;
import com.barberhub.repository.ClienteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteRepository repo;
    private final PasswordEncoder passwordEncoder;

    public ClienteController(ClienteRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<Cliente> listar() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> buscar(@PathVariable Integer id) {
        Optional<Cliente> cliente = repo.findById(id);
        return cliente.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    /** Busca um cliente pelo e-mail (evita expor a lista inteira no front). */
    @GetMapping("/por-email")
    public ResponseEntity<Cliente> porEmail(@RequestParam String email) {
        return repo.findByCliEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Cliente cliente) {
        boolean semEmail = cliente.getCliEmail() == null || cliente.getCliEmail().isBlank();
        boolean semTelefone = cliente.getCliTelefone() == null || cliente.getCliTelefone().isBlank();
        if (semEmail && semTelefone || cliente.getCliSenha() == null || cliente.getCliSenha().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Informe email ou telefone e senha"));
        }
        if (cliente.getCliCriado() == null) {
            cliente.setCliCriado(LocalDateTime.now());
        }
        cliente.setCliSenha(passwordEncoder.encode(cliente.getCliSenha()));
        Cliente salvo = repo.save(cliente);
        return ResponseEntity.ok(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> atualizar(@PathVariable Integer id, @RequestBody Cliente dados) {
        Optional<Cliente> existente = repo.findById(id);
        if (existente.isEmpty()) return ResponseEntity.notFound().build();

        Cliente atual = existente.get();
        if (dados.getCliNome() != null) atual.setCliNome(dados.getCliNome());
        if (dados.getCliEmail() != null) atual.setCliEmail(dados.getCliEmail());
        if (dados.getCliTelefone() != null) atual.setCliTelefone(dados.getCliTelefone());
        if (dados.getCliSenha() != null && !dados.getCliSenha().isBlank()) {
            atual.setCliSenha(passwordEncoder.encode(dados.getCliSenha()));
        }
        return ResponseEntity.ok(repo.save(atual));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Integer id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
