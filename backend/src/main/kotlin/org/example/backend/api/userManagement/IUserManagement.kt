package org.example.backend.api.userManagement

import org.example.backend.model.dto.api.userManagement.CreateUserRequestDTO
import org.example.backend.model.dto.api.userManagement.CreateUserResponseDTO
import org.example.backend.model.dto.api.userManagement.GetUserResponseDTO
import org.example.backend.model.dto.api.userManagement.LoginRequestDTO
import org.example.backend.model.dto.api.userManagement.LoginResponseDTO
import org.example.backend.model.dto.api.userManagement.UpdateUserRequestDTO
import org.example.backend.model.dto.api.userManagement.UserListResponseDTO
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam

interface IUserManagement {

    fun signUpUser(@RequestBody request: CreateUserRequestDTO): ResponseEntity<CreateUserResponseDTO>
    fun loginUser(@RequestBody request: LoginRequestDTO): ResponseEntity<LoginResponseDTO>
    fun deleteUserById(@PathVariable id: Long): ResponseEntity<GetUserResponseDTO>
    fun getUserById(@PathVariable id: Long): ResponseEntity<GetUserResponseDTO>
    fun getUserList(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<UserListResponseDTO>
    fun updateUserById(
        @PathVariable id: Long,
        @RequestBody updateRequest: UpdateUserRequestDTO
    ): ResponseEntity<GetUserResponseDTO>
}