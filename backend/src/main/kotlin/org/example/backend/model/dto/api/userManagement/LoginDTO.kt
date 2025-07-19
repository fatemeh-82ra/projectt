package org.example.backend.model.dto.api.userManagement

import org.example.backend.Enum.userManagement.AuthStatus

data class LoginRequestDTO(
    var username: String,
    var password: String
)

data class LoginResponseDTO(
    var id: Long? = null,
    var username: String? = null,
    var message: String? = null,
    var status: AuthStatus,
)
