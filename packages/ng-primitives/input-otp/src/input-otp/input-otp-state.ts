import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpInputOtp } from './input-otp';

/**
 * The state token for the InputOtp primitive.
 */
export const NgpInputOtpStateToken = createStateToken<NgpInputOtp>('InputOtp');

/**
 * Provides the InputOtp state.
 */
export const provideInputOtpState = createStateProvider(NgpInputOtpStateToken);

/**
 * Injects the InputOtp state.
 */
export const injectInputOtpState = createStateInjector<NgpInputOtp>(NgpInputOtpStateToken);

/**
 * The InputOtp state registration function.
 */
export const inputOtpState = createState(NgpInputOtpStateToken);
