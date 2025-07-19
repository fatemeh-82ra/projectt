package org.example.backend.service.submission

import org.example.backend.Enum.form.SubmissionStatus
import org.example.backend.model.database.FormSubmission
import org.example.backend.model.dto.api.submission.FormSubmissionListDTO
import org.example.backend.model.dto.api.submission.FormSubmissionsResponse
import org.example.backend.repository.FormRepository
import org.example.backend.repository.FormSubmissionRepository
import org.example.backend.repository.UserRepository
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import com.fasterxml.jackson.databind.ObjectMapper

@Service
class FormSubmissionListService(
    private val formRepository: FormRepository,
    private val formSubmissionRepository: FormSubmissionRepository,
    private val userRepository: UserRepository,
    private val objectMapper: ObjectMapper
) {
    @Transactional(readOnly = true)
    fun getFormSubmissions(
        formId: Int,
        ownerId: Int,
        page: Int,
        size: Int
    ): FormSubmissionsResponse {
        // Verify form exists and user is the owner
        val form = formRepository.findById(formId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Form not found") }

        if (form.owner.id != ownerId) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to view these submissions")
        }

        // Get active submissions for the form
        val pageRequest = PageRequest.of(page, size)
        val submissionsPage = formSubmissionRepository.findByFormIdAndStatus(
            formId,
            SubmissionStatus.SUBMITTED,
            pageRequest
        )

        if (submissionsPage.isEmpty) {
            return FormSubmissionsResponse(
                submissions = emptyList(),
                totalSubmissions = 0,
                message = "No active submissions found for this form"
            )
        }

        // Get user details for each submission
        val userIds = submissionsPage.content.map { it.user.id!! }.toSet()
        val users = userRepository.findAllById(userIds).associateBy { it.id!! }

        // Map submissions to DTOs
        val submissionDTOs = submissionsPage.content.map { submission ->
            val user = users[submission.user.id!!] ?: throw IllegalStateException("User not found for submission")
            FormSubmissionListDTO(
                submissionId = submission.id!!,
                userId = submission.user.id!!,
                submitterName = user.fullName,
                submittedAt = submission.submittedAt.toLocalDateTime(),
                formData = submission.data as Map<String, Any>,
                status = submission.status.name
            )
        }

        return FormSubmissionsResponse(
            submissions = submissionDTOs,
            totalSubmissions = submissionsPage.totalElements
        )
    }

    @Transactional(readOnly = true)
    fun isSubmissionActive(submissionId: Int): Boolean {
        val submission = formSubmissionRepository.findById(submissionId)
        return submission.isPresent && submission.get().status == SubmissionStatus.SUBMITTED
    }

    @Transactional(readOnly = true)
    fun getActiveSubmissionsCount(formId: Int): Long {
        return formSubmissionRepository.countByFormIdAndStatus(formId, SubmissionStatus.SUBMITTED)
    }
} 