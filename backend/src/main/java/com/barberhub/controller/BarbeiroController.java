package com.barberhub.controller;

import com.barberhub.entity.Barbeiro;
import com.barberhub.repository.BarbeiroRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/barbeiros")
public class BarbeiroController {

    private final BarbeiroRepository repo;
    private final PasswordEncoder passwordEncoder;

    public BarbeiroController(BarbeiroRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<Barbeiro> listar() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Barbeiro> buscar(@PathVariable Integer id) {
        Optional<Barbeiro> barbeiro = repo.findById(id);
        return barbeiro.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Barbeiro barbeiro) {
        boolean semEmail = barbeiro.getBarEmail() == null || barbeiro.getBarEmail().isBlank();
        boolean semTelefone = barbeiro.getBarTelefone() == null || barbeiro.getBarTelefone().isBlank();
        if (semEmail && semTelefone || barbeiro.getBarSenha() == null || barbeiro.getBarSenha().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Informe email ou telefone e senha"));
        }
        if (barbeiro.getBarAtivo() == null) {
            barbeiro.setBarAtivo(true);
        }
        barbeiro.setBarSenha(passwordEncoder.encode(barbeiro.getBarSenha()));
        Barbeiro salvo = repo.save(barbeiro);
        return ResponseEntity.ok(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Barbeiro> atualizar(@PathVariable Integer id, @RequestBody Barbeiro dados) {
        Optional<Barbeiro> existente = repo.findById(id);
        if (existente.isEmpty()) return ResponseEntity.notFound().build();

        Barbeiro atual = existente.get();
        if (dados.getBarNome() != null) atual.setBarNome(dados.getBarNome());
        if (dados.getBarEmail() != null) atual.setBarEmail(dados.getBarEmail());
        if (dados.getBarTelefone() != null) atual.setBarTelefone(dados.getBarTelefone());
        if (dados.getBarEspecialidade() != null) atual.setBarEspecialidade(dados.getBarEspecialidade());
        if (dados.getBarAtivo() != null) atual.setBarAtivo(dados.getBarAtivo());
        if (dados.getBarSenha() != null && !dados.getBarSenha().isBlank()) {
            atual.setBarSenha(passwordEncoder.encode(dados.getBarSenha()));
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
