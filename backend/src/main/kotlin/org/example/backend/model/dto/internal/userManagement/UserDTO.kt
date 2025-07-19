package org.example.backend.model.dto.internal.userManagement

data class UserDTO(
    var id: Long? = null,
    var username: String? = null,
    var password: String? = null,
    var email: String? = null,
    var name: String? = null
)
