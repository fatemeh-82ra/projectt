package org.example.backend.model.dto.api.form

import jakarta.validation.constraints.NotNull

data class FormSubmissionRequest(
    @field:NotNull(message = "Form data is required")
    val data: Map<String, Any>,

    val formId: Int
) 