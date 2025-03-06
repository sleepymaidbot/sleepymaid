import { Result } from "@sapphire/result";
import { userData, sessionTable } from "@sleepymaid/db";
import { createServerFn } from "@tanstack/start";
import { APIUser, Routes } from "discord-api-types/v10";
import { discord } from "../auth";
import { db } from "../db";
import axios from "redaxios";
import { eq } from "drizzle-orm";
import encryptSessionId from "~/utils/encrypt";
import { useSession } from "~/hooks/useSession";
import * as arctic from "arctic";
import { z } from "zod";
import { getCookie, deleteCookie } from "@tanstack/start/server";
import { redirect } from "@tanstack/react-router";

export const loginFn = createServerFn({ method: "GET" })
	.validator(
		z.object({
			code: z.string(),
			state: z.string(),
		}),
	)
	.handler(async (ctx) => {
		console.log("loginFn");
		const code = ctx.data.code;
		const state = ctx.data.state;
		const storedState = getCookie("loginState");

		if (!storedState || storedState !== state) {
			console.log("Invalid state parameter - possible CSRF attack");
			throw new Error("Invalid state parameter - possible CSRF attack");
		}

		const session = await useSession();

		if (!code) {
			console.log("No code provided");
			throw new Error("No code provided");
		}

		const tokensResult = await Result.fromAsync(async () => discord.validateAuthorizationCode(code, null));

		if (tokensResult.isErr()) {
			const e = tokensResult.unwrapErr();
			console.error(e);
			if (e instanceof arctic.OAuth2RequestError) {
				const code = e.code;
				console.log("Code", code);
				console.log("Invalid authorization code, credentials, or redirect URI");
				throw new Error("Invalid authorization code, credentials, or redirect URI");
			} else if (e instanceof arctic.ArcticFetchError) {
				console.log("Failed to call `fetch()`");
				throw new Error("Failed to call `fetch()`");
			} else {
				console.log("Unknown error", e as Error);
				throw new Error("Unknown error", e as Error);
			}
		}

		const tokens = tokensResult.unwrap();

		const accessToken = tokens.accessToken();
		const accessTokenExpiresAt = tokens.accessTokenExpiresAt();
		const refreshToken = tokens.refreshToken();

		const data = await axios.get("https://discord.com/api/v10/users/@me", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const user: APIUser = data.data;

		let dbUser = await db.query.userData.findFirst({
			where: eq(userData.userId, user.id),
		});

		const SESSION_SECRET = process.env.SESSION_SECRET;

		if (!SESSION_SECRET) {
			console.log("SESSION_SECRET environment variable is not set");
			throw new Error("SESSION_SECRET environment variable is not set");
		}

		const sessionId = encryptSessionId(user.id, SESSION_SECRET);
		if (!dbUser) {
			console.log("No user found in database");
			const [newUser] = await db
				.insert(userData)
				.values({
					userId: user.id,
					userName: user.username,
					displayName: user.global_name,
					avatarHash: user.avatar,
				})
				.returning();

			if (!newUser) {
				console.log("Failed to create user");
				throw new Error("Failed to create user");
			}

			dbUser = newUser;

			await db.insert(sessionTable).values({
				id: sessionId,
				userId: newUser.userId,
				accessToken: accessToken,
				refreshToken: refreshToken,
				expiresAt: accessTokenExpiresAt,
			});
		} else {
			await db.insert(sessionTable).values({
				id: sessionId,
				userId: dbUser.userId,
				accessToken: accessToken,
				refreshToken: refreshToken,
				expiresAt: accessTokenExpiresAt,
			});
		}

		const sessionData = {
			userId: dbUser.userId,
			sessionId: sessionId,
		};

		await session.update(sessionData);

		return { success: true };
	});
