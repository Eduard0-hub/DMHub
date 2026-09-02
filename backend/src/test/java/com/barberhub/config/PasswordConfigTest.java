package com.barberhub.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordConfigTest {

    @Test
    void deveCodificarESomenteAceitarASenhaCorreta() {
        PasswordEncoder passwordEncoder = new PasswordConfig().passwordEncoder();
        String senha = "senha123";
        String hash = passwordEncoder.encode(senha);

        assertNotEquals(senha, hash);
        assertTrue(passwordEncoder.matches(senha, hash));
        assertFalse(passwordEncoder.matches("senhaIncorreta", hash));
    }
}