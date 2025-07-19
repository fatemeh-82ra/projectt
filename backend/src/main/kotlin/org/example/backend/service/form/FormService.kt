package org.example.backend.service.form

import org.example.backend.event.form.FormDeletedEvent
import org.example.backend.model.database.Form
import org.example.backend.model.database.FormPermission
import org.example.backend.model.database.PermissionType
import org.example.backend.model.dto.api.form.FormDeletionResponse
import org.example.backend.model.dto.api.form.FormPermissionDTO
import org.example.backend.model.dto.api.form.PermissionAssignmentRequest
import org.example.backend.repository.FormRepository
import org.example.backend.repository.FormSubmissionRepository
import org.example.backend.repository.GroupRepository
import org.example.backend.repository.UserRepository
import org.example.backend.model.dto.api.form.CreateFormRequest
import org.springframework.context.ApplicationEventPublisher
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class FormService(
    private val formRepository: FormRepository,
    private val formSubmissionRepository: FormSubmissionRepository,
    private val userRepository: UserRepository,
    private val groupRepository: GroupRepository,
    private val eventPublisher: ApplicationEventPublisher
) {
    @Transactional
    fun deleteForm(formId: Int, ownerId: Int): FormDeletionResponse {
        // Find the form and verify ownership
        val form = formRepository.findById(formId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Form not found") }

        if (form.owner.id != ownerId) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to delete this form")
        }

        // Get submission count before deletion
        val submissionCount = formSubmissionRepository.findByFormId(formId, null).content.size

        // Delete the form
        formRepository.delete(form)

        // Publish form deletion event
        eventPublisher.publishEvent(FormDeletedEvent(formId, ownerId))

        return FormDeletionResponse(
            formId = formId,
            message = "Form deletion initiated. Submissions will be updated shortly.",
            submissionsUpdated = submissionCount
        )
    }

    @Transactional
    fun createForm(request: CreateFormRequest, ownerId: Int): Form {
        // Find the owner user
        val owner = userRepository.findById(ownerId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Owner user not found") }

        // Optionally find the group
        val group = request.groupId?.let {
            groupRepository.findById(it).orElse(null)
        }

        // Create and save the form
        val form = Form(
            title = request.title,
            description = request.description,
            schema = request.schema,
            owner = owner,
            group = group
        )
        return formRepository.save(form)
    }

    @Transactional
    fun assignPermissions(formId: Int, permissions: List<PermissionAssignmentRequest>) {
        val form = formRepository.findById(formId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Form not found") }
        // Remove existing permissions
        form.permissions.clear()
        // Add new permissions
        permissions.forEach { req ->
            val group = groupRepository.findById(req.groupId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found") }
            val perm = FormPermission(
                form = form,
                group = group,
                permissionType = PermissionType.valueOf(req.permissionType)
            )
            form.permissions.add(perm)
        }
        formRepository.save(form)
    }

    @Transactional(readOnly = true)
    fun getPermissions(formId: Int): List<FormPermissionDTO> {
        val form = formRepository.findById(formId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Form not found") }
        return form.permissions.map {
            FormPermissionDTO(
                groupId = it.group.id!!,
                groupName = it.group.name,
                permissionType = it.permissionType.name
            )
        }
    }

    fun getFormById(formId: Int): Form {
        return formRepository.findById(formId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Form not found") }
    }

    fun isFormActive(formId: Int): Boolean {
        return try {
            val form = getFormById(formId)
            form.isActive
        } catch (e: ResponseStatusException) {
            false
        }
    }
} 