package org.example.backend.model.dto.api.userManagement

import org.example.backend.Enum.userManagement.AuthStatus

data class GetUserResponseDTO(
    var id: Long? = null,
    var username: String? = null,
    var email: String? = null,
    var name: String? = null,
    var status: AuthStatus? = null,
    var message: String? = null
)

data class UserListResponseDTO(
    var users: List<GetUserResponseDTO> = emptyList(),
    var status: AuthStatus? = null,
    var message: String? = null
)


