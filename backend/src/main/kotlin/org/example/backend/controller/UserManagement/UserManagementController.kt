package org.example.backend.controller.UserManagement

import org.example.backend.Enum.userManagement.AuthStatus
import org.example.backend.api.userManagement.IUserManagement
import org.example.backend.model.dto.api.userManagement.*
import org.example.backend.model.dto.internal.userManagement.UserDTO
import org.example.backend.service.userManagement.UserManagementService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.slf4j.LoggerFactory

@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:5174"]) // Allow frontend dev server
@RestController
@RequestMapping("/api/user-managements")
class UserManagementController(
    private val userManagementService: UserManagementService,
) : IUserManagement
{
    private val logger = LoggerFactory.getLogger(UserManagementController::class.java)

    @PostMapping("/sign-up")
    override fun signUpUser(@RequestBody request: CreateUserRequestDTO): ResponseEntity<CreateUserResponseDTO> {
        logger.info("Sign-up attempt for username: {} email: {}", request.username, request.email)
        val userDto = UserDTO(
            username = request.username,
            password = request.password,
            email = request.email,
            name = request.name
        )

        val (savedUser, status) = userManagementService.createUser(userDto)
        if (status != AuthStatus.SUCCESS) {
            logger.warn("Sign-up failed for username: {} email: {} status: {}", request.username, request.email, status)
        }
        val response = CreateUserResponseDTO(
            id = savedUser?.id,
            username = savedUser?.username,
            status = status,
            message = when (status) {
                AuthStatus.SUCCESS -> "User created successfully!"
                AuthStatus.USERNAME_EXISTS -> "Username already exists!"
                AuthStatus.EMAIL_EXISTS -> "Email already registered!"
                else -> "User creation failed!"
            }
        )
        val responseStatus = if (status == AuthStatus.SUCCESS) HttpStatus.OK else HttpStatus.BAD_REQUEST
        return ResponseEntity.status(responseStatus).body(response)
    }


    @PostMapping("/login")
    override fun loginUser(@RequestBody request: LoginRequestDTO): ResponseEntity<LoginResponseDTO> {
        logger.info("Login attempt for username: {}", request.username)
        val (user, status) = userManagementService.loginUser(request.username, request.password)
        if (status != AuthStatus.SUCCESS) {
            logger.warn("Login failed for username: {} status: {}", request.username, status)
        }
        val response = LoginResponseDTO(
            id = user?.id, // Add user ID to response
            username = user?.username,
            status = status,
            message = when (status) {
                AuthStatus.SUCCESS -> "Login successful!"
                AuthStatus.USER_NOT_FOUND -> "User not found!"
                AuthStatus.INVALID_CREDENTIALS -> "Invalid credentials!"
                else -> "Login failed!"
            }
        )
        val responseStatus = if (status == AuthStatus.SUCCESS) HttpStatus.OK else HttpStatus.BAD_REQUEST
        return ResponseEntity.status(responseStatus).body(response)
    }

    @DeleteMapping("/{id}")
    override fun deleteUserById(@PathVariable id: Long): ResponseEntity<GetUserResponseDTO> {
        val status = userManagementService.deleteUserById(id)
        val response = GetUserResponseDTO(
            status = status,
            message = if (status == AuthStatus.SUCCESS) "User deleted successfully!" else "User not found!"
        )
        val httpStatus = if (status == AuthStatus.SUCCESS) HttpStatus.OK else HttpStatus.NOT_FOUND
        return ResponseEntity.status(httpStatus).body(response)
    }

    @GetMapping("/{id}")
    override fun getUserById(@PathVariable id: Long): ResponseEntity<GetUserResponseDTO> {
        val (user, status) = userManagementService.getUserById(id)
        val response = GetUserResponseDTO(
            id = user?.id,
            username = user?.username,
            email = user?.email,
            name = user?.name,
            status = status,
            message = if (status == AuthStatus.SUCCESS) "User found." else "User not found."
        )
        val httpStatus = if (status == AuthStatus.SUCCESS) HttpStatus.OK else HttpStatus.NOT_FOUND
        return ResponseEntity.status(httpStatus).body(response)
    }

    @GetMapping("/list")
    override fun getUserList(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<UserListResponseDTO> {
        val users = userManagementService.getUserList(page, size)
        val userResponses = users.map { user ->
            GetUserResponseDTO(
                id = user.id,
                username = user.username,
                email = user.email,
                name = user.name,
                status = AuthStatus.SUCCESS
            )
        }
        val response = UserListResponseDTO(
            users = userResponses,
            status = AuthStatus.SUCCESS,
            message = "Users fetched successfully!"
        )
        return ResponseEntity.ok(response)
    }

    @PutMapping("/{id}")
    override fun updateUserById(
        @PathVariable id: Long,
        @RequestBody updateRequest: UpdateUserRequestDTO
    ): ResponseEntity<GetUserResponseDTO> {
        val (updatedUser, status) = userManagementService.updateUserById(id, updateRequest)
        val response = GetUserResponseDTO(
            id = updatedUser?.id,
            username = updatedUser?.username,
            email = updatedUser?.email,
            name = updatedUser?.name,
            status = status,
            message = when (status) {
                AuthStatus.SUCCESS -> "User updated successfully!"
                AuthStatus.USERNAME_EXISTS -> "Username already exists!"
                AuthStatus.EMAIL_EXISTS -> "Email already registered!"
                AuthStatus.USER_NOT_FOUND -> "User not found!"
                else -> "User update failed!"
            }
        )
        val httpStatus = if (status == AuthStatus.SUCCESS) HttpStatus.OK else HttpStatus.BAD_REQUEST
        return ResponseEntity.status(httpStatus).body(response)
    }



}
