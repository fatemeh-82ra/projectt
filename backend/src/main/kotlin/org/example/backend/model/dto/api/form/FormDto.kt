package org.example.backend.model.dto.api.form

import java.time.OffsetDateTime

// DTO for returning form details

data class FormDto(
    val id: Int?,
    val title: String,
    val description: String?,
    val schema: Map<String, Any>, // Accept JSON object
    val ownerId: Int,
    val groupId: Int?,
    val createdAt: OffsetDateTime?,
    val updatedAt: OffsetDateTime?,
    val isActive: Boolean
) 