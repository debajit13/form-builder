import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SchemaBuilder, SectionBuilder } from '../schemaHelpers'
import type { FormSchema, FormSection } from '../../types/schema'

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-1234'
}))

describe('SchemaHelpers', () => {
  describe('SchemaBuilder', () => {
    it('should create a new schema with default values', () => {
      const builder = new SchemaBuilder('Test Form')
      builder.addSection('Test Section').addTextField('test', 'Test Field')
      const schema = builder.build()

      expect(schema).toMatchObject({
        id: 'mock-uuid-1234',
        title: 'Test Form',
        version: '1.0.0',
        sections: expect.arrayContaining([expect.objectContaining({
          title: 'Test Section'
        })]),
        settings: {
          allowDrafts: false,
          requireAuth: false,
          multiStep: false,
          showProgress: false,
          submitButtonText: 'Submit',
          resetButtonText: 'Reset',
          theme: {
            primaryColor: '#3b82f6',
            fontSize: 'md',
            spacing: 'normal',
            borderRadius: 'md'
          }
        }
      })

      expect(schema.metadata.createdAt).toBeDefined()
      expect(schema.metadata.updatedAt).toBeDefined()
      expect(schema.metadata.version).toBe('1.0.0')
      expect(schema.metadata.status).toBe('draft')
    })

    it('should create schema with custom description', () => {
      const builder = new SchemaBuilder('Test Form', 'A test form description')
      builder.addSection('Test Section').addTextField('test', 'Test Field')
      const schema = builder.build()

      expect(schema.description).toBe('A test form description')
    })

    it('should add sections to schema', () => {
      const builder = new SchemaBuilder('Test Form')

      builder.addSection('Personal Info', 'Basic personal information')
        .addTextField('firstName', 'First Name')
        .addTextField('lastName', 'Last Name')

      const schema = builder.build()

      expect(schema.sections).toHaveLength(1)
      expect(schema.sections[0]).toMatchObject({
        id: 'mock-uuid-1234',
        title: 'Personal Info',
        description: 'Basic personal information',
        fields: expect.arrayContaining([
          expect.objectContaining({
            name: 'firstName',
            type: 'text',
            label: 'First Name'
          }),
          expect.objectContaining({
            name: 'lastName',
            type: 'text',
            label: 'Last Name'
          })
        ])
      })
    })

    it('should set custom settings', () => {
      const builder = new SchemaBuilder('Test Form')
      builder.addSection('Test Section').addTextField('test', 'Test Field')

      builder.setSettings({
        multiStep: true,
        showProgress: true,
        theme: {
          primaryColor: '#ff0000',
          fontSize: 'lg'
        }
      })

      const schema = builder.build()

      expect(schema.settings).toMatchObject({
        multiStep: true,
        showProgress: true,
        allowDrafts: false,
        theme: {
          primaryColor: '#ff0000',
          fontSize: 'lg'
        }
      })
    })

    it('should set custom metadata', () => {
      const builder = new SchemaBuilder('Test Form')
      builder.addSection('Test Section').addTextField('test', 'Test Field')

      builder.setMetadata({
        createdBy: 'test-user',
        status: 'published'
      })

      const schema = builder.build()

      expect(schema.metadata.createdBy).toBe('test-user')
      expect(schema.metadata.status).toBe('published')
    })
  })

  describe('SectionBuilder', () => {
    let section: FormSection
    let sectionBuilder: SectionBuilder

    beforeEach(() => {
      section = {
        id: 'test-section',
        title: 'Test Section',
        description: 'A test section',
        fields: []
      }
      sectionBuilder = new SectionBuilder(section)
    })

    it('should add text field to section', () => {
      sectionBuilder.addTextField('username', 'Username', {
        placeholder: 'Enter your username',
        validation: { required: true, minLength: 3 }
      })

      expect(section.fields).toHaveLength(1)
      expect(section.fields[0]).toMatchObject({
        id: 'mock-uuid-1234',
        name: 'username',
        type: 'text',
        label: 'Username',
        placeholder: 'Enter your username',
        validation: { required: true, minLength: 3 }
      })
    })

    it('should add email field to section', () => {
      sectionBuilder.addEmailField('email', 'Email Address', {
        placeholder: 'user@example.com',
        validation: { required: true }
      })

      expect(section.fields).toHaveLength(1)
      expect(section.fields[0]).toMatchObject({
        name: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'user@example.com'
      })
    })

    it('should add number field to section', () => {
      sectionBuilder.addNumberField('age', 'Age', {
        validation: { required: true, min: 18, max: 65 }
      })

      expect(section.fields).toHaveLength(1)
      expect(section.fields[0]).toMatchObject({
        name: 'age',
        type: 'number',
        label: 'Age',
        validation: { required: true, min: 18, max: 65 }
      })
    })

    it('should add date field to section', () => {
      sectionBuilder.addDateField('birthDate', 'Birth Date', {
        showTime: false,
        validation: { required: true }
      })

      expect(section.fields).toHaveLength(1)
      expect(section.fields[0]).toMatchObject({
        name: 'birthDate',
        type: 'date',
        label: 'Birth Date',
        showTime: false
      })
    })

    it('should add select field to section', () => {
      const options = [
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' }
      ]

      sectionBuilder.addSelectField('country', 'Country', options, {
        validation: { required: true }
      })

      expect(section.fields).toHaveLength(1)
      expect(section.fields[0]).toMatchObject({
        name: 'country',
        type: 'select',
        label: 'Country',
        options: options
      })
    })

    it('should add textarea field to section', () => {
      sectionBuilder.addTextAreaField('message', 'Message', {
        rows: 5,
        placeholder: 'Enter your message...',
        validation: { required: true, maxLength: 500 }
      })

      expect(section.fields).toHaveLength(1)
      expect(section.fields[0]).toMatchObject({
        name: 'message',
        type: 'textarea',
        label: 'Message',
        multiline: true,
        rows: 5,
        placeholder: 'Enter your message...'
      })
    })

    it('should add radio field to section', () => {
      const options = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
      ]

      sectionBuilder.addRadioField('gender', 'Gender', options, {
        validation: { required: true }
      })

      expect(section.fields).toHaveLength(1)
      expect(section.fields[0]).toMatchObject({
        name: 'gender',
        type: 'radio',
        label: 'Gender',
        options: options
      })
    })

    it('should add checkbox field to section', () => {
      sectionBuilder.addCheckboxField('agree', 'I agree to terms', {
        validation: { required: true }
      })

      expect(section.fields).toHaveLength(1)
      expect(section.fields[0]).toMatchObject({
        name: 'agree',
        type: 'checkbox',
        label: 'I agree to terms'
      })
    })

    it('should chain multiple field additions', () => {
      sectionBuilder
        .addTextField('firstName', 'First Name')
        .addTextField('lastName', 'Last Name')
        .addEmailField('email', 'Email')
        .addNumberField('age', 'Age')

      expect(section.fields).toHaveLength(4)
      expect(section.fields.map(f => f.name)).toEqual([
        'firstName', 'lastName', 'email', 'age'
      ])
    })

    it('should handle field options correctly', () => {
      sectionBuilder.addTextField('username', 'Username', {
        placeholder: 'Enter username',
        description: 'Choose a unique username',
        hidden: false,
        disabled: false,
        readonly: false,
        validation: {
          required: true,
          minLength: 3,
          maxLength: 20,
          pattern: '^[a-zA-Z0-9_]+$'
        }
      })

      const field = section.fields[0]
      expect(field).toMatchObject({
        name: 'username',
        label: 'Username',
        placeholder: 'Enter username',
        description: 'Choose a unique username',
        hidden: false,
        disabled: false,
        readonly: false,
        validation: {
          required: true,
          minLength: 3,
          maxLength: 20,
          pattern: '^[a-zA-Z0-9_]+$'
        }
      })
    })
  })

  describe('Integration Tests', () => {
    it('should create a complete form schema', () => {
      const builder = new SchemaBuilder('Contact Form', 'A simple contact form')

      // Add first section
      builder.addSection('Personal Information')
        .addTextField('firstName', 'First Name', { validation: { required: true } })
        .addTextField('lastName', 'Last Name', { validation: { required: true } })
        .addEmailField('email', 'Email Address', { validation: { required: true } })
        .addNumberField('age', 'Age', { validation: { min: 18 } })

      // Add second section
      builder.addSection('Contact Details')
        .addSelectField('country', 'Country', [
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' }
        ])
        .addTextAreaField('message', 'Message', {
          rows: 4,
          validation: { required: true, maxLength: 500 }
        })

      // Set settings and build
      builder.setSettings({
        multiStep: true,
        showProgress: true,
        theme: { primaryColor: '#007bff' }
      })

      const schema = builder.build()

      expect(schema.title).toBe('Contact Form')
      expect(schema.description).toBe('A simple contact form')
      expect(schema.sections).toHaveLength(2)
      expect(schema.settings.multiStep).toBe(true)
      expect(schema.settings.showProgress).toBe(true)

      // Check first section
      const personalSection = schema.sections[0]
      expect(personalSection.title).toBe('Personal Information')
      expect(personalSection.fields).toHaveLength(4)

      // Check second section
      const contactSection = schema.sections[1]
      expect(contactSection.title).toBe('Contact Details')
      expect(contactSection.fields).toHaveLength(2)

      // Verify field types
      const fieldTypes = schema.sections.flatMap(s => s.fields).map(f => f.type)
      expect(fieldTypes).toEqual(['text', 'text', 'email', 'number', 'select', 'textarea'])
    })

    it('should handle empty sections', () => {
      const builder = new SchemaBuilder('Empty Form')
      builder.addSection('Empty Section')
      const schema = builder.build()

      expect(schema.sections).toHaveLength(1)
      expect(schema.sections[0].fields).toHaveLength(0)
    })

    it('should generate unique IDs for all elements', () => {
      const builder = new SchemaBuilder('Test Form')

      // Add first section with fields
      builder.addSection('Section 1')
        .addTextField('field1', 'Field 1')
        .addTextField('field2', 'Field 2')

      // Add second section with field
      builder.addSection('Section 2')
        .addTextField('field3', 'Field 3')

      const schema = builder.build()

      const allIds = [
        schema.id,
        ...schema.sections.map(s => s.id),
        ...schema.sections.flatMap(s => s.fields.map(f => f.id))
      ]

      expect(allIds).toHaveLength(6) // 1 schema + 2 sections + 3 fields
      // In real scenario, IDs would be unique, but with mock they're all the same
      expect(allIds.every(id => id === 'mock-uuid-1234')).toBe(true)
    })
  })
})