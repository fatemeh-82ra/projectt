package org.example.backend.model.dto.api

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CreateGroupRequest(
    @field:NotBlank(message = "Group name is required")
    @field:Size(max = 50, message = "Group name must be less than 50 characters")
    val name: String,

    @field:Size(max = 200, message = "Description must be less than 200 characters")
    val description: String?,

    val memberIds: List<Int> = emptyList()
)
