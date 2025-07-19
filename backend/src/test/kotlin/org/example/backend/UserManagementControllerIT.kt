package org.example.backend

import org.example.backend.model.dto.api.userManagement.*
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.put
import org.springframework.test.web.servlet.delete
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue

@SpringBootTest
@AutoConfigureMockMvc
class UserManagementControllerIT @Autowired constructor(
    val mockMvc: MockMvc
) {
    private val mapper = jacksonObjectMapper()

    @Test
    fun `sign-up, login, get, update and delete user - happy path`() {
        // 1. Sign Up
        val createReq = CreateUserRequestDTO("ituser", "itpass", "ituser@example.com", "IT User")
        val createResult = mockMvc.post("/api/user-managements/sign-up") {
            contentType = MediaType.APPLICATION_JSON
            content = mapper.writeValueAsString(createReq)
        }.andExpect {
            status { isOk() }
        }.andReturn().response.contentAsString

        val createResp: CreateUserResponseDTO = mapper.readValue(createResult)
        val userId = createResp.id ?: throw AssertionError("User ID missing")

        // 2. Login
        val loginReq = LoginRequestDTO("ituser", "itpass")
        mockMvc.post("/api/user-managements/login") {
            contentType = MediaType.APPLICATION_JSON
            content = mapper.writeValueAsString(loginReq)
        }.andExpect {
            status { isOk() }
            jsonPath("$.username") { value("ituser") }
        }

        // 3. Get User by ID
        mockMvc.get("/api/user-managements/$userId") {
            contentType = MediaType.APPLICATION_JSON
        }.andExpect {
            status { isOk() }
            jsonPath("$.username") { value("ituser") }
        }

        // 4. Update User
        val updateReq = UpdateUserRequestDTO(name = "Changed Name")
        mockMvc.put("/api/user-managements/$userId") {
            contentType = MediaType.APPLICATION_JSON
            content = mapper.writeValueAsString(updateReq)
        }.andExpect {
            status { isOk() }
            jsonPath("$.name") { value("Changed Name") }
        }

        // 5. Delete User
        mockMvc.delete("/api/user-managements/$userId") {
            contentType = MediaType.APPLICATION_JSON
        }.andExpect {
            status { isOk() }
        }
    }

    @Test
    fun `sign-up with existing username returns bad request`() {
        // Sign up first user
        val req1 = CreateUserRequestDTO("dup", "pass", "dup1@email", "nm")
        mockMvc.post("/api/user-managements/sign-up") {
            contentType = MediaType.APPLICATION_JSON
            content = mapper.writeValueAsString(req1)
        }.andExpect { status { isOk() } }
        // Sign up second with same username
        val req2 = CreateUserRequestDTO("dup", "pass", "dup2@email", "nm")
        mockMvc.post("/api/user-managements/sign-up") {
            contentType = MediaType.APPLICATION_JSON
            content = mapper.writeValueAsString(req2)
        }.andExpect { status { isBadRequest() } }
    }
}
