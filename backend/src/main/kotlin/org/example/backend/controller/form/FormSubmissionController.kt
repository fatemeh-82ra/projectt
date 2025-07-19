package org.example.backend.controller.form

import jakarta.validation.Valid
import org.example.backend.Enum.form.SubmissionStatus
import org.example.backend.model.dto.api.form.*
import org.example.backend.service.form.FormSubmissionService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/forms")
class FormSubmissionController(
    private val formSubmissionService: FormSubmissionService
) {
    @PostMapping("/{formId}/submit")
    fun submitForm(
        @PathVariable formId: Int,
        @Valid @RequestBody request: FormSubmissionRequest
    ): ResponseEntity<FormSubmissionResponse> {
        val userId = 1 // Use fake userId for development/testing
        if (formId != request.formId) {
            return ResponseEntity.badRequest().build()
        }
        val response = formSubmissionService.submitForm(userId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @GetMapping("/submissions")
    fun getUserSubmissions(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) status: SubmissionStatus?
    ): ResponseEntity<SubmissionsPageResponse> {
        val userId = 1 // Use fake userId for development/testing
        val response = formSubmissionService.getUserSubmissions(userId, page, size, status)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/submissions/{submissionId}")
    fun getSubmissionById(
        @PathVariable submissionId: Int
    ): ResponseEntity<SubmissionDisplayDTO> {
        val userId = 1 // Use fake userId for development/testing
        val submission = formSubmissionService.getSubmissionById(submissionId, userId)
        return ResponseEntity.ok(submission)
    }

    @PutMapping("/submissions/{submissionId}")
    fun editSubmission(
        @PathVariable submissionId: Int,
        @Valid @RequestBody request: FormSubmissionRequest
    ): ResponseEntity<FormSubmissionResponse> {
        val userId = 1 // Use fake userId for development/testing
        val response = formSubmissionService.editSubmission(submissionId, userId, request)
        return ResponseEntity.ok(response)
    }

    @DeleteMapping("/submissions/{submissionId}")
    fun deleteSubmission(
        @PathVariable submissionId: Int
    ): ResponseEntity<Void> {
        val userId = 1 // Use fake userId for development/testing
        formSubmissionService.deleteSubmission(submissionId, userId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{formId}/report")
    fun getFormReport(
        @PathVariable formId: Int,
        @RequestParam field: String,
        @RequestParam agg: String,
        @RequestParam(required = false) groupBy: String?
    ): ResponseEntity<Any> {
        val userId = 1 // Use fake userId for development/testing
        val result = formSubmissionService.getFormReport(formId, userId, field, agg, groupBy)
        return ResponseEntity.ok(result)
    }
} 