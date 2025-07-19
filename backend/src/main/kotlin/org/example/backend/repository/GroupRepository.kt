package org.example.backend.repository

import org.example.backend.model.database.Group
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface GroupRepository : JpaRepository<Group, Int> {
    @Query("SELECT CASE WHEN COUNT(g) > 0 THEN TRUE ELSE FALSE END FROM Group g WHERE LOWER(g.name) = LOWER(:name)")
    fun existsByNameCaseInsensitive(name: String): Boolean
    
    fun findByMembers_UserId(userId: Int): List<Group>

    fun findByOwnerId(ownerId: Int): List<Group>
}
