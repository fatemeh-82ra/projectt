package org.example.backend.model.dto.api.userManagement

data class UpdateUserRequestDTO(
    var username: String? = null,
    var password: String? = null,
    var email: String? = null,
    var name: String? = null
)
