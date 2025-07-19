package org.example.backend.model.dto.api.submission

import java.time.LocalDateTime

data class FormSubmissionListDTO(
    val submissionId: Int,
    val userId: Int,
    val submitterName: String,
    val submittedAt: LocalDateTime,
    val formData: Map<String, Any>,
    val status: String
)

data class FormSubmissionsResponse(
    val submissions: List<FormSubmissionListDTO>,
    val totalSubmissions: Long,
    val message: String? = null
) 