'use client';
import { createContext, useContext, type ReactNode } from 'react';
import type { Locale } from '@/lib/locale';
import { translator } from '@/lib/translations';

const LanguageContext = createContext<Locale>('ja');
export function LanguageProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <LanguageContext.Provider value={locale}>
      {children}
    </LanguageContext.Provider>
  );
}
export function useTranslator() {
  return translator(useContext(LanguageContext));
}
export function useLocale() {
  return useContext(LanguageContext);
}
