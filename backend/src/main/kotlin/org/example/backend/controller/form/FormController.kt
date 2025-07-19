package org.example.backend.controller.form

import org.example.backend.model.dto.api.form.*
import org.example.backend.model.dto.api.submission.FormSubmissionsResponse
import org.example.backend.service.form.FormAvailabilityService
import org.example.backend.service.form.FormService
import org.example.backend.service.form.FormStructureService
import org.example.backend.service.submission.FormSubmissionListService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:5174"])
@RestController
@RequestMapping("/api/forms")
class FormController(
    private val formService: FormService,
    private val formAvailabilityService: FormAvailabilityService,
    private val formStructureService: FormStructureService,
    private val formSubmissionListService: FormSubmissionListService
) {
    @DeleteMapping("/{formId}")
    fun deleteForm(
        @PathVariable formId: Int
    ): ResponseEntity<FormDeletionResponse> {
        val userId = 1 // Use fake userId for development/testing
        val response = formService.deleteForm(formId, userId)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/available")
    fun getAvailableForms(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) search: String?
    ): ResponseEntity<AvailableFormsResponse> {
        val userId = 1 // Use fake userId for development/testing
        val response = formAvailabilityService.getAvailableForms(userId, page, size, search)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/{formId}/structure")
    fun getFormStructure(
        @PathVariable formId: Int
    ): ResponseEntity<FormStructureDTO> {
        val userId = 1 // Use fake userId for development/testing
        val structure = formStructureService.getFormStructure(formId, userId)
        return ResponseEntity.ok(structure)
    }

    @GetMapping("/{formId}/submissions")
    fun getFormSubmissions(
        @PathVariable formId: Int,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<FormSubmissionsResponse> {
        val userId = 1 // Use fake userId for development/testing
        val response = formSubmissionListService.getFormSubmissions(formId, userId, page, size)
        return ResponseEntity.ok(response)
    }

    @PostMapping
    fun createForm(@RequestBody request: CreateFormRequest): ResponseEntity<FormDto> {
        val userId = 1 // Use fake userId for development/testing
        val form = formService.createForm(request, userId)
        return ResponseEntity.status(201).body(form.toDto())
    }

    @PostMapping("/{formId}/permissions")
    fun assignPermissions(
        @PathVariable formId: Int,
        @RequestBody permissions: List<PermissionAssignmentRequest>
    ): ResponseEntity<Void> {
        formService.assignPermissions(formId, permissions)
        return ResponseEntity.ok().build()
    }

    @GetMapping("/{formId}/permissions")
    fun getPermissions(
        @PathVariable formId: Int
    ): ResponseEntity<List<FormPermissionDTO>> {
        val result = formService.getPermissions(formId)
        return ResponseEntity.ok(result)
    }
}

private fun org.example.backend.model.database.Form.toDto() = FormDto(
    id = this.id,
    title = this.title,
    description = this.description,
    schema = this.schema,
    ownerId = this.owner.id!!,
    groupId = this.group?.id,
    createdAt = this.createdAt,
    updatedAt = this.updatedAt,
    isActive = this.isActive
) 