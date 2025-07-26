import Cookies from 'js-cookie';
import { Assessment } from '../types';

const COOKIE_KEYS = {
  ASSESSMENTS: 'gradeflow_assessments',
  CURRENT_ASSESSMENT: 'gradeflow_current_assessment',
  MARKING_CRITERIA: 'gradeflow_marking_criteria',
  INSTRUCTIONS: 'gradeflow_instructions',
} as const;

export class CookieService {
  static getAssessments(): Assessment[] {
    try {
      const data = Cookies.get(COOKIE_KEYS.ASSESSMENTS);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      // Convert string dates back to Date objects
      return parsed.map((assessment: any) => ({
        ...assessment,
        createdAt: new Date(assessment.createdAt),
        updatedAt: new Date(assessment.updatedAt),
      }));
    } catch (error) {
      console.error('Error parsing assessments from cookies:', error);
      return [];
    }
  }

  static saveAssessments(assessments: Assessment[]): void {
    try {
      Cookies.set(COOKIE_KEYS.ASSESSMENTS, JSON.stringify(assessments), { expires: 365 });
    } catch (error) {
      console.error('Error saving assessments to cookies:', error);
    }
  }

  static addAssessment(assessment: Assessment): void {
    const assessments = this.getAssessments();
    assessments.push(assessment);
    this.saveAssessments(assessments);
  }

  static updateAssessment(updatedAssessment: Assessment): void {
    const assessments = this.getAssessments();
    const index = assessments.findIndex(a => a.id === updatedAssessment.id);
    if (index !== -1) {
      assessments[index] = updatedAssessment;
      this.saveAssessments(assessments);
    }
  }

  static deleteAssessment(assessmentId: string): void {
    const assessments = this.getAssessments();
    const filtered = assessments.filter(a => a.id !== assessmentId);
    this.saveAssessments(filtered);
  }

  static getAssessment(assessmentId: string): Assessment | null {
    const assessments = this.getAssessments();
    return assessments.find(a => a.id === assessmentId) || null;
  }

  static getCurrentAssessment(): Assessment | null {
    try {
      const data = Cookies.get(COOKIE_KEYS.CURRENT_ASSESSMENT);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      // Convert string dates back to Date objects
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
      };
    } catch (error) {
      console.error('Error parsing current assessment from cookies:', error);
      return null;
    }
  }

  static setCurrentAssessment(assessment: Assessment | null): void {
    try {
      if (assessment) {
        Cookies.set(COOKIE_KEYS.CURRENT_ASSESSMENT, JSON.stringify(assessment), { expires: 7 });
      } else {
        Cookies.remove(COOKIE_KEYS.CURRENT_ASSESSMENT);
      }
    } catch (error) {
      console.error('Error saving current assessment to cookies:', error);
    }
  }

  static getMarkingCriteria(): string {
    return Cookies.get(COOKIE_KEYS.MARKING_CRITERIA) || '';
  }

  static setMarkingCriteria(criteria: string): void {
    Cookies.set(COOKIE_KEYS.MARKING_CRITERIA, criteria, { expires: 365 });
  }

  static getInstructions(): string {
    return Cookies.get(COOKIE_KEYS.INSTRUCTIONS) || '';
  }

  static setInstructions(instructions: string): void {
    Cookies.set(COOKIE_KEYS.INSTRUCTIONS, instructions, { expires: 365 });
  }

  static clearAllData(): void {
    Object.values(COOKIE_KEYS).forEach(key => {
      Cookies.remove(key);
    });
  }

  static deleteAllAssessments(): void {
    this.saveAssessments([]);
  }
} 