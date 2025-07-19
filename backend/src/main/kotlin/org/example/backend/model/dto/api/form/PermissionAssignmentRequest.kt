package org.example.backend.model.dto.api.form

data class PermissionAssignmentRequest(
    val groupId: Int,
    val permissionType: String // VIEW, SUBMIT, EDIT
) 