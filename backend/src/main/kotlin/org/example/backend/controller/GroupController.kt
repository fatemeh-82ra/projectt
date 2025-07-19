package org.example.backend.controller

//import jakarta.validation.Valid
import jakarta.validation.Valid
import org.example.backend.model.database.Group
import org.example.backend.model.database.User
import org.example.backend.model.dto.api.CreateGroupRequest
import org.example.backend.model.dto.api.GroupDto
import org.example.backend.model.dto.api.UpdateGroupRequest
import org.example.backend.model.dto.api.UserDto
import org.example.backend.service.GroupService
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/groups")
class GroupController(private val groupService: GroupService) {

    @PostMapping
    fun createGroup(@Valid @RequestBody request: CreateGroupRequest): ResponseEntity<GroupDto> {
        val group = groupService.createGroup(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(group.toDto())
    }

    @GetMapping("/{id}")
    fun getGroupById(@PathVariable id: Int): ResponseEntity<GroupDto> {
        val group = groupService.getGroupById(id)
        return ResponseEntity.ok(group.toDto())
    }

    @PutMapping("/{id}")
    fun updateGroup(@PathVariable id: Int, @Valid @RequestBody request: UpdateGroupRequest): ResponseEntity<GroupDto> {
        val group = groupService.updateGroup(id, request)
        return ResponseEntity.ok(group.toDto())
    }

    @DeleteMapping("/{id}")
    fun deleteGroup(@PathVariable id: Int): ResponseEntity<Void> {
        groupService.deleteGroup(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping
    fun getGroups(@RequestParam(defaultValue = "false") mineOnly: Boolean): ResponseEntity<List<GroupDto>> {
        val groups = groupService.getGroupsForUser(mineOnly)
        return ResponseEntity.ok(groups.map { it.toDto() })
    }

    @GetMapping("/users/search")
    fun searchUsers(@RequestParam q: String, pageable: Pageable): ResponseEntity<List<UserDto>> {
        val users = groupService.searchUsers(q, pageable)
        return ResponseEntity.ok(users.map { it.toDto() }.toList())
    }
    
    private fun Group.toDto() = GroupDto(
        id = this.id!!,
        name = this.name,
        description = this.description,
        ownerId = this.owner.id!!,
        members = this.members.map { it.user.toDto() }
    )

    private fun User.toDto() = UserDto(
        id = this.id!!,
        fullName = this.fullName,
        email = this.email
    )
} 