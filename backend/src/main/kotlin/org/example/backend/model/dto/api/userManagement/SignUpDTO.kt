package org.example.backend.model.dto.api.userManagement

import org.example.backend.Enum.userManagement.AuthStatus


data class CreateUserRequestDTO(
    var username: String,
    var password: String,
    var email: String,
    var name: String
)
data class CreateUserResponseDTO(
    var id: Long? = null,
    var username: String? = null,
    var message: String? = null,
    var status: AuthStatus,
)
