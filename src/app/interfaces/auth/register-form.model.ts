import { FormControl, FormGroup } from '@angular/forms';

export interface RegisterAccountForm {
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

export interface RegisterIdentityForm {
  username: FormControl<string>;
  fullName: FormControl<string>;
  career: FormControl<string>;
}

export interface RegisterPreferencesForm {
  bio: FormControl<string>;
  selectedInterests: FormControl<string[]>;
  isActive: FormControl<boolean>;
  acceptedTerms: FormControl<boolean>;
}

export interface RegisterForm {
  account: FormGroup<RegisterAccountForm>;
  identity: FormGroup<RegisterIdentityForm>;
  preferences: FormGroup<RegisterPreferencesForm>;
}

export interface RegisterFormValue {
  account: {
    email: string;
    password: string;
    confirmPassword: string;
  };
  identity: {
    username: string;
    fullName: string;
    career: string;
  };
  preferences: {
    bio: string;
    selectedInterests: string[];
    isActive: boolean;
    acceptedTerms: boolean;
  };
}
