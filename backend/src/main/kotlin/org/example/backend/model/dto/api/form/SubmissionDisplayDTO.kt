package org.example.backend.model.dto.api.form

import org.example.backend.Enum.form.SubmissionStatus
import java.time.OffsetDateTime

data class SubmissionDisplayDTO(
    val id: Int,
    val formId: Int,
    val formTitle: String,
    val status: SubmissionStatus,
    val submittedAt: OffsetDateTime,
    val statusChangedAt: OffsetDateTime?,
    val data: Map<String, Any>,
    val statusChangedBy: String? // Name of the user who changed the status
)

data class SubmissionsPageResponse(
    val submissions: List<SubmissionDisplayDTO>,
    val totalElements: Long,
    val totalPages: Int,
    val currentPage: Int,
    val pageSize: Int
) 