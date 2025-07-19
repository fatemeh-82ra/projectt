package org.example.backend.model.database

import jakarta.persistence.*

@Entity
@Table(name = "form_permissions")
class FormPermission(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    var form: Form,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    var group: Group,

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var permissionType: PermissionType
)

enum class PermissionType {
    VIEW, SUBMIT, EDIT
} 