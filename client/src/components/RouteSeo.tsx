import { useLocation } from 'react-router-dom';
import { useAppSeo } from '../lib/seo';

const PRIVATE_ROUTES: Record<string, { title: string; description?: string }> = {
  '/login': { title: 'Sign in | Trackly' },
  '/register': { title: 'Create your account | Trackly' },
  '/forgot-password': { title: 'Reset your password | Trackly' },
  '/reset-password': { title: 'Choose a new password | Trackly' },
  '/auth/success': { title: 'Signing you in | Trackly' },
  '/dashboard': { title: 'Dashboard | Trackly' },
  '/log': { title: 'Log an entry | Trackly' },
  '/history': { title: 'History | Trackly' },
  '/categories': { title: 'Categories | Trackly' },
  '/profile': { title: 'Profile | Trackly' },
};

function PrivateRouteSeo({ title, description }: { title: string; description?: string }) {
  useAppSeo(title, description);
  return null;
}

/**
 * Adds noindex + a private-page title for auth and app routes.
 * Public routes are handled by their own useSeo() calls.
 */
export function RouteSeo() {
  const { pathname } = useLocation();
  const entry = PRIVATE_ROUTES[pathname];

  if (!entry) return null;

  return <PrivateRouteSeo title={entry.title} description={entry.description} />;
}
