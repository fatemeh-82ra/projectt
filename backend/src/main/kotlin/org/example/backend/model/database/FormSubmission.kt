package org.example.backend.model.database

import jakarta.persistence.*
import org.example.backend.Enum.form.SubmissionStatus
import org.example.backend.util.JsonMapConverter
import java.time.OffsetDateTime

@Entity
@Table(name = "form_submissions")
class FormSubmission(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    var form: Form,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    var user: User,

    @Column(nullable = false)
    @Convert(converter = JsonMapConverter::class)
    var data: Map<String, Any>, // JSON data as Map

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: SubmissionStatus = SubmissionStatus.SUBMITTED,

    @Column(name = "submitted_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    var submittedAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    var updatedAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "status_changed_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    var statusChangedAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "status_changed_by_user_id")
    var statusChangedByUserId: Int? = null
) 