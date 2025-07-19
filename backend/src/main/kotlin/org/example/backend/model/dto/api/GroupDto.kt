package org.example.backend.model.dto.api

data class GroupDto(
    val id: Int,
    val name: String,
    val description: String?,
    val ownerId: Int,
    val members: List<UserDto>
) 