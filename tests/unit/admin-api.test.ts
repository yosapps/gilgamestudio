import { beforeEach, describe, it, expect, vi } from 'vitest';
const state = vi.hoisted(() => ({
  configured: true,
  user: { id: 'admin' } as { id: string } | null,
  admin: true,
  error: null as { code: string } | null,
}));
const query = vi.hoisted(() => ({
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
}));
const from = vi.hoisted(() => vi.fn(() => query));
vi.mock('@/lib/supabase', () => ({
  configured: () => state.configured,
  supabase: async () => ({
    auth: { getUser: async () => ({ data: { user: state.user } }) },
    rpc: async () => ({ data: state.admin }),
    from,
  }),
}));
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));
import { POST } from '../../src/app/api/admin/[resource]/route';
import { demoPosts, demoGames, demoSettings } from '../../src/lib/demo';
const id = '11111111-1111-4111-8111-111111111111';
const request = (
  resource: string,
  body: unknown,
  origin = 'http://localhost:3000',
) =>
  POST(
    new Request(`http://localhost:3000/api/admin/${resource}`, {
      method: 'POST',
      headers: { origin, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ resource }) },
  );
beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(state, {
    configured: true,
    user: { id: 'admin' },
    admin: true,
    error: null,
  });
  for (const k of ['insert', 'update', 'delete', 'eq', 'select'] as const)
    query[k].mockReturnValue(query);
  query.single.mockImplementation(async () => ({
    data: state.error ? null : { id },
    error: state.error,
  }));
});
describe('管理API認可', () => {
  it('未接続を偽装せず503', async () => {
    state.configured = false;
    expect((await request('posts', {})).status).toBe(503);
    expect(from).not.toHaveBeenCalled();
  });
  it('未認証は401・書き込みなし', async () => {
    state.user = null;
    expect((await request('posts', { data: demoPosts[0] })).status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });
  it('一般ユーザーは403・書き込みなし', async () => {
    state.admin = false;
    expect((await request('games', { data: demoGames[0] })).status).toBe(403);
    expect(from).not.toHaveBeenCalled();
  });
  it('別Originを拒否する', async () => {
    expect(
      (await request('posts', { data: demoPosts[0] }, 'https://evil.example'))
        .status,
    ).toBe(403);
    expect(from).not.toHaveBeenCalled();
  });
  it('prototypeキーをリソースとして扱わない', async () =>
    expect((await request('constructor', {})).status).toBe(404));
});
describe('管理API CRUD', () => {
  it('記事の作成は検証済みのフィールドのみ保存', async () => {
    expect(
      (await request('posts', { data: { ...demoPosts[0], is_admin: true } }))
        .status,
    ).toBe(200);
    expect(query.insert).toHaveBeenCalledWith(
      expect.objectContaining({ title: demoPosts[0].title }),
    );
    expect(query.insert.mock.calls[0][0]).not.toHaveProperty('is_admin');
  });
  it('ゲームの更新は指定IDに限定', async () => {
    expect((await request('games', { id, data: demoGames[0] })).status).toBe(
      200,
    );
    expect(query.update).toHaveBeenCalled();
    expect(query.eq).toHaveBeenCalledWith('id', id);
  });
  it('設定を単一行に限定', async () => {
    expect(
      (await request('settings', { id: 99, data: demoSettings })).status,
    ).toBe(200);
    expect(query.eq).toHaveBeenCalledWith('id', 1);
  });
  it('削除する', async () => {
    expect((await request('posts', { id, action: 'delete' })).status).toBe(200);
    expect(query.delete).toHaveBeenCalled();
  });
  it('設定の削除を拒否', async () =>
    expect(
      (await request('settings', { id: 1, action: 'delete' })).status,
    ).toBe(400));
  it('不正なID・本文を拒否', async () => {
    expect(
      (await request('posts', { id: 'bad', data: demoPosts[0] })).status,
    ).toBe(400);
    expect(
      (await request('posts', { data: { ...demoPosts[0], slug: 'BAD SLUG' } }))
        .status,
    ).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });
  it('重複slugは409を返す', async () => {
    state.error = { code: '23505' };
    const res = await request('posts', { data: demoPosts[0] });
    expect(res.status).toBe(409);
    expect((await res.json()).error).toContain('スラッグ');
  });
});
