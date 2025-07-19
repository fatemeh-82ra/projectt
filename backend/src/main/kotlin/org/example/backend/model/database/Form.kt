package org.example.backend.model.database

import jakarta.persistence.*
import org.example.backend.util.JsonMapConverter
import java.time.OffsetDateTime

@Entity
@Table(name = "forms")
class Form(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,

    @Column(nullable = false, length = 200)
    var title: String,

    @Column(columnDefinition = "TEXT")
    var description: String?,

    @Column(nullable = false)
    @Convert(converter = JsonMapConverter::class)
    var schema: Map<String, Any>, // JSON schema as Map

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    var owner: User,

    @OneToMany(mappedBy = "form", cascade = [CascadeType.ALL], orphanRemoval = true)
    var submissions: MutableSet<FormSubmission> = mutableSetOf(),

    @OneToMany(mappedBy = "form", cascade = [CascadeType.ALL], orphanRemoval = true)
    var permissions: MutableSet<FormPermission> = mutableSetOf(),

    @Column(name = "created_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    var createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    var updatedAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(nullable = false)
    var isActive: Boolean = true,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    var group: Group? = null
) 