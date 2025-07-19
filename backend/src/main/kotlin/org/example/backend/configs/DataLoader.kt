//package org.example.backend.configs
//
//import org.example.backend.model.database.User
//import org.example.backend.repository.UserRepository
//import org.springframework.boot.CommandLineRunner
//import org.springframework.security.crypto.password.PasswordEncoder
//import org.springframework.stereotype.Component
//
//@Component
//class DataLoader(
//    private val userRepository: UserRepository,
//    private val passwordEncoder: PasswordEncoder
//) : CommandLineRunner {
//
//    override fun run(vararg args: String?) {
//        if (userRepository.count() == 0L) {
//            createUsers()
//        }
//    }
//
//    private fun createUsers() {
//        val users = listOf(
//            User(fullName = "Admin User", email = "admin@example.com", userPassword = passwordEncoder.encode("password")),
//            User(fullName = "John Doe", email = "john.doe@example.com", userPassword = passwordEncoder.encode("password")),
//            User(fullName = "Jane Smith", email = "jane.smith@example.com", userPassword = passwordEncoder.encode("password"))
//        )
//        userRepository.saveAll(users)
//        println("Created ${users.size} users")
//    }
//}