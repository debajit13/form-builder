import { v4 as uuidv4 } from 'uuid';
import type {
  FormSchema,
  FieldSchema,
  FormSection,
  FormSettings,
  FormMetadata,
  SelectOption
} from '../types/schema';

export class SchemaBuilder {
  private schema: Partial<FormSchema> = {
    sections: [],
    settings: {},
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
      status: 'draft' as const
    }
  };

  constructor(title: string, description?: string) {
    this.schema = {
      id: uuidv4(),
      title,
      description,
      version: '1.0.0',
      sections: [],
      settings: this.getDefaultSettings(),
      metadata: this.getDefaultMetadata()
    };
  }

  addSection(title: string, description?: string): SectionBuilder {
    const section: FormSection = {
      id: uuidv4(),
      title,
      description,
      fields: []
    };

    this.schema.sections!.push(section);
    return new SectionBuilder(section);
  }

  setSettings(settings: Partial<FormSettings>): SchemaBuilder {
    this.schema.settings = { ...this.schema.settings, ...settings };
    return this;
  }

  setMetadata(metadata: Partial<FormMetadata>): SchemaBuilder {
    this.schema.metadata = { ...this.schema.metadata, ...metadata };
    return this;
  }

  build(): FormSchema {
    if (!this.schema.sections || this.schema.sections.length === 0) {
      throw new Error('Form must have at least one section');
    }

    return this.schema as FormSchema;
  }

  private getDefaultSettings(): FormSettings {
    return {
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
        borderRadius: 'md',
        layout: {
          type: 'grid',
          settings: {
            columnsPerRow: 3,
            sectionSpacing: 'normal',
            responsiveBreakpoints: {
              mobile: 1,
              tablet: 2,
              desktop: 3
            }
          }
        }
      }
    };
  }

  private getDefaultMetadata(): FormMetadata {
    const now = new Date().toISOString();
    return {
      createdAt: now,
      updatedAt: now,
      version: '1.0.0',
      status: 'draft'
    };
  }
}

export class SectionBuilder {
  private section: FormSection;

  constructor(section: FormSection) {
    this.section = section;
  }

  addTextField(
    name: string,
    label: string,
    options: Partial<FieldSchema> = {}
  ): SectionBuilder {
    const field = {
      id: uuidv4(),
      name,
      label,
      type: 'text',
      ...options
    } as FieldSchema;

    this.section.fields.push(field as FieldSchema);
    return this;
  }

  addEmailField(
    name: string,
    label: string,
    options: Partial<FieldSchema> = {}
  ): SectionBuilder {
    const field = {
      id: uuidv4(),
      name,
      label,
      type: 'email',
      ...options
    } as FieldSchema;

    this.section.fields.push(field as FieldSchema);
    return this;
  }

  addNumberField(
    name: string,
    label: string,
    options: Partial<FieldSchema> = {}
  ): SectionBuilder {
    const field = {
      id: uuidv4(),
      name,
      label,
      type: 'number',
      ...options
    } as FieldSchema;

    this.section.fields.push(field as FieldSchema);
    return this;
  }

  addDateField(
    name: string,
    label: string,
    options: Partial<FieldSchema> = {}
  ): SectionBuilder {
    const field = {
      id: uuidv4(),
      name,
      label,
      type: 'date',
      ...options
    } as FieldSchema;

    this.section.fields.push(field as FieldSchema);
    return this;
  }

  addSelectField(
    name: string,
    label: string,
    options: SelectOption[],
    fieldOptions: Partial<FieldSchema> = {}
  ): SectionBuilder {
    const field = {
      id: uuidv4(),
      name,
      label,
      type: 'select',
      options,
      ...fieldOptions
    } as FieldSchema;

    this.section.fields.push(field as FieldSchema);
    return this;
  }

  addTextAreaField(
    name: string,
    label: string,
    options: Partial<FieldSchema> = {}
  ): SectionBuilder {
    const field = {
      id: uuidv4(),
      name,
      label,
      type: 'textarea',
      multiline: true,
      ...options
    } as FieldSchema;

    this.section.fields.push(field as FieldSchema);
    return this;
  }

  addCheckboxField(
    name: string,
    label: string,
    options: SelectOption[] | undefined = undefined,
    fieldOptions: Partial<FieldSchema> = {}
  ): SectionBuilder {
    const field = {
      id: uuidv4(),
      name,
      label,
      type: 'checkbox',
      options,
      ...fieldOptions
    } as FieldSchema;

    this.section.fields.push(field as FieldSchema);
    return this;
  }

  addRadioField(
    name: string,
    label: string,
    options: SelectOption[],
    fieldOptions: Partial<FieldSchema> = {}
  ): SectionBuilder {
    const field = {
      id: uuidv4(),
      name,
      label,
      type: 'radio',
      options,
      ...fieldOptions
    } as FieldSchema;

    this.section.fields.push(field as FieldSchema);
    return this;
  }
}

export const SchemaHelpers = {
  createSelectOptions: (values: string[]): SelectOption[] => {
    return values.map(value => ({
      value: value.toLowerCase().replace(/\s+/g, '-'),
      label: value
    }));
  },

  createSelectOptionsWithLabels: (items: Record<string, string>): SelectOption[] => {
    return Object.entries(items).map(([value, label]) => ({
      value,
      label
    }));
  },

  validateSchema: (schema: FormSchema): string[] => {
    const errors: string[] = [];

    if (!schema.title || schema.title.trim().length === 0) {
      errors.push('Form title is required');
    }

    if (!schema.sections || schema.sections.length === 0) {
      errors.push('Form must have at least one section');
    }

    schema.sections?.forEach((section, sectionIndex) => {
      if (!section.title || section.title.trim().length === 0) {
        errors.push(`Section ${sectionIndex + 1} must have a title`);
      }

      if (!section.fields || section.fields.length === 0) {
        errors.push(`Section "${section.title}" must have at least one field`);
      }

      const fieldNames = new Set<string>();
      section.fields?.forEach((field, fieldIndex) => {
        if (!field.name || field.name.trim().length === 0) {
          errors.push(`Field ${fieldIndex + 1} in section "${section.title}" must have a name`);
        }

        if (fieldNames.has(field.name)) {
          errors.push(`Duplicate field name "${field.name}" in section "${section.title}"`);
        }
        fieldNames.add(field.name);

        if (!field.label || field.label.trim().length === 0) {
          errors.push(`Field "${field.name}" must have a label`);
        }

        if ((field.type === 'select' || field.type === 'radio') && (!field.options || field.options.length === 0)) {
          errors.push(`Field "${field.name}" of type ${field.type} must have options`);
        }
      });
    });

    return errors;
  },

  cloneSchema: (schema: FormSchema): FormSchema => {
    return JSON.parse(JSON.stringify(schema));
  },

  mergeSchemas: (baseSchema: FormSchema, ...schemas: FormSchema[]): FormSchema => {
    const merged = SchemaHelpers.cloneSchema(baseSchema);

    schemas.forEach(schema => {
      merged.sections.push(...schema.sections);
    });

    return merged;
  }
};