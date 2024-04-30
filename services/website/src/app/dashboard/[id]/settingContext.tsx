"use client";

import { createContext } from "react";
import type { RouterOutputs } from "@/trpc/react";

export const SettingContext = createContext<RouterOutputs["guilds"]["getGuildSettings"]>(null);
