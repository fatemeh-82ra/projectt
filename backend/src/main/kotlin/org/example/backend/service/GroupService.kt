package org.example.backend.service

import org.example.backend.model.database.Group
import org.example.backend.model.database.User
import org.example.backend.model.dto.api.CreateGroupRequest
import org.example.backend.model.dto.api.UpdateGroupRequest
import org.example.backend.repository.GroupRepository
import org.example.backend.repository.UserRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.lang.RuntimeException

class UserNotFoundException(message: String) : RuntimeException(message)

@Service
@Transactional
class GroupService(
    private val groupRepository: GroupRepository,
    private val userRepository: UserRepository
) {
    fun createGroup(request: CreateGroupRequest): Group {
        val owner = getCurrentUser()

        if (groupRepository.existsByNameCaseInsensitive(request.name)) {
            throw IllegalArgumentException("A group with this name already exists")
        }

        val group = Group(
            name = request.name,
            description = request.description,
            owner = owner
        )

        group.addMember(owner)

        if (request.memberIds.isNotEmpty()) {
            val members = userRepository.findAllById(request.memberIds)
            members.forEach { group.addMember(it) }
        }

        return groupRepository.save(group)
    }

    fun updateGroup(groupId: Int, request: UpdateGroupRequest): Group {
        val group = findGroupByIdOrThrow(groupId)
        val currentUser = getCurrentUser()

        if (group.owner.id != currentUser.id) {
            throw SecurityException("Access Denied")
        }

        request.name?.let {
            if (group.name.lowercase() != it.lowercase() && groupRepository.existsByNameCaseInsensitive(it)) {
                throw IllegalArgumentException("A group with this name already exists")
            }
            group.name = it
        }

        request.description?.let { group.description = it }

        request.memberIds?.let { memberIds ->
            group.members.clear()
            group.addMember(currentUser)
            val newMemberIds = memberIds.filter { it != currentUser.id }
            if (newMemberIds.isNotEmpty()) {
                val members = userRepository.findAllById(newMemberIds)
                members.forEach { group.addMember(it) }
            }
        }

        return groupRepository.save(group)
    }

    fun deleteGroup(groupId: Int) {
        val group = findGroupByIdOrThrow(groupId)
        val currentUser = getCurrentUser()

        if (group.owner.id != currentUser.id) {
            throw SecurityException("Access Denied")
        }

        groupRepository.delete(group)
    }

    @Transactional(readOnly = true)
    fun getGroupById(groupId: Int): Group {
        val group = findGroupByIdOrThrow(groupId)
        val currentUser = getCurrentUser()

        if (group.members.none { it.userId == currentUser.id }) {
            throw SecurityException("Access Denied")
        }

        return group
    }

    @Transactional(readOnly = true)
    fun getGroupsForUser(mineOnly: Boolean): List<Group> {
        val currentUser = getCurrentUser()
        return if (mineOnly) {
            groupRepository.findByOwnerId(currentUser.id!!)
        } else {
            groupRepository.findByMembers_UserId(currentUser.id!!)
        }
    }

    @Transactional(readOnly = true)
    fun searchUsers(query: String, pageable: Pageable): Page<User> {
        return userRepository.searchUsers(query, pageable)
    }

    private fun findGroupByIdOrThrow(groupId: Int): Group {
        return groupRepository.findById(groupId)
            .orElseThrow { NoSuchElementException("Group not found") }
    }

    private fun getCurrentUser(): User {
        val authentication = SecurityContextHolder.getContext().authentication
        val email = authentication?.name
        return if (email != null) {
            userRepository.findByEmail(email)
                .orElseThrow { UserNotFoundException("Authenticated user not found, make sure you are logged in.") }
        } else {
            // For development/testing, return user with ID 1
            userRepository.findById(1)
                .orElseThrow { UserNotFoundException("Test user with ID 1 not found") }
        }
    }
}