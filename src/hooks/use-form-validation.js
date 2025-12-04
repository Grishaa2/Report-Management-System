"use client"

import { useState, useCallback } from "react"

export const useFormValidation = (initialValues, validations) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target
      setValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }))
      // Clear error for the field as user types
      if (errors[name]) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: "",
        }))
      }
    },
    [errors],
  )

  const validateForm = useCallback(() => {
    const newErrors = {}
    let isValid = true

    for (const field in validations) {
      const value = values[field]
      const validationRules = validations[field]

      if (validationRules.required && (!value || (typeof value === "string" && value.trim() === ""))) {
        newErrors[field] = validationRules.errorMessage || `${field} is required.`
        isValid = false
      } else if (validationRules.minLength && value.length < validationRules.minLength) {
        newErrors[field] =
          validationRules.errorMessage || `${field} must be at least ${validationRules.minLength} characters.`
        isValid = false
      } else if (validationRules.pattern && !validationRules.pattern.test(value)) {
        newErrors[field] = validationRules.errorMessage || `Invalid ${field} format.`
        isValid = false
      }
      // Add more validation rules as needed (e.g., maxLength, min, max, custom functions)
    }

    setErrors(newErrors)
    return isValid
  }, [values, validations])

  return {
    values,
    errors,
    handleChange,
    validateForm,
    setValues, // In case the form needs to be reset or pre-filled
    setErrors, // In case errors need to be cleared externally
  }
}
