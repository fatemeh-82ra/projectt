package org.example.backend.service.form

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.example.backend.model.dto.api.form.FieldType
import org.example.backend.model.dto.api.form.*
import org.example.backend.repository.FormRepository
import org.example.backend.repository.GroupRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class FormStructureService(
    private val formRepository: FormRepository,
    private val groupRepository: GroupRepository,
    private val objectMapper: ObjectMapper,
    private val formAvailabilityService: FormAvailabilityService
) {
    @Transactional(readOnly = true)
    fun getFormStructure(formId: Int, userId: Int): FormStructureDTO {
        // Check if user has access to the form
        if (!formAvailabilityService.hasAccessToForm(userId, formId)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to access this form")
        }

        // Get the form
        val form = formRepository.findById(formId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Form not found") }

        // Check if form is active
        if (!form.isActive) {
            throw ResponseStatusException(HttpStatus.GONE, "This form is no longer active")
        }

        // Check if form is from a group using the new relationship
        val isGroupForm = form.group != null
        val groupName = form.group?.name

        // Parse the form schema
        val schema = objectMapper.valueToTree<JsonNode>(form.schema)
        val fields = parseFormFields(schema)

        return FormStructureDTO(
            formId = form.id!!,
            title = form.title,
            description = form.description,
            fields = fields,
            ownerName = form.owner.fullName,
            isGroupForm = isGroupForm,
            groupName = groupName
        )
    }

    private fun parseFormFields(schema: JsonNode): List<FormFieldDTO> {
        val fields = mutableListOf<FormFieldDTO>()
        val properties = schema.get("properties")
        val required = schema.get("required")?.let { 
            it.map { node -> node.asText() }.toSet() 
        } ?: emptySet()

        var order = 0
        properties.fields().forEach { entry ->
            val fieldId = entry.key
            val fieldSchema = entry.value
            val fieldType = determineFieldType(fieldSchema)
            val validation = parseValidation(fieldSchema)
            val options = parseOptions(fieldSchema)

            fields.add(
                FormFieldDTO(
                    id = fieldId,
                    name = fieldSchema.get("title")?.asText() ?: fieldId,
                    type = fieldType,
                    required = required.contains(fieldId),
                    placeholder = fieldSchema.get("placeholder")?.asText(),
                    description = fieldSchema.get("description")?.asText(),
                    options = options,
                    validation = validation,
                    defaultValue = fieldSchema.get("default")?.let { parseDefaultValue(it, fieldType) },
                    order = order++
                )
            )
        }

        return fields.sortedBy { it.order }
    }

    private fun determineFieldType(schema: JsonNode): FieldType {
        return when {
            schema.has("enum") -> {
                when {
                    schema.get("multipleOf")?.asBoolean() == true -> FieldType.MULTI_SELECT
                    schema.get("type")?.asText() == "boolean" -> FieldType.CHECKBOX
                    else -> FieldType.DROPDOWN
                }
            }
            schema.get("type")?.asText() == "boolean" -> FieldType.BOOLEAN
            schema.get("type")?.asText() == "number" || schema.get("type")?.asText() == "integer" -> FieldType.NUMBER
            schema.get("format")?.asText() == "email" -> FieldType.EMAIL
            schema.get("format")?.asText() == "date-time" -> FieldType.DATETIME
            schema.get("format")?.asText() == "date" -> FieldType.DATE
            schema.get("format")?.asText() == "phone" -> FieldType.PHONE
            schema.get("maxLength")?.asInt() ?: 0 > 100 -> FieldType.TEXTAREA
            else -> FieldType.TEXT
        }
    }

    private fun parseValidation(schema: JsonNode): FieldValidation? {
        if (!hasValidation(schema)) return null

        return FieldValidation(
            minLength = schema.get("minLength")?.asInt(),
            maxLength = schema.get("maxLength")?.asInt(),
            minValue = schema.get("minimum")?.numberValue(),
            maxValue = schema.get("maximum")?.numberValue(),
            pattern = schema.get("pattern")?.asText(),
            customValidation = schema.get("customValidation")?.asText()
        )
    }

    private fun hasValidation(schema: JsonNode): Boolean {
        return schema.has("minLength") || 
               schema.has("maxLength") || 
               schema.has("minimum") || 
               schema.has("maximum") || 
               schema.has("pattern") || 
               schema.has("customValidation")
    }

    private fun parseOptions(schema: JsonNode): List<FormFieldOption>? {
        if (!schema.has("enum") || !schema.has("enumNames")) return null

        val values = schema.get("enum").map { it.asText() }
        val labels = schema.get("enumNames").map { it.asText() }

        return values.zip(labels).map { (value, label) ->
            FormFieldOption(value, label)
        }
    }

    private fun parseDefaultValue(node: JsonNode, type: FieldType): Any? {
        return when (type) {
            FieldType.NUMBER -> node.numberValue()
            FieldType.BOOLEAN -> node.booleanValue()
            else -> node.asText()
        }
    }
} 