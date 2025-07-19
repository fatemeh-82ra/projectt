package org.example.backend.unit

import UserManagementService
import UserModel
import UserRepository
import io.mockk.*
import org.example.backend.Enum.userManagement.AuthStatus
import org.example.backend.model.dto.api.userManagement.UpdateUserRequestDTO
import org.example.backend.model.dto.internal.userManagement.UserDTO
import org.junit.jupiter.api.*
import org.springframework.security.crypto.password.PasswordEncoder
import java.util.*

class UserManagementServiceTest {

    private val userRepository = mockk<UserRepository>()
    private val passwordEncoder = mockk<PasswordEncoder>()
    private lateinit var service: UserManagementService

    @BeforeEach
    fun setup() {
        service = UserManagementService(userRepository, passwordEncoder)
    }

    @Test
    fun `createUser should succeed if username and email don't exist`() {
        every { userRepository.existsByUsername("testuser") } returns false
        every { userRepository.existsByEmail("test@test.com") } returns false
        every { passwordEncoder.encode(any()) } returns "hashed"
        every { userRepository.save(any()) } answers { firstArg() }

        val userDTO = UserDTO(
            username = "testuser",
            password = "secret",
            email = "test@test.com",
            name = "Test"
        )

        val (result, status) = service.createUser(userDTO)

        Assertions.assertNotNull(result)
        Assertions.assertEquals(AuthStatus.SUCCESS, status)
        verify(exactly = 1) { userRepository.save(any()) }
    }

    @Test
    fun `createUser should fail if username exists`() {
        every { userRepository.existsByUsername("testuser") } returns true

        val userDTO = UserDTO(
            username = "testuser",
            password = "secret",
            email = "test@test.com",
            name = "Test"
        )

        val (result, status) = service.createUser(userDTO)
        Assertions.assertNull(result)
        Assertions.assertEquals(AuthStatus.USERNAME_EXISTS, status)
    }

    @Test
    fun `loginUser should succeed if credentials are correct`() {
        val user = UserModel(
            id = 1L, username = "a", password = "hashed", email = "e", name = "n"
        )
        every { userRepository.findByUsername("a") } returns user
        every { passwordEncoder.matches("pw", "hashed") } returns true

        val (result, status) = service.loginUser("a", "pw")
        Assertions.assertEquals(user, result)
        Assertions.assertEquals(AuthStatus.SUCCESS, status)
    }

    @Test
    fun `loginUser should fail if password is wrong`() {
        val user = UserModel(
            id = 1L, username = "a", password = "hashed", email = "e", name = "n"
        )
        every { userRepository.findByUsername("a") } returns user
        every { passwordEncoder.matches("wrong", "hashed") } returns false

        val (result, status) = service.loginUser("a", "wrong")
        Assertions.assertNull(result)
        Assertions.assertEquals(AuthStatus.INVALID_CREDENTIALS, status)
    }

    @Test
    fun `deleteUserById returns not found if user missing`() {
        every { userRepository.existsById(5L) } returns false
        val status = service.deleteUserById(5L)
        Assertions.assertEquals(AuthStatus.USER_NOT_FOUND, status)
    }

    @Test
    fun `deleteUserById deletes and returns success`() {
        every { userRepository.existsById(1L) } returns true
        every { userRepository.deleteById(1L) } just Runs
        val status = service.deleteUserById(1L)
        Assertions.assertEquals(AuthStatus.SUCCESS, status)
        verify { userRepository.deleteById(1L) }
    }

    @Test
    fun `updateUserById updates allowed fields and encodes pass`() {
        val user = UserModel(
            id = 1L, username = "old", password = "p", email = "e", name = "n"
        )
        every { userRepository.findById(1L) } returns Optional.of(user)
        every { userRepository.existsByUsername("newuser") } returns false
        every { userRepository.existsByEmail("new@email.com") } returns false
        every { passwordEncoder.encode("newpass") } returns "hashed"
        every { userRepository.save(any<UserModel>()) } answers { firstArg() }

        val req = UpdateUserRequestDTO(
            username = "newuser", email = "new@email.com", password = "newpass", name = "new"
        )

        val (result, status) = service.updateUserById(1L, req)

        Assertions.assertEquals(AuthStatus.SUCCESS, status)
        Assertions.assertEquals("newuser", result?.username)
        Assertions.assertEquals("new@email.com", result?.email)
        Assertions.assertEquals("hashed", result?.password)
        Assertions.assertEquals("new", result?.name)
    }
}
