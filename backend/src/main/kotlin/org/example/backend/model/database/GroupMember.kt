package org.example.backend.model.database

import jakarta.persistence.*

@Entity
@Table(name = "group_members")
@IdClass(GroupMemberId::class)
class GroupMember(
    @Id
    @Column(name = "group_id")
    var groupId: Int,

    @Id
    @Column(name = "user_id")
    var userId: Int,

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("groupId")
    @JoinColumn(name = "group_id")
    var group: Group,

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    var user: User
) {
    constructor(group: Group, user: User) : this(
        group.id ?: 0, // Temporary, will be set after persist
        user.id ?: 0,  // Temporary, will be set after persist
        group,
        user
    )
} 