"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function GoogleSuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleGoogleAuth = async () => {
      const token = searchParams.get("token");
      const refreshToken = searchParams.get("refresh_token");
      
      console.log("Google Success - Token:", token ? "present" : "missing");
      console.log("Google Success - Refresh Token:", refreshToken ? "present" : "missing");
      
      if (token && refreshToken) {
        // Check if this is a popup window
        if (window.opener) {
          console.log("Popup mode - sending to parent");
          // Send tokens to parent window
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_SUCCESS',
            access_token: token,
            refresh_token: refreshToken,
          }, window.location.origin);
          
          setStatus('success');
          
          // Close popup after short delay
          setTimeout(() => {
            window.close();
          }, 1500);
        } else {
          console.log("Direct mode - storing tokens");
          // Not a popup, store directly and redirect
          localStorage.setItem('access_token', token);
          localStorage.setItem('refresh_token', refreshToken);
          window.location.href = '/';
        }
      } else {
        console.log("Error - tokens missing");
        setStatus('error');
        setTimeout(() => {
          if (window.opener) {
            window.close();
          } else {
            window.location.href = '/login';
          }
        }, 2000);
      }
    };

    handleGoogleAuth();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-4 p-8 bg-gray-900 rounded-lg">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-lg">Connexion en cours...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-400 text-lg">Connexion réussie !</p>
            <p className="text-gray-400 text-sm">Cette fenêtre va se fermer...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-400 text-lg">Erreur de connexion</p>
            <p className="text-gray-400 text-sm">Redirection...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function GoogleSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4 p-8 bg-gray-900 rounded-lg">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    }>
      <GoogleSuccessContent />
    </Suspense>
  );
}
