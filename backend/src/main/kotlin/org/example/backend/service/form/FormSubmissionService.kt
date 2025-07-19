package org.example.backend.service.form

import com.fasterxml.jackson.databind.ObjectMapper
import org.example.backend.Enum.form.SubmissionStatus
import org.example.backend.model.database.Form
import org.example.backend.model.database.FormSubmission
import org.example.backend.model.database.User
import org.example.backend.model.dto.api.form.*
import org.example.backend.repository.FormRepository
import org.example.backend.repository.FormSubmissionRepository
import org.example.backend.repository.UserRepository
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class FormSubmissionService(
    private val formRepository: FormRepository,
    private val formSubmissionRepository: FormSubmissionRepository,
    private val userRepository: UserRepository,
    private val objectMapper: ObjectMapper
) {
    @Transactional
    fun submitForm(userId: Int, request: FormSubmissionRequest): FormSubmissionResponse {
        // Find the form
        val form = formRepository.findById(request.formId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Form not found") }

        // Validate form is active
        if (!form.isActive) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Form is no longer active")
        }

        // Find the user
        val user = userRepository.findById(userId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "User not found") }

        // Validate form data against schema
        validateFormData(form.schema, request.data)

        // Create submission
        val submission = FormSubmission(
            form = form,
            user = user,
            data = request.data,
            status = SubmissionStatus.SUBMITTED
        )

        // Save submission
        val savedSubmission = formSubmissionRepository.save(submission)

        return FormSubmissionResponse(
            id = savedSubmission.id!!,
            formId = form.id!!,
            status = savedSubmission.status,
            submittedAt = savedSubmission.submittedAt,
            message = "Form submitted successfully"
        )
    }

    private fun validateFormData(schema: Map<String, Any>, data: Map<String, Any>) {
        try {
            // Use the schema map directly
            val requiredFields = (schema["required"] as? List<*>)?.mapNotNull { it as? String } ?: emptyList()
            val missingFields = requiredFields.filter { !data.containsKey(it) }

            if (missingFields.isNotEmpty()) {
                throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Missing required fields: "+ missingFields.joinToString(", ")
                )
            }
            // TODO: Add more validation based on schema types, patterns, etc.
        } catch (e: Exception) {
            when (e) {
                is ResponseStatusException -> throw e
                else -> throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid form data: ${e.message}"
                )
            }
        }
    }

    @Transactional(readOnly = true)
    fun getUserSubmissions(
        userId: Int,
        page: Int,
        size: Int,
        status: SubmissionStatus? = null
    ): SubmissionsPageResponse {
        val pageable = PageRequest.of(page, size, Sort.by("submittedAt").descending())
        
        val submissionsPage = if (status != null) {
            formSubmissionRepository.findByUserIdAndStatus(userId, status, pageable)
        } else {
            formSubmissionRepository.findByUserId(userId, pageable)
        }

        val submissions = submissionsPage.content.map { submission ->
            val form = submission.form
            val statusChangedByUser = submission.statusChangedByUserId?.let { 
                userRepository.findById(it).orElse(null)?.fullName 
            }

            SubmissionDisplayDTO(
                id = submission.id!!,
                formId = form.id!!,
                formTitle = form.title,
                status = submission.status,
                submittedAt = submission.submittedAt,
                statusChangedAt = submission.statusChangedAt,
                data = submission.data,
                statusChangedBy = statusChangedByUser
            )
        }

        return SubmissionsPageResponse(
            submissions = submissions,
            totalElements = submissionsPage.totalElements,
            totalPages = submissionsPage.totalPages,
            currentPage = page,
            pageSize = size
        )
    }

    @Transactional(readOnly = true)
    fun getSubmissionById(submissionId: Int, userId: Int): SubmissionDisplayDTO {
        val submission = formSubmissionRepository.findById(submissionId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found") }

        // Verify ownership
        if (submission.user.id != userId) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to view this submission")
        }

        val form = submission.form
        val statusChangedByUser = submission.statusChangedByUserId?.let { 
            userRepository.findById(it).orElse(null)?.fullName 
        }

        return SubmissionDisplayDTO(
            id = submission.id!!,
            formId = form.id!!,
            formTitle = form.title,
            status = submission.status,
            submittedAt = submission.submittedAt,
            statusChangedAt = submission.statusChangedAt,
            data = submission.data,
            statusChangedBy = statusChangedByUser
        )
    }

    @Transactional
    fun editSubmission(submissionId: Int, userId: Int, request: FormSubmissionRequest): FormSubmissionResponse {
        val submission = formSubmissionRepository.findById(submissionId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found") }
        if (submission.user.id != userId) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to edit this submission")
        }
        // Validate form data against schema
        validateFormData(submission.form.schema, request.data)
        submission.data = request.data
        submission.updatedAt = java.time.OffsetDateTime.now()
        val savedSubmission = formSubmissionRepository.save(submission)
        return FormSubmissionResponse(
            id = savedSubmission.id!!,
            formId = savedSubmission.form.id!!,
            status = savedSubmission.status,
            submittedAt = savedSubmission.submittedAt,
            message = "Submission updated successfully"
        )
    }

    @Transactional
    fun deleteSubmission(submissionId: Int, userId: Int) {
        val submission = formSubmissionRepository.findById(submissionId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found") }
        if (submission.user.id != userId) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to delete this submission")
        }
        formSubmissionRepository.delete(submission)
    }

    @Transactional(readOnly = true)
    fun getFormReport(formId: Int, userId: Int, field: String, agg: String, groupBy: String?): Any {
        // Fetch all submissions for the form
        val submissions = formSubmissionRepository.findByFormId(formId)
        if (submissions.isEmpty()) return emptyList<Any>()

        // Optionally group by a field
        val grouped = if (groupBy != null) {
            submissions.groupBy { it.data[groupBy] ?: "Unknown" }
        } else {
            mapOf("all" to submissions)
        }

        // Aggregate for each group
        val result = grouped.map { (group, subs) ->
            val values = subs.mapNotNull { it.data[field] as? Number }
            val aggValue = when (agg.uppercase()) {
                "COUNT" -> values.size
                "MAX" -> values.maxOrNull()
                "MIN" -> values.minOrNull()
                "AVG" -> if (values.isNotEmpty()) values.map { it.toDouble() }.average() else null
                "SUM" -> values.sumOf { it.toDouble() }
                else -> null
            }
            mapOf(
                "group" to group,
                "aggregation" to agg.uppercase(),
                "field" to field,
                "value" to aggValue
            )
        }
        return result
    }
} 