package org.example.backend.util

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter(autoApply = true)
class JsonMapConverter : AttributeConverter<Map<String, Any>, String> {
    private val objectMapper = jacksonObjectMapper()

    override fun convertToDatabaseColumn(attribute: Map<String, Any>?): String {
        return attribute?.let { objectMapper.writeValueAsString(it) } ?: "{}"
    }

    override fun convertToEntityAttribute(dbData: String?): Map<String, Any> {
        return dbData?.let {
            objectMapper.readValue(it, Map::class.java) as Map<String, Any>
        } ?: emptyMap()
    }
} 