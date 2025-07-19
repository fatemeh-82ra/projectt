package org.example.backend.model.dto.api.form

import org.example.backend.Enum.form.SubmissionStatus
import java.time.OffsetDateTime

data class FormSubmissionResponse(
    val id: Int,
    val formId: Int,
    val status: SubmissionStatus,
    val submittedAt: OffsetDateTime,
    val message: String
) 