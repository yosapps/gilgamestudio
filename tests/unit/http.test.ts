import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  readLimitedBody,
  BodyTooLarge,
  isSameOrigin,
} from '../../src/lib/http';
afterEach(() => vi.unstubAllEnvs());
describe('trusted external origin', () => {
  it('allows the configured URL behind an internal proxy', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://studio.example');
    expect(
      isSameOrigin(
        new Request('http://0.0.0.0:3000/api/admin/posts', {
          headers: { origin: 'https://studio.example' },
        }),
      ),
    ).toBe(true);
  });
  it('does not trust forged forwarded hosts', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://studio.example');
    expect(
      isSameOrigin(
        new Request('http://0.0.0.0:3000/api/admin/posts', {
          headers: {
            origin: 'https://evil.example',
            'x-forwarded-host': 'evil.example',
          },
        }),
      ),
    ).toBe(false);
  });
});
describe('request byte limit', () => {
  it('checks actual bytes without Content-Length', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: '日本語',
    });
    await expect(readLimitedBody(request, 8)).rejects.toBeInstanceOf(
      BodyTooLarge,
    );
  });
  it('accepts content at the limit', async () => {
    const bytes = await readLimitedBody(
      new Request('http://localhost', { method: 'POST', body: '日本語' }),
      9,
    );
    expect(new TextDecoder().decode(bytes)).toBe('日本語');
  });
  it('rejects overreported Content-Length before reading', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Length': '100' },
      body: 'x',
    });
    await expect(readLimitedBody(request, 10)).rejects.toBeInstanceOf(
      BodyTooLarge,
    );
  });
});
