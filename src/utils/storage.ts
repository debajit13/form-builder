import { FormData, FormSubmission } from '../types/form';

const FORMS_KEY = 'dynamic-forms';
const SUBMISSIONS_KEY = 'form-submissions';

export const storage = {
  getForms(): FormData[] {
    try {
      const data = localStorage.getItem(FORMS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveForm(form: FormData): void {
    try {
      const forms = this.getForms();
      const existingIndex = forms.findIndex(f => f.id === form.id);

      if (existingIndex >= 0) {
        forms[existingIndex] = form;
      } else {
        forms.push(form);
      }

      localStorage.setItem(FORMS_KEY, JSON.stringify(forms));
    } catch (error) {
      console.error('Failed to save form:', error);
    }
  },

  deleteForm(formId: string): void {
    try {
      const forms = this.getForms().filter(f => f.id !== formId);
      localStorage.setItem(FORMS_KEY, JSON.stringify(forms));
    } catch (error) {
      console.error('Failed to delete form:', error);
    }
  },

  getFormById(id: string): FormData | undefined {
    return this.getForms().find(form => form.id === id);
  },

  getSubmissions(formId?: string): FormSubmission[] {
    try {
      const data = localStorage.getItem(SUBMISSIONS_KEY);
      const submissions = data ? JSON.parse(data) : [];
      return formId ? submissions.filter((s: FormSubmission) => s.formId === formId) : submissions;
    } catch {
      return [];
    }
  },

  saveSubmission(submission: FormSubmission): void {
    try {
      const submissions = this.getSubmissions();
      submissions.push(submission);
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
    } catch (error) {
      console.error('Failed to save submission:', error);
    }
  }
};