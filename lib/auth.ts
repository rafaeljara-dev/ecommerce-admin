import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase';

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;

    if (!token) {
      return null;
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    return {
      userId: decodedToken.uid,
      email: decodedToken.email,
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function verifyAuthToken(authHeader: string | null) {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    return {
      userId: decodedToken.uid,
      email: decodedToken.email,
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}
