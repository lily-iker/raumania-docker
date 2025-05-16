package com.fragrance.raumania.service.implement;

import com.fragrance.raumania.dto.request.user.CreateUserRequest;
import com.fragrance.raumania.dto.request.user.UpdatePasswordRequest;
import com.fragrance.raumania.dto.request.user.UpdateUserRequest;
import com.fragrance.raumania.dto.response.PageResponse;
import com.fragrance.raumania.dto.response.user.MyInfoResponse;
import com.fragrance.raumania.dto.response.user.UserResponse;
import com.fragrance.raumania.exception.InvalidDataException;
import com.fragrance.raumania.exception.ResourceNotFoundException;
import com.fragrance.raumania.mapper.UserMapper;
import com.fragrance.raumania.model.authorization.Role;
import com.fragrance.raumania.model.cart.Cart;
import com.fragrance.raumania.model.user.User;
import com.fragrance.raumania.repository.CartRepository;
import com.fragrance.raumania.repository.RoleRepository;
import com.fragrance.raumania.repository.UserRepository;
import com.fragrance.raumania.service.CloudinaryService;
import com.fragrance.raumania.service.interfaces.UserService;
import com.fragrance.raumania.utils.SortUtils;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final CloudinaryService cloudinaryService;
    private final CartRepository cartRepository;
    private final SortUtils sortUtils;

    @Override
    public MyInfoResponse getMyInfo() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        User user = (User) securityContext.getAuthentication().getPrincipal();

        return userMapper.toMyInfoResponse(user);
    }

    @Override
    @Transactional
    public MyInfoResponse updateMyInfo(UpdateUserRequest request, MultipartFile imageFile) throws IOException {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        User user = (User) securityContext.getAuthentication().getPrincipal();

        User me = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + user.getId()));

        me.setFullName(request.getFullName());
        me.setPhoneNumber(request.getPhoneNumber());

        // ✅ Upload new profile image if provided
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(imageFile);
            me.setImageUrl(imageUrl);
        } else {
            me.setImageUrl(request.getImageUrl());
        }

        userRepository.save(me);

        return userMapper.toMyInfoResponse(me);
    }

    @Override
    @Transactional
    public void updateMyPassword(UpdatePasswordRequest request) {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        User user = (User) securityContext.getAuthentication().getPrincipal();

        User me = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + user.getId()));

        // Validate current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), me.getPassword())) {
            throw new InvalidDataException("Current password is incorrect");
        }

        // Check if new password and confirm password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new InvalidDataException("New password and confirm password do not match");
        }

        // Encode and set the new password
        me.setPassword(passwordEncoder.encode(request.getNewPassword()));
    }

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        // Check if email or username already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceNotFoundException("Email is already in use");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResourceNotFoundException("Username is already taken");
        }

        Role role = roleRepository.findByName(request.getRoleName())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .isActive(true)
                .emailVerified(false)
                .role(role)
                .build();

        user = userRepository.save(user);

        Cart cart = new Cart();
        cart.setUser(user);

        cartRepository.save(cart);

        return userMapper.toUserResponse(user);
    }

    @Override
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setImageUrl(request.getImageUrl());
        user.setIsActive(request.getIsActive());
        return userMapper.toUserResponse(user);
    }

    @Override
    public UUID deleteUser(UUID id) {
        userRepository.deleteById(id);
        return id;
    }

    @Override
    public PageResponse<?> getAllUsers(int pageNumber, int pageSize, String sortBy, String sortDirection) {
        if (pageNumber < 1) {
            pageNumber = 1;
        }

        Sort sort = sortUtils.buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(pageNumber - 1, pageSize, sort);

        Page<User> usersPage = userRepository.findAll(pageable);

        var userResponses = usersPage.getContent().stream().map(userMapper::toUserResponse).toList();

        return PageResponse.builder()
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .totalElements(usersPage.getTotalElements())
                .totalPages(usersPage.getTotalPages())
                .content(userResponses)
                .build();
    }

    @Override
    public PageResponse<?> searchUsers(int pageNumber, int pageSize, String sortBy, String sortDirection, String name) {
        if (pageNumber < 1) {
            pageNumber = 1;
        }
        Sort sort = sortUtils.buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(pageNumber - 1, pageSize, sort);

        Page<User> usersPage = userRepository.searchByFullName(name, pageable);

        var userResponses = usersPage.getContent().stream().map(userMapper::toUserResponse).toList();

        return PageResponse.builder()
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .totalElements(usersPage.getTotalElements())
                .totalPages(usersPage.getTotalPages())
                .content(userResponses)
                .build();
    }

}


