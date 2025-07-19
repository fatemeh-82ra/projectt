package org.example.backend.event.form

import org.example.backend.Enum.form.SubmissionStatus
import org.example.backend.repository.FormSubmissionRepository
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class FormEventListener(
    private val formSubmissionRepository: FormSubmissionRepository
) {
    private val logger = LoggerFactory.getLogger(FormEventListener::class.java)

    @Async
    @EventListener
    @Transactional
    fun handleFormDeletedEvent(event: FormDeletedEvent) {
        try {
            logger.info("Processing form deletion event for form ID: ${event.formId}")
            
            // Find all submissions for the deleted form
            val submissions = formSubmissionRepository.findByFormId(event.formId, null).content
            
            // Update each submission's status
            submissions.forEach { submission ->
                submission.status = SubmissionStatus.REMOVED_BY_OWNER
                submission.statusChangedAt = event.deletedAt
                submission.statusChangedByUserId = event.ownerId
            }
            
            // Save all updated submissions
            val updatedSubmissions = formSubmissionRepository.saveAll(submissions)
            
            logger.info("Updated ${updatedSubmissions.size} submissions for form ID: ${event.formId}")
        } catch (e: Exception) {
            logger.error("Error processing form deletion event for form ID: ${event.formId}", e)
            throw e // Re-throw to trigger transaction rollback
        }
    }
} 