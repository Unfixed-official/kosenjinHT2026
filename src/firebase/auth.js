import { OAuthProvider, signInAnonymously, signInWithCredential, signOut } from 'firebase/auth';
import * as AuthSession from 'expo-auth-session';
import { auth } from './config';

const useProxy = true;

export async function signInGoogle() {
  const redirectUri = AuthSession.makeRedirectUri({ useProxy });
  return { ok: false, reason: `Google OAuthはFirebase Console設定後に有効化してください。redirectUri=${redirectUri}` };
}

export async function signInDiscord() {
  return { ok: false, reason: 'Discord OAuthはMVP最小版ではプレースホルダーです。' };
}

export async function signInX() {
  return { ok: false, reason: 'X OAuthはMVP最小版ではプレースホルダーです。' };
}

export async function signInGuest() {
  await signInAnonymously(auth);
  return { ok: true };
}

export async function signInWithCustomOauthIdToken(providerId, idToken) {
  const provider = new OAuthProvider(providerId);
  const credential = provider.credential({ idToken });
  await signInWithCredential(auth, credential);
}

export async function logout() {
  await signOut(auth);
}
