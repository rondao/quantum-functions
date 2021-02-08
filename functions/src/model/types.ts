export interface Signup {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface Class {
  id?: string;
  name: string;
  subject: string;
  professor: string;
}
