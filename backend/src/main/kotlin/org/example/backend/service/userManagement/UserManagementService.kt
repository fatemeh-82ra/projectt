package org.example.backend.service.userManagement

import org.example.backend.Enum.userManagement.AuthStatus
import org.example.backend.model.dto.api.userManagement.UpdateUserRequestDTO
import org.example.backend.model.dto.internal.userManagement.UserDTO
import org.example.backend.repository.userManagement.UserModelRepository
import org.example.backend.model.database.UserModel
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service

@Service
class UserManagementService(
    val userModelRepository: UserModelRepository
) {
    fun createUser(user: UserDTO): Pair<UserModel?, AuthStatus> {
        if (userModelRepository.existsByUsername(user.username!!)) {
            return Pair(null, AuthStatus.USERNAME_EXISTS)
        }

        if (userModelRepository.existsByEmail(user.email!!)) {
            return Pair(null, AuthStatus.EMAIL_EXISTS)
        }

        val newUser = UserModel(
            username = user.username!!,
            password = user.password!!, // Store as plain text
            email = user.email!!,
            name = user.name!!
        )
        val savedUser = userModelRepository.save(newUser)
        return Pair(savedUser, AuthStatus.SUCCESS)
    }

    fun loginUser(username: String, password: String): Pair<UserModel?, AuthStatus> {
        val user = userModelRepository.findByUsername(username)
            ?: return Pair(null, AuthStatus.USER_NOT_FOUND)

        if (password != user.password) {
            return Pair(null, AuthStatus.INVALID_CREDENTIALS)
        }

        return Pair(user, AuthStatus.SUCCESS)
    }

    fun deleteUserById(id: Long): AuthStatus {
        if (!userModelRepository.existsById(id)) {
            return AuthStatus.USER_NOT_FOUND
        }
        userModelRepository.deleteById(id)
        return AuthStatus.SUCCESS
    }

    fun getUserById(id: Long): Pair<UserModel?, AuthStatus> {
        val user = userModelRepository.findById(id).orElse(null)
        return if (user != null) {
            Pair(user, AuthStatus.SUCCESS)
        } else {
            Pair(null, AuthStatus.USER_NOT_FOUND)
        }
    }

    fun getUserList(page: Int, size: Int): List<UserModel> {
        val pageable = PageRequest.of(page, size, Sort.by("id").ascending())
        val pageResult = userModelRepository.findAll(pageable)
        return pageResult.content
    }

    fun updateUserById(id: Long, updateRequest: UpdateUserRequestDTO): Pair<UserModel?, AuthStatus> {
        val user = userModelRepository.findById(id).orElse(null)
            ?: return Pair(null, AuthStatus.USER_NOT_FOUND)

        // Check for potential updates
        updateRequest.username?.let {
            // Optional: check if new username already exists
            if (it != user.username && userModelRepository.existsByUsername(it)) {
                return Pair(null, AuthStatus.USERNAME_EXISTS)
            }
            user.username = it
        }

        updateRequest.email?.let {
            if (it != user.email && userModelRepository.existsByEmail(it)) {
                return Pair(null, AuthStatus.EMAIL_EXISTS)
            }
            user.email = it
        }

        updateRequest.password?.let {
            user.password = it // Store as plain text
        }

        updateRequest.name?.let {
            user.name = it
        }

        val updatedUser = userModelRepository.save(user)
        return Pair(updatedUser, AuthStatus.SUCCESS)
    }
}
