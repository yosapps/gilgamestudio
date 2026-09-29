import { describe, expect, it } from 'vitest';
import { resolveLocale } from '../../src/lib/locale';
import { translator } from '../../src/lib/translations';

describe('visitor language selection', () => {
  it('honors a saved choice before the browser language', () => {
    expect(resolveLocale('ja', 'en-US,en;q=0.9')).toBe('ja');
    expect(resolveLocale('en', 'ja-JP,ja;q=0.9')).toBe('en');
  });
  it('matches language regions in preference order', () => {
    expect(resolveLocale(undefined, 'en-GB,en;q=0.9,ja;q=0.8')).toBe('en');
    expect(resolveLocale(undefined, 'en;q=0.5,ja-JP;q=0.9')).toBe('ja');
    expect(resolveLocale(undefined, 'fr-FR,ja;q=0.8,en;q=0.5')).toBe('ja');
  });
  it('ignores invalid cookies and rejected language ranges', () => {
    expect(resolveLocale('other', 'en;q=0,ja;q=1')).toBe('ja');
    expect(resolveLocale(undefined, 'ja;q=invalid,en;q=0.7')).toBe('en');
    expect(resolveLocale(undefined, 'de-DE')).toBe('en');
    expect(resolveLocale()).toBe('ja');
  });
  it('translates UI while preserving original untranslated CMS text', () => {
    expect(translator('en')('ゲームを探索する')).toBe('Explore our games');
    expect(translator('ja')('ゲームを探索する')).toBe('ゲームを探索する');
    expect(translator('en')('A custom CMS title')).toBe('A custom CMS title');
  });
});
