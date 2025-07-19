package org.example.backend.model.database

import jakarta.persistence.*
import org.jetbrains.annotations.NotNull

@Entity
class UserModel(

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "id_sequence")
    val id: Long = 0,

    @Column(nullable = false)
    @NotNull
    var username: String,

    @Column(nullable = false)
    @NotNull
    var password: String,

    @Column(nullable = false)
    @NotNull
    var email: String,

    @Column(nullable = false)
    @NotNull
    var name: String

    // TODO: Add other properties
)
