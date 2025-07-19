package org.example.backend.model.dto.api.form

data class FormDeletionResponse(
    val formId: Int,
    val message: String,
    val submissionsUpdated: Int
) 