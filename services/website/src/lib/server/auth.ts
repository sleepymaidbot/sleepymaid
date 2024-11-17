import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { type Session, sessionTable, userData } from "@sleepymaid/db";
import { db } from "./db";
import { sha256 } from "@oslojs/crypto/sha2";
import { eq } from "drizzle-orm";
import type { RequestEvent } from "@sveltejs/kit";
import { Discord } from "arctic";
import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI } from "$env/static/private";

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function createSession(
	token: string,
	userId: string,
	accessToken: string,
	expiresAt: Date,
	refreshToken: string,
): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		accessToken,
		expiresAt,
		refreshToken,
	};
	await db.insert(sessionTable).values(session);
	return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const result = await db
		.select({
			user: {
				userId: userData.userId,
				userName: userData.userName,
				displayName: userData.displayName,
				avatarHash: userData.avatarHash,
			},
			session: sessionTable,
		})
		.from(sessionTable)
		.innerJoin(userData, eq(sessionTable.userId, userData.userId))
		.where(eq(sessionTable.id, sessionId));
	if (result.length < 1) {
		return { session: null, user: null };
	}
	const result0 = result[0];
	const user = result0?.user;
	const session = result0?.session;
	if (!user || !session) {
		return { session: null, user: null };
	}
	if (Date.now() >= session.expiresAt.getTime()) {
		const tokens = await discord.refreshAccessToken(session.refreshToken);
		const accessToken = tokens.accessToken();
		const expiresAt = tokens.accessTokenExpiresAt();
		await db.update(sessionTable).set({ accessToken, expiresAt }).where(eq(sessionTable.id, session.id));
	}
	return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export type SessionValidationResult =
	| {
			session: Session;
			user: {
				userId: string;
				userName: string;
				displayName: string | null;
				avatarHash: string | null;
			};
	  }
	| { session: null; user: null };

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set("session", token, {
		httpOnly: true,
		sameSite: "lax",
		expires: expiresAt,
		path: "/",
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set("session", "", {
		httpOnly: true,
		sameSite: "lax",
		maxAge: 0,
		path: "/",
	});
}

export const discord = new Discord(DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI);
