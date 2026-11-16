package io.trackflow.service;

import io.trackflow.config.JwtTokenProvider;
import io.trackflow.dto.AuthRequest;
import io.trackflow.dto.AuthResponse;
import io.trackflow.dto.RegisterRequest;
import io.trackflow.dto.UserDto;
import io.trackflow.entity.User;
import io.trackflow.exception.BadRequestException;
import io.trackflow.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String token = tokenProvider.generateToken(user);
        return new AuthResponse(token, new UserDto(user));
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                io.trackflow.entity.Role.DEVELOPER,
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
                request.getTitle() != null ? request.getTitle() : "Software Engineer",
                request.getDepartment() != null ? request.getDepartment() : "Engineering"
        );

        User savedUser = userRepository.save(user);
        String token = tokenProvider.generateToken(savedUser);
        return new AuthResponse(token, new UserDto(savedUser));
    }
}
