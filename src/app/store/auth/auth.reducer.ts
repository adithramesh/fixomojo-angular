
import { createFeature, createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { SignupResponseDTO, SignupUserRequestDTO } from '../../models/auth.model';

interface AuthState {
  user: SignupResponseDTO | null;
  username:string|null;
  tempUserId: string | null;
  phoneNumber: string | null;
  error: any;
  loading: boolean;
}

export const initialState: AuthState = {
  user: null,
  username:null,
  tempUserId: null,
  phoneNumber: null,
  error: null,
  loading: false,
};

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialState,
    on(AuthActions.signUpUser, (state, { signUpData }) => ({
      ...state,
      loading: true,
      phoneNumber: signUpData.phoneNumber,
    })),
    on(AuthActions.signUpSuccess, (state, { response }) => ({
      ...state,
      tempUserId: response.tempUserId || null,
      loading: false,
      error: null,
    })),
    on(AuthActions.signUpFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(AuthActions.verifyOtp, state => ({ ...state, loading: true })),
    on(AuthActions.verifyOtpSuccess, (state, { response }) => ({
      ...state,
      user: response,
      username:response.data?.username||null,
      tempUserId: null,
      phoneNumber: null,
      loading: false,
      error: null,
    })),
    on(AuthActions.verifyOtpFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(AuthActions.resendOtp, state => ({ ...state, loading: true })),
    on(AuthActions.resendOtpSuccess, (state, { response }) => ({
      ...state,
      tempUserId: response.tempUserId || state.tempUserId,
      loading: false,
      error: null,
    })),
    on(AuthActions.resendOtpFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(AuthActions.setUser, (state, { user }) => ({ ...state, user })),
    on(AuthActions.logout, () => initialState)
  ),
});

export const {
  name: authFeatureKey,
  reducer: authReducer,
  selectAuthState,
  selectUser,
  selectTempUserId,
  selectPhoneNumber,
  selectError,
  selectLoading,
} = authFeature;