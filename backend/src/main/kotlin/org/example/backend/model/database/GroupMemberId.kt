package org.example.backend.model.database

import jakarta.persistence.Embeddable
import java.io.Serializable
import java.util.Objects

@Embeddable
class GroupMemberId(
    var groupId: Int,
    var userId: Int
) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is GroupMemberId) return false
        return groupId == other.groupId && userId == other.userId
    }

    override fun hashCode(): Int {
        return Objects.hash(groupId, userId)
    }
} 