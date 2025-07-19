package org.example.backend.model.dto.api.form

data class CreateFormRequest(
    val title: String,
    val description: String?,
    val schema: Map<String, Any>, // Accept JSON object
    val groupId: Int? = null // Optional, for group forms
) 