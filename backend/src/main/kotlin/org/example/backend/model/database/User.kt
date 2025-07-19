package org.example.backend.model.database

import jakarta.persistence.*
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.time.OffsetDateTime

@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,

    @Column(name = "full_name", nullable = false, length = 100)
    var fullName: String,

    @Column(nullable = false, unique = true, length = 100)
    var email: String,

    @Column(name = "password", nullable = false)
    var userPassword: String,

    @Column(name = "created_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    var createdAt: OffsetDateTime? = OffsetDateTime.now(),

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    var updatedAt: OffsetDateTime? = OffsetDateTime.now()
) : UserDetails {
    override fun getAuthorities(): MutableCollection<out GrantedAuthority> {
        return mutableListOf()
    }

    override fun getPassword(): String {
        return userPassword
    }

    override fun getUsername(): String {
        return email
    }

    override fun isAccountNonExpired(): Boolean {
        return true
    }

    override fun isAccountNonLocked(): Boolean {
        return true
    }

    override fun isCredentialsNonExpired(): Boolean {
        return true
    }

    override fun isEnabled(): Boolean {
        return true
    }
} 