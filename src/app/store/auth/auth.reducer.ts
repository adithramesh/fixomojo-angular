
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { SignupResponseDTO, SignupUserRequestDTO } from '../../models/auth.model';

interface AuthState {
  user: SignupResponseDTO | null;
  username:string|null;
  tempUserId: string | null;
  phoneNumber: string | null;
  resetToken:string|null;
  error: any;
  loading: boolean;
}

export const initialState: AuthState = {
  user: null,
  username:null,
  tempUserId: null,
  phoneNumber: null,
  resetToken:null,
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
      username: response.data?.username || null,
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
      tempUserId:response.data?.id  || null,
      resetToken:response.reset_token || null,
      phoneNumber: response.data?.phoneNumber || null,
      loading: false,
      error: null,
    })),
    on(AuthActions.verifyOtpFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),

    on(AuthActions.resendOtp, state => ({ ...state, loading: true })),
    on(AuthActions.resendOtpSuccess, (state ) => ({
      ...state,
      // tempUserId: response.tempUserId || state.tempUserId,
      loading: false,
      error: null,
    })),
    on(AuthActions.resendOtpFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),
    on(AuthActions.forgotPassword, (state, { data }) => ({
      ...state,
      loading: true,
      phoneNumber:data.phoneNumber,
    })),
    on(AuthActions.forgotPasswordSuccess, (state, { response }) => ({
      ...state,
      tempUserId:response.tempUserId || null,
      loading: false,
      error: null,
    })),
    on(AuthActions.forgotPasswordFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),
    on(AuthActions.resetPassword, (state,{resetData}) => ({ 
      ...state, 
      // resetToken:state.resetToken,
      // tempUserId:resetData.tempUserId,
      loading: true 
    })),
    on(AuthActions.resetPasswordSuccess, (state) => ({
      ...state,
      tempUserId: null,
      reset_token:null,
      loading: false,
      error: null,
    })),
    on(AuthActions.resetPasswordFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),
    on(AuthActions.login, state => ({ ...state, loading: true })),
    on(AuthActions.loginSuccess, (state, { response }) => ({
      ...state,
      user: response,
      phoneNumber:response.data?.phoneNumber || null,
      tempUserId: response.data?.id || null,
      username: response.data?.username || null,
      loading: false,
      error: null,
    })),
    on(AuthActions.loginFailure, (state, { error }) => ({
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
  selectUsername,
  selectTempUserId,
  selectPhoneNumber,
  selectResetToken,
  selectError,
  selectLoading,
} = authFeature;


export const selectUserRole = createSelector(
  selectUser,
  (user) => user?.data?.role || null
);