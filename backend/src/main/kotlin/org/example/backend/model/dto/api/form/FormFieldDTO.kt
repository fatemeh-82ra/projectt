package org.example.backend.model.dto.api.form

data class FormFieldOption(
    val value: String,
    val label: String
)

data class FormFieldDTO(
    val id: String, // Unique identifier for the field
    val name: String, // Field name for the label
    val type: FieldType,
    val required: Boolean,
    val placeholder: String?,
    val description: String?,
    val options: List<FormFieldOption>?, // For dropdown/radio/checkbox
    val validation: FieldValidation?,
    val defaultValue: Any?,
    val order: Int // For maintaining field order
)

data class FieldValidation(
    val minLength: Int?,
    val maxLength: Int?,
    val minValue: Number?,
    val maxValue: Number?,
    val pattern: String?, // Regex pattern for validation
    val customValidation: String? // Custom validation message
)

enum class FieldType {
    TEXT,
    TEXTAREA,
    NUMBER,
    EMAIL,
    PHONE,
    DATE,
    DATETIME,
    BOOLEAN,
    DROPDOWN,
    RADIO,
    CHECKBOX,
    FILE,
    MULTI_SELECT
}

data class FormStructureDTO(
    val formId: Int,
    val title: String,
    val description: String?,
    val fields: List<FormFieldDTO>,
    val ownerName: String,
    val isGroupForm: Boolean,
    val groupName: String?
) 