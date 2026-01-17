
"use client";

export default function Badge() {
  const userAuth = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

  if (!userAuth) return null;

  let user = null;
  try {
    user = JSON.parse(userAuth);
  } catch (e) {
    // If stored value is invalid JSON (eg. 'undefined'), don't crash the app
    return null;
  }

  if (!user) return null;

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
      {user.firstName} {user.lastName}
    </span>
  );
}
