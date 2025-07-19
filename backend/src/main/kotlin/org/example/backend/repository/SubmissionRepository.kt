package org.example.backend.repository

import org.example.backend.model.constants.SubmissionStatus
//import org.example.backend.model.database.Submission
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

//@Repository
//interface SubmissionRepository : JpaRepository<Submission, Int> {
//    @Query("""
//        SELECT s FROM Submission s
//        WHERE s.formId = :formId
//        AND s.id IN (
//            SELECT sl.submissionId
//            FROM SubmissionsLog sl
//            WHERE sl.submissionId = s.id
//            AND sl.id = (
//                SELECT MAX(sl2.id)
//                FROM SubmissionsLog sl2
//                WHERE sl2.submissionId = s.id
//            )
//            AND sl.status = :#{T(org.example.backend.model.constants.SubmissionStatus).SUBMITTED}
//        )
//        ORDER BY s.submittedAt DESC
//    """)
//    fun findActiveSubmissionsByFormId(
//        @Param("formId") formId: Int,
//        pageable: Pageable
//    ): Page<Submission>
//
//    @Query("""
//        SELECT COUNT(s) FROM Submission s
//        WHERE s.formId = :formId
//        AND s.id IN (
//            SELECT sl.submissionId
//            FROM SubmissionsLog sl
//            WHERE sl.submissionId = s.id
//            AND sl.id = (
//                SELECT MAX(sl2.id)
//                FROM SubmissionsLog sl2
//                WHERE sl2.submissionId = s.id
//            )
//            AND sl.status = :#{T(org.example.backend.model.constants.SubmissionStatus).SUBMITTED}
//        )
//    """)
//    fun countActiveSubmissionsByFormId(@Param("formId") formId: Int): Long
//
//    @Query("""
//        SELECT CASE
//            WHEN COUNT(s) > 0 THEN true
//            ELSE false
//        END
//        FROM Submission s
//        WHERE s.id = :submissionId
//        AND s.id IN (
//            SELECT sl.submissionId
//            FROM SubmissionsLog sl
//            WHERE sl.submissionId = s.id
//            AND sl.id = (
//                SELECT MAX(sl2.id)
//                FROM SubmissionsLog sl2
//                WHERE sl2.submissionId = s.id
//            )
//            AND sl.status = :#{T(org.example.backend.model.constants.SubmissionStatus).SUBMITTED}
//        )
//    """)
//    fun isSubmissionActive(@Param("submissionId") submissionId: Int): Boolean
//}