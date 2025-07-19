package org.example.backend.service.form

import org.example.backend.model.database.Form
import org.example.backend.model.database.Group
import org.example.backend.model.database.User
import org.example.backend.model.dto.api.form.AvailableFormDTO
import org.example.backend.model.dto.api.form.AvailableFormsResponse
import org.example.backend.repository.FormRepository
import org.example.backend.repository.GroupRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FormAvailabilityService(
    private val formRepository: FormRepository,
    private val groupRepository: GroupRepository
) {
    @Transactional(readOnly = true)
    fun getAvailableForms(
        userId: Int,
        page: Int,
        size: Int,
        searchQuery: String? = null
    ): AvailableFormsResponse {
        val pageable = PageRequest.of(page, size, Sort.by("createdAt").descending())
        
        // Get user's groups
        val userGroups = groupRepository.findByMembers_UserId(userId)
        val groupIds = userGroups.map { it.id!! }

        // Get forms that are either:
        // 1. Created by the user
        // 2. Shared with user's groups
        // 3. Active
        val formsPage = if (searchQuery != null) {
            formRepository.findAvailableFormsForUser(userId, groupIds, searchQuery, pageable)
        } else {
            formRepository.findAvailableFormsForUser(userId, groupIds, pageable)
        }

        val forms = formsPage.content.map { form ->
            // Determine if form is from a group
            val groupForm = userGroups.find { group -> 
                group.forms.any { it.id == form.id }
            }

            AvailableFormDTO(
                id = form.id!!,
                title = form.title,
                description = form.description,
                ownerName = form.owner.fullName,
                createdAt = form.createdAt,
                isGroupForm = groupForm != null,
                groupName = groupForm?.name
            )
        }

        val message = if (forms.isEmpty()) {
            "No forms available"
        } else null

        return AvailableFormsResponse(
            forms = forms,
            totalElements = formsPage.totalElements,
            totalPages = formsPage.totalPages,
            currentPage = page,
            pageSize = size,
            message = message
        )
    }

    fun hasAccessToForm(userId: Int, formId: Int): Boolean {
        val userGroups = groupRepository.findByMembers_UserId(userId)
        val groupIds = userGroups.map { it.id!! }

        return formRepository.existsByIdAndOwnerIdOrGroupIdInAndIsActiveTrue(
            formId, userId, groupIds
        )
    }
} 