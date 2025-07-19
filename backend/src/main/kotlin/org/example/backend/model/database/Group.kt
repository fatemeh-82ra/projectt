package org.example.backend.model.database

import jakarta.persistence.*
import java.time.OffsetDateTime

@Entity
@Table(name = "groups")
class Group(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,

    @Column(nullable = false, length = 50)
    var name: String,

    @Column(length = 200)
    var description: String?,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    var owner: User,

    @OneToMany(mappedBy = "group", cascade = [CascadeType.ALL], orphanRemoval = true)
    var members: MutableSet<GroupMember> = mutableSetOf(),

    @OneToMany(mappedBy = "group", cascade = [CascadeType.ALL], orphanRemoval = true)
    var forms: MutableSet<Form> = mutableSetOf(),

    @Column(name = "created_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    var createdAt: OffsetDateTime? = OffsetDateTime.now(),

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    var updatedAt: OffsetDateTime? = OffsetDateTime.now()
) {
    fun addMember(user: User) {
        val groupMember = GroupMember(this, user)
        members.add(groupMember)
    }
}