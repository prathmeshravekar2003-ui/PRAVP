package com.pravp.backend.service;

import com.pravp.backend.dto.AuthRequest;
import com.pravp.backend.dto.AuthResponse;
import com.pravp.backend.dto.RegisterRequest;
import com.pravp.backend.dto.TokenRefreshRequest;
import com.pravp.backend.model.User;
import com.pravp.backend.repository.UserRepository;
import com.pravp.backend.utils.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

        private final UserRepository userRepository;
        private final JwtUtil jwtUtil;
        private final AuthenticationManager authenticationManager;
        private final PasswordEncoder passwordEncoder;
        private final UserDetailsService userDetailsService;
        private final BatchService batchService;

        public AuthService(UserRepository userRepository, JwtUtil jwtUtil,
                        AuthenticationManager authenticationManager,
                        PasswordEncoder passwordEncoder,
                        UserDetailsService userDetailsService,
                        BatchService batchService) {
                this.userRepository = userRepository;
                this.jwtUtil = jwtUtil;
                this.authenticationManager = authenticationManager;
                this.passwordEncoder = passwordEncoder;
                this.userDetailsService = userDetailsService;
                this.batchService = batchService;
        }

        public AuthResponse register(RegisterRequest request) {
                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new RuntimeException("User already exists");
                }

                User user = new User();
                user.setName(request.getName());
                user.setEmail(request.getEmail());
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                user.setRole(request.getRole());
                user.setRollNo(request.getRollNo());
                
                // Save user first
                userRepository.save(user);

                // Then handle batch assignment
                if (request.getBatchId() != null && !request.getBatchId().isEmpty() && !request.getBatchId().equals("not defined")) {
                    try {
                        batchService.addStudent(request.getBatchId(), request.getEmail());
                    } catch (Exception e) {
                        // Log error but don't fail registration if batch assignment fails
                        // Alternatively, you could choose to throw an exception here
                    }
                }

                var accessToken = jwtUtil.generateToken(user);
                var refreshToken = jwtUtil.generateRefreshToken(user);

                AuthResponse response = new AuthResponse();
                response.setAccessToken(accessToken);
                response.setRefreshToken(refreshToken);
                response.setEmail(user.getEmail());
                response.setName(user.getName());
                response.setRole(user.getRole().name());
                return response;
        }

        public AuthResponse authenticate(AuthRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                var user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow();
                var accessToken = jwtUtil.generateToken(user);
                var refreshToken = jwtUtil.generateRefreshToken(user);

                AuthResponse response = new AuthResponse();
                response.setAccessToken(accessToken);
                response.setRefreshToken(refreshToken);
                response.setEmail(user.getEmail());
                response.setName(user.getName());
                response.setRole(user.getRole().name());
                return response;
        }

        public AuthResponse refreshToken(TokenRefreshRequest request) {
                String email = jwtUtil.extractUsername(request.getRefreshToken());
                var userDetails = userDetailsService.loadUserByUsername(email);

                if (jwtUtil.isTokenValid(request.getRefreshToken(), userDetails)) {
                        var accessToken = jwtUtil.generateToken(userDetails);
                        AuthResponse response = new AuthResponse();
                        response.setAccessToken(accessToken);
                        response.setRefreshToken(request.getRefreshToken());
                        response.setEmail(userDetails.getUsername());
                        // Need to fetch user to get name and role for full response
                        var user = userRepository.findByEmail(email).orElseThrow();
                        response.setName(user.getName());
                        response.setRole(user.getRole().name());
                        return response;
                }
                throw new RuntimeException("Invalid refresh token");
        }
}
