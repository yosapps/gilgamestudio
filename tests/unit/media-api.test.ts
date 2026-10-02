import { beforeEach, describe, it, expect, vi } from 'vitest';
const state = vi.hoisted(() => ({
  configured: true,
  user: { id: 'admin' } as { id: string } | null,
  admin: true,
}));
const query = vi.hoisted(() => ({
  select: vi.fn(),
  order: vi.fn(),
  ilike: vi.fn(),
  range: vi.fn(),
}));
const from = vi.hoisted(() => vi.fn(() => query));
vi.mock('@/lib/supabase', () => ({
  configured: () => state.configured,
  supabase: async () => ({
    auth: { getUser: async () => ({ data: { user: state.user } }) },
    rpc: async () => ({ data: state.admin, error: null }),
    from,
  }),
}));
import { GET } from '@/app/api/admin/media/route';
beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(state, {
    configured: true,
    user: { id: 'admin' },
    admin: true,
  });
  query.select.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.ilike.mockReturnValue(query);
  query.range.mockResolvedValue({
    data: Array.from({ length: 49 }, (_, id) => ({
      id: String(id),
      name: 'Image',
      url: '/logo.png',
      size: 100,
    })),
    error: null,
  });
});
describe('メディア選択API', () => {
  it('未認証と一般ユーザーには画像一覧を返さない', async () => {
    state.user = null;
    expect(
      (await GET(new Request('http://localhost/api/admin/media'))).status,
    ).toBe(401);
    state.user = { id: 'user' };
    state.admin = false;
    expect(
      (await GET(new Request('http://localhost/api/admin/media'))).status,
    ).toBe(403);
    expect(from).not.toHaveBeenCalled();
  });
  it('管理者だけが検索とページ送りを利用できる', async () => {
    const response = await GET(
      new Request('http://localhost/api/admin/media?q=logo%25_&page=2'),
    );
    const data = await response.json();
    expect(query.ilike).toHaveBeenCalledWith('name', '%logo%');
    expect(query.range).toHaveBeenCalledWith(96, 144);
    expect(data.items).toHaveLength(48);
    expect(data.hasMore).toBe(true);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('接続エラーを空の一覧として扱わない', async () => {
    query.range.mockResolvedValue({
      data: null,
      error: { message: 'failure' },
    });
    expect(
      (await GET(new Request('http://localhost/api/admin/media'))).status,
    ).toBe(503);
  });
});
