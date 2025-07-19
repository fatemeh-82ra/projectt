package org.example.backend.model.constants

object SubmissionStatus {
    const val SUBMITTED = "Submitted"
    const val DELETED_BY_OWNER = "Deleted by Owner"
    const val REMOVED_BY_OWNER = "Removed by Owner"

    val ACTIVE_STATUSES = setOf(SUBMITTED)
    val DELETED_STATUSES = setOf(DELETED_BY_OWNER, REMOVED_BY_OWNER)

    fun isActive(status: String): Boolean = ACTIVE_STATUSES.contains(status)
    fun isDeleted(status: String): Boolean = DELETED_STATUSES.contains(status)
} 