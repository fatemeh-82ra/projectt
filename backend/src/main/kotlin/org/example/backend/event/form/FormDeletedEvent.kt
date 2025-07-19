package org.example.backend.event.form

data class FormDeletedEvent(
    val formId: Int,
    val ownerId: Int,
    val deletedAt: java.time.OffsetDateTime = java.time.OffsetDateTime.now()
) 