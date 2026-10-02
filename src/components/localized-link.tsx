'use client';
import NextLink from 'next/link';
import type { ComponentProps } from 'react';
import { useLocale } from './language-provider';
import { localePath } from '@/lib/features';
export default function LocalizedLink({
  href,
  ...props
}: ComponentProps<typeof NextLink>) {
  const locale = useLocale();
  return (
    <NextLink
      {...props}
      href={typeof href === 'string' ? localePath(href, locale) : href}
    />
  );
}
