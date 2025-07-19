package org.example.backend.model.dto.api.form

import java.time.OffsetDateTime

data class AvailableFormDTO(
    val id: Int,
    val title: String,
    val description: String?,
    val ownerName: String,
    val createdAt: OffsetDateTime,
    val isGroupForm: Boolean,
    val groupName: String?
)

data class AvailableFormsResponse(
    val forms: List<AvailableFormDTO>,
    val totalElements: Long,
    val totalPages: Int,
    val currentPage: Int,
    val pageSize: Int,
    val message: String? = null
) 