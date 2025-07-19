package org.example.backend.repository.userManagement

import org.example.backend.model.database.UserModel
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository("userModelRepository")
interface UserModelRepository : JpaRepository<UserModel, Long> {
    fun findByUsername(username: String): UserModel?
    fun existsByUsername(username: String): Boolean
    fun existsByEmail(email: String): Boolean
}
