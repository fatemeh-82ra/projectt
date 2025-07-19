package org.example.backend.repository

import org.example.backend.Enum.form.SubmissionStatus
import org.example.backend.model.database.FormSubmission
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface FormSubmissionRepository : JpaRepository<FormSubmission, Int> {
    fun findByFormId(formId: Int, pageable: Pageable?): Page<FormSubmission>
    
    fun findByUserId(userId: Int, pageable: Pageable): Page<FormSubmission>
    
    fun findByFormIdAndUserId(formId: Int, userId: Int, pageable: Pageable): Page<FormSubmission>
    
    fun findByFormIdAndStatus(formId: Int, status: SubmissionStatus, pageable: Pageable): Page<FormSubmission>
    
    fun findByUserIdAndStatus(userId: Int, status: SubmissionStatus, pageable: Pageable): Page<FormSubmission>
    
    @Query("SELECT COUNT(fs) FROM FormSubmission fs WHERE fs.form.id = :formId AND fs.status = :status")
    fun countByFormIdAndStatus(formId: Int, status: SubmissionStatus): Long
    
    @Query("SELECT fs FROM FormSubmission fs WHERE fs.form.id = :formId AND fs.status = :status AND (CAST(fs.data AS string) LIKE %:query% OR fs.user.fullName LIKE %:query%)")
    fun searchSubmissions(formId: Int, status: SubmissionStatus, query: String, pageable: Pageable): Page<FormSubmission>
} 