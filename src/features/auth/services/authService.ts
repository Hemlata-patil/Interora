import type {
  AuthService,
  StudentRegistrationPayload,
  PasswordResetPayload,
  NewPasswordPayload,
} from '../types/auth';

class MockAuthProvider implements AuthService {
  async registerStudent(payload: StudentRegistrationPayload): Promise<{ success: boolean; studentId: string }> {
    await new Promise((r) => setTimeout(r, 400));
    // Store basic metadata in localStorage if needed for prototype session
    localStorage.setItem('interora_registered_email', payload.email);
    localStorage.setItem('interora_registered_name', payload.fullName);
    return { success: true, studentId: `std_${Date.now()}` };
  }

  async loginStudent(email: string, password: string): Promise<{ success: boolean; studentId: string }> {
    await new Promise((r) => setTimeout(r, 400));
    return { success: true, studentId: 'student_alex_01' };
  }

  async requestPasswordReset(payload: PasswordResetPayload): Promise<{ success: boolean; message: string }> {
    await new Promise((r) => setTimeout(r, 400));
    return {
      success: true,
      message: 'Password recovery request prepared (Frontend Prototype Mode).',
    };
  }

  async resetPassword(payload: NewPasswordPayload): Promise<{ success: boolean; message: string }> {
    await new Promise((r) => setTimeout(r, 400));
    return {
      success: true,
      message: 'Password successfully updated (Frontend Prototype Mode).',
    };
  }
}

export const authService: AuthService = new MockAuthProvider();