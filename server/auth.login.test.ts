import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";
import { hashPassword } from "./_core/password";

type CookieCall = {
  name: string;
  value?: string;
  options: Record<string, unknown>;
};

function createBaseContext(): { ctx: TrpcContext; cookies: CookieCall[] } {
  const cookies: CookieCall[] = [];
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        cookies.push({ name, value, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        cookies.push({ name, value: undefined, options });
      },
    } as any,
  };
  return { ctx, cookies };
}

describe("auth.login", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("denies unknown email", async () => {
    vi.spyOn(db, "getUserByEmail").mockResolvedValue(undefined as any);
    const { ctx } = createBaseContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({ email: "no@user.test", password: "foo" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("denies wrong password", async () => {
    const fakeUser = {
      openId: "u1",
      email: "me@test.com",
      name: "Me",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      passwordHash: hashPassword("correct"),
      id: 1,
    };
    vi.spyOn(db, "getUserByEmail").mockResolvedValue(fakeUser as any);
    const { ctx } = createBaseContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({ email: "me@test.com", password: "bad" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("issues session cookie when credentials are valid", async () => {
    const password = "secret123";
    const fakeUser = {
      openId: "u2",
      email: "you@test.com",
      name: "You",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      passwordHash: hashPassword(password),
      id: 2,
    };
    vi.spyOn(db, "getUserByEmail").mockResolvedValue(fakeUser as any);
    // spy on upsertUser to ensure lastSignedIn update
    const upsertSpy = vi.spyOn(db, "upsertUser").mockResolvedValue();

    const { ctx, cookies } = createBaseContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.login({ email: fakeUser.email!, password });
    expect(result).toEqual({ success: true });
    expect(cookies).toHaveLength(1);
    expect(cookies[0]?.name).toBe(COOKIE_NAME);
    expect(cookies[0]?.options).toMatchObject({ secure: true, sameSite: "none" });
    expect(upsertSpy).toHaveBeenCalled();
  });
});

describe("auth.requestPasswordReset", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("responds success even if user doesn't exist", async () => {
    vi.spyOn(db, "getUserByEmail").mockResolvedValue(undefined as any);
    const { ctx } = createBaseContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.requestPasswordReset({ email: "none@test" });
    expect(result).toEqual({ success: true });
  });

  it("logs when user exists", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(db, "getUserByEmail").mockResolvedValue({ id: 1 } as any);
    const { ctx } = createBaseContext();
    const caller = appRouter.createCaller(ctx);

    await caller.auth.requestPasswordReset({ email: "exists@test" });
    expect(spy).toHaveBeenCalledWith("[Auth] password reset requested for", "exists@test");
    spy.mockRestore();
  });
});
