package org.example.backend.model.dto.api.form

data class FormPermissionDTO(
    val groupId: Int,
    val groupName: String,
    val permissionType: String // VIEW, SUBMIT, EDIT
) 