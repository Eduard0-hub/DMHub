package com.barberhub.controller;

import com.barberhub.entity.Barbeiro;
import com.barberhub.entity.Cliente;
import com.barberhub.repository.BarbeiroRepository;
import com.barberhub.repository.ClienteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final ClienteRepository clienteRepo;
    private final BarbeiroRepository barbeiroRepo;
    private final PasswordEncoder passwordEncoder;

    public AuthController(ClienteRepository clienteRepo, BarbeiroRepository barbeiroRepo, PasswordEncoder passwordEncoder) {
        this.clienteRepo = clienteRepo;
        this.barbeiroRepo = barbeiroRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> dados) {
        String login = dados.get("login") != null ? dados.get("login") : dados.get("email");
        String senha = dados.get("senha");

        if (login == null || senha == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Email/telefone e senha sao obrigatorios"));
        }

        Optional<Cliente> cliente = clienteRepo.findByLogin(login);
        if (cliente.isPresent() && passwordEncoder.matches(senha, cliente.get().getCliSenha())) {
            return ResponseEntity.ok(cliente.get());
        }

        Optional<Barbeiro> barbeiro = barbeiroRepo.findByLogin(login);
        if (barbeiro.isPresent() && passwordEncoder.matches(senha, barbeiro.get().getBarSenha())) {
            return ResponseEntity.ok(barbeiro.get());
        }

        return ResponseEntity.status(401).body(Map.of("erro", "Email/telefone ou senha invalidos"));
    }
}
