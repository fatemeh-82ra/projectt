package org.example.backend.repository

import org.example.backend.model.database.Form
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface FormRepository : JpaRepository<Form, Int> {
    fun findByOwnerId(ownerId: Int, pageable: Pageable): Page<Form>
    
    @Query("""
        SELECT f FROM Form f 
        WHERE f.isActive = true 
        AND (
            f.owner.id = :userId 
            OR f.id IN (
                SELECT gf.id FROM Group g 
                JOIN g.forms gf 
                WHERE g.id IN :groupIds
            )
        )
        AND (
            :searchQuery IS NULL 
            OR LOWER(f.title) LIKE LOWER(CONCAT('%', :searchQuery, '%'))
            OR LOWER(f.description) LIKE LOWER(CONCAT('%', :searchQuery, '%'))
        )
    """)
    fun findAvailableFormsForUser(
        @Param("userId") userId: Int,
        @Param("groupIds") groupIds: List<Int>,
        @Param("searchQuery") searchQuery: String?,
        pageable: Pageable
    ): Page<Form>

    @Query("""
        SELECT f FROM Form f 
        WHERE f.isActive = true 
        AND (
            f.owner.id = :userId 
            OR f.id IN (
                SELECT gf.id FROM Group g 
                JOIN g.forms gf 
                WHERE g.id IN :groupIds
            )
        )
    """)
    fun findAvailableFormsForUser(
        @Param("userId") userId: Int,
        @Param("groupIds") groupIds: List<Int>,
        pageable: Pageable
    ): Page<Form>

    @Query("""
        SELECT CASE WHEN COUNT(f) > 0 THEN TRUE ELSE FALSE END 
        FROM Form f 
        WHERE f.id = :formId 
        AND f.isActive = true 
        AND (
            f.owner.id = :userId 
            OR f.id IN (
                SELECT gf.id FROM Group g 
                JOIN g.forms gf 
                WHERE g.id IN :groupIds
            )
        )
    """)
    fun existsByIdAndOwnerIdOrGroupIdInAndIsActiveTrue(
        @Param("formId") formId: Int,
        @Param("userId") userId: Int,
        @Param("groupIds") groupIds: List<Int>
    ): Boolean

    fun existsByTitleAndOwnerId(title: String, ownerId: Int): Boolean
} 