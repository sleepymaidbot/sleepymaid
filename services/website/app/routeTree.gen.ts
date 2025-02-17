/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from "./routes/__root";
import { Route as UsersImport } from "./routes/users";
import { Route as RedirectImport } from "./routes/redirect";
import { Route as PostsImport } from "./routes/posts";
import { Route as LoginImport } from "./routes/login";
import { Route as DeferredImport } from "./routes/deferred";
import { Route as DashboardImport } from "./routes/dashboard";
import { Route as LayoutImport } from "./routes/_layout";
import { Route as IndexImport } from "./routes/index";
import { Route as UsersIndexImport } from "./routes/users.index";
import { Route as PostsIndexImport } from "./routes/posts.index";
import { Route as UsersUserIdImport } from "./routes/users.$userId";
import { Route as PostsPostIdImport } from "./routes/posts.$postId";
import { Route as AuthCallbackImport } from "./routes/auth/callback";
import { Route as LayoutLayout2Import } from "./routes/_layout/_layout-2";
import { Route as PostsPostIdDeepImport } from "./routes/posts_.$postId.deep";
import { Route as LayoutLayout2LayoutBImport } from "./routes/_layout/_layout-2/layout-b";
import { Route as LayoutLayout2LayoutAImport } from "./routes/_layout/_layout-2/layout-a";

// Create/Update Routes

const UsersRoute = UsersImport.update({
	id: "/users",
	path: "/users",
	getParentRoute: () => rootRoute,
} as any);

const RedirectRoute = RedirectImport.update({
	id: "/redirect",
	path: "/redirect",
	getParentRoute: () => rootRoute,
} as any);

const PostsRoute = PostsImport.update({
	id: "/posts",
	path: "/posts",
	getParentRoute: () => rootRoute,
} as any);

const LoginRoute = LoginImport.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => rootRoute,
} as any);

const DeferredRoute = DeferredImport.update({
	id: "/deferred",
	path: "/deferred",
	getParentRoute: () => rootRoute,
} as any);

const DashboardRoute = DashboardImport.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => rootRoute,
} as any);

const LayoutRoute = LayoutImport.update({
	id: "/_layout",
	getParentRoute: () => rootRoute,
} as any);

const IndexRoute = IndexImport.update({
	id: "/",
	path: "/",
	getParentRoute: () => rootRoute,
} as any);

const UsersIndexRoute = UsersIndexImport.update({
	id: "/",
	path: "/",
	getParentRoute: () => UsersRoute,
} as any);

const PostsIndexRoute = PostsIndexImport.update({
	id: "/",
	path: "/",
	getParentRoute: () => PostsRoute,
} as any);

const UsersUserIdRoute = UsersUserIdImport.update({
	id: "/$userId",
	path: "/$userId",
	getParentRoute: () => UsersRoute,
} as any);

const PostsPostIdRoute = PostsPostIdImport.update({
	id: "/$postId",
	path: "/$postId",
	getParentRoute: () => PostsRoute,
} as any);

const AuthCallbackRoute = AuthCallbackImport.update({
	id: "/auth/callback",
	path: "/auth/callback",
	getParentRoute: () => rootRoute,
} as any);

const LayoutLayout2Route = LayoutLayout2Import.update({
	id: "/_layout-2",
	getParentRoute: () => LayoutRoute,
} as any);

const PostsPostIdDeepRoute = PostsPostIdDeepImport.update({
	id: "/posts_/$postId/deep",
	path: "/posts/$postId/deep",
	getParentRoute: () => rootRoute,
} as any);

const LayoutLayout2LayoutBRoute = LayoutLayout2LayoutBImport.update({
	id: "/layout-b",
	path: "/layout-b",
	getParentRoute: () => LayoutLayout2Route,
} as any);

const LayoutLayout2LayoutARoute = LayoutLayout2LayoutAImport.update({
	id: "/layout-a",
	path: "/layout-a",
	getParentRoute: () => LayoutLayout2Route,
} as any);

// Populate the FileRoutesByPath interface

declare module "@tanstack/react-router" {
	interface FileRoutesByPath {
		"/": {
			id: "/";
			path: "/";
			fullPath: "/";
			preLoaderRoute: typeof IndexImport;
			parentRoute: typeof rootRoute;
		};
		"/_layout": {
			id: "/_layout";
			path: "";
			fullPath: "";
			preLoaderRoute: typeof LayoutImport;
			parentRoute: typeof rootRoute;
		};
		"/dashboard": {
			id: "/dashboard";
			path: "/dashboard";
			fullPath: "/dashboard";
			preLoaderRoute: typeof DashboardImport;
			parentRoute: typeof rootRoute;
		};
		"/deferred": {
			id: "/deferred";
			path: "/deferred";
			fullPath: "/deferred";
			preLoaderRoute: typeof DeferredImport;
			parentRoute: typeof rootRoute;
		};
		"/login": {
			id: "/login";
			path: "/login";
			fullPath: "/login";
			preLoaderRoute: typeof LoginImport;
			parentRoute: typeof rootRoute;
		};
		"/posts": {
			id: "/posts";
			path: "/posts";
			fullPath: "/posts";
			preLoaderRoute: typeof PostsImport;
			parentRoute: typeof rootRoute;
		};
		"/redirect": {
			id: "/redirect";
			path: "/redirect";
			fullPath: "/redirect";
			preLoaderRoute: typeof RedirectImport;
			parentRoute: typeof rootRoute;
		};
		"/users": {
			id: "/users";
			path: "/users";
			fullPath: "/users";
			preLoaderRoute: typeof UsersImport;
			parentRoute: typeof rootRoute;
		};
		"/_layout/_layout-2": {
			id: "/_layout/_layout-2";
			path: "";
			fullPath: "";
			preLoaderRoute: typeof LayoutLayout2Import;
			parentRoute: typeof LayoutImport;
		};
		"/auth/callback": {
			id: "/auth/callback";
			path: "/auth/callback";
			fullPath: "/auth/callback";
			preLoaderRoute: typeof AuthCallbackImport;
			parentRoute: typeof rootRoute;
		};
		"/posts/$postId": {
			id: "/posts/$postId";
			path: "/$postId";
			fullPath: "/posts/$postId";
			preLoaderRoute: typeof PostsPostIdImport;
			parentRoute: typeof PostsImport;
		};
		"/users/$userId": {
			id: "/users/$userId";
			path: "/$userId";
			fullPath: "/users/$userId";
			preLoaderRoute: typeof UsersUserIdImport;
			parentRoute: typeof UsersImport;
		};
		"/posts/": {
			id: "/posts/";
			path: "/";
			fullPath: "/posts/";
			preLoaderRoute: typeof PostsIndexImport;
			parentRoute: typeof PostsImport;
		};
		"/users/": {
			id: "/users/";
			path: "/";
			fullPath: "/users/";
			preLoaderRoute: typeof UsersIndexImport;
			parentRoute: typeof UsersImport;
		};
		"/_layout/_layout-2/layout-a": {
			id: "/_layout/_layout-2/layout-a";
			path: "/layout-a";
			fullPath: "/layout-a";
			preLoaderRoute: typeof LayoutLayout2LayoutAImport;
			parentRoute: typeof LayoutLayout2Import;
		};
		"/_layout/_layout-2/layout-b": {
			id: "/_layout/_layout-2/layout-b";
			path: "/layout-b";
			fullPath: "/layout-b";
			preLoaderRoute: typeof LayoutLayout2LayoutBImport;
			parentRoute: typeof LayoutLayout2Import;
		};
		"/posts_/$postId/deep": {
			id: "/posts_/$postId/deep";
			path: "/posts/$postId/deep";
			fullPath: "/posts/$postId/deep";
			preLoaderRoute: typeof PostsPostIdDeepImport;
			parentRoute: typeof rootRoute;
		};
	}
}

// Create and export the route tree

interface LayoutLayout2RouteChildren {
	LayoutLayout2LayoutARoute: typeof LayoutLayout2LayoutARoute;
	LayoutLayout2LayoutBRoute: typeof LayoutLayout2LayoutBRoute;
}

const LayoutLayout2RouteChildren: LayoutLayout2RouteChildren = {
	LayoutLayout2LayoutARoute: LayoutLayout2LayoutARoute,
	LayoutLayout2LayoutBRoute: LayoutLayout2LayoutBRoute,
};

const LayoutLayout2RouteWithChildren = LayoutLayout2Route._addFileChildren(LayoutLayout2RouteChildren);

interface LayoutRouteChildren {
	LayoutLayout2Route: typeof LayoutLayout2RouteWithChildren;
}

const LayoutRouteChildren: LayoutRouteChildren = {
	LayoutLayout2Route: LayoutLayout2RouteWithChildren,
};

const LayoutRouteWithChildren = LayoutRoute._addFileChildren(LayoutRouteChildren);

interface PostsRouteChildren {
	PostsPostIdRoute: typeof PostsPostIdRoute;
	PostsIndexRoute: typeof PostsIndexRoute;
}

const PostsRouteChildren: PostsRouteChildren = {
	PostsPostIdRoute: PostsPostIdRoute,
	PostsIndexRoute: PostsIndexRoute,
};

const PostsRouteWithChildren = PostsRoute._addFileChildren(PostsRouteChildren);

interface UsersRouteChildren {
	UsersUserIdRoute: typeof UsersUserIdRoute;
	UsersIndexRoute: typeof UsersIndexRoute;
}

const UsersRouteChildren: UsersRouteChildren = {
	UsersUserIdRoute: UsersUserIdRoute,
	UsersIndexRoute: UsersIndexRoute,
};

const UsersRouteWithChildren = UsersRoute._addFileChildren(UsersRouteChildren);

export interface FileRoutesByFullPath {
	"/": typeof IndexRoute;
	"": typeof LayoutLayout2RouteWithChildren;
	"/dashboard": typeof DashboardRoute;
	"/deferred": typeof DeferredRoute;
	"/login": typeof LoginRoute;
	"/posts": typeof PostsRouteWithChildren;
	"/redirect": typeof RedirectRoute;
	"/users": typeof UsersRouteWithChildren;
	"/auth/callback": typeof AuthCallbackRoute;
	"/posts/$postId": typeof PostsPostIdRoute;
	"/users/$userId": typeof UsersUserIdRoute;
	"/posts/": typeof PostsIndexRoute;
	"/users/": typeof UsersIndexRoute;
	"/layout-a": typeof LayoutLayout2LayoutARoute;
	"/layout-b": typeof LayoutLayout2LayoutBRoute;
	"/posts/$postId/deep": typeof PostsPostIdDeepRoute;
}

export interface FileRoutesByTo {
	"/": typeof IndexRoute;
	"": typeof LayoutLayout2RouteWithChildren;
	"/dashboard": typeof DashboardRoute;
	"/deferred": typeof DeferredRoute;
	"/login": typeof LoginRoute;
	"/redirect": typeof RedirectRoute;
	"/auth/callback": typeof AuthCallbackRoute;
	"/posts/$postId": typeof PostsPostIdRoute;
	"/users/$userId": typeof UsersUserIdRoute;
	"/posts": typeof PostsIndexRoute;
	"/users": typeof UsersIndexRoute;
	"/layout-a": typeof LayoutLayout2LayoutARoute;
	"/layout-b": typeof LayoutLayout2LayoutBRoute;
	"/posts/$postId/deep": typeof PostsPostIdDeepRoute;
}

export interface FileRoutesById {
	__root__: typeof rootRoute;
	"/": typeof IndexRoute;
	"/_layout": typeof LayoutRouteWithChildren;
	"/dashboard": typeof DashboardRoute;
	"/deferred": typeof DeferredRoute;
	"/login": typeof LoginRoute;
	"/posts": typeof PostsRouteWithChildren;
	"/redirect": typeof RedirectRoute;
	"/users": typeof UsersRouteWithChildren;
	"/_layout/_layout-2": typeof LayoutLayout2RouteWithChildren;
	"/auth/callback": typeof AuthCallbackRoute;
	"/posts/$postId": typeof PostsPostIdRoute;
	"/users/$userId": typeof UsersUserIdRoute;
	"/posts/": typeof PostsIndexRoute;
	"/users/": typeof UsersIndexRoute;
	"/_layout/_layout-2/layout-a": typeof LayoutLayout2LayoutARoute;
	"/_layout/_layout-2/layout-b": typeof LayoutLayout2LayoutBRoute;
	"/posts_/$postId/deep": typeof PostsPostIdDeepRoute;
}

export interface FileRouteTypes {
	fileRoutesByFullPath: FileRoutesByFullPath;
	fullPaths:
		| "/"
		| ""
		| "/dashboard"
		| "/deferred"
		| "/login"
		| "/posts"
		| "/redirect"
		| "/users"
		| "/auth/callback"
		| "/posts/$postId"
		| "/users/$userId"
		| "/posts/"
		| "/users/"
		| "/layout-a"
		| "/layout-b"
		| "/posts/$postId/deep";
	fileRoutesByTo: FileRoutesByTo;
	to:
		| "/"
		| ""
		| "/dashboard"
		| "/deferred"
		| "/login"
		| "/redirect"
		| "/auth/callback"
		| "/posts/$postId"
		| "/users/$userId"
		| "/posts"
		| "/users"
		| "/layout-a"
		| "/layout-b"
		| "/posts/$postId/deep";
	id:
		| "__root__"
		| "/"
		| "/_layout"
		| "/dashboard"
		| "/deferred"
		| "/login"
		| "/posts"
		| "/redirect"
		| "/users"
		| "/_layout/_layout-2"
		| "/auth/callback"
		| "/posts/$postId"
		| "/users/$userId"
		| "/posts/"
		| "/users/"
		| "/_layout/_layout-2/layout-a"
		| "/_layout/_layout-2/layout-b"
		| "/posts_/$postId/deep";
	fileRoutesById: FileRoutesById;
}

export interface RootRouteChildren {
	IndexRoute: typeof IndexRoute;
	LayoutRoute: typeof LayoutRouteWithChildren;
	DashboardRoute: typeof DashboardRoute;
	DeferredRoute: typeof DeferredRoute;
	LoginRoute: typeof LoginRoute;
	PostsRoute: typeof PostsRouteWithChildren;
	RedirectRoute: typeof RedirectRoute;
	UsersRoute: typeof UsersRouteWithChildren;
	AuthCallbackRoute: typeof AuthCallbackRoute;
	PostsPostIdDeepRoute: typeof PostsPostIdDeepRoute;
}

const rootRouteChildren: RootRouteChildren = {
	IndexRoute: IndexRoute,
	LayoutRoute: LayoutRouteWithChildren,
	DashboardRoute: DashboardRoute,
	DeferredRoute: DeferredRoute,
	LoginRoute: LoginRoute,
	PostsRoute: PostsRouteWithChildren,
	RedirectRoute: RedirectRoute,
	UsersRoute: UsersRouteWithChildren,
	AuthCallbackRoute: AuthCallbackRoute,
	PostsPostIdDeepRoute: PostsPostIdDeepRoute,
};

export const routeTree = rootRoute._addFileChildren(rootRouteChildren)._addFileTypes<FileRouteTypes>();

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/_layout",
        "/dashboard",
        "/deferred",
        "/login",
        "/posts",
        "/redirect",
        "/users",
        "/auth/callback",
        "/posts_/$postId/deep"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/_layout": {
      "filePath": "_layout.tsx",
      "children": [
        "/_layout/_layout-2"
      ]
    },
    "/dashboard": {
      "filePath": "dashboard.tsx"
    },
    "/deferred": {
      "filePath": "deferred.tsx"
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/posts": {
      "filePath": "posts.tsx",
      "children": [
        "/posts/$postId",
        "/posts/"
      ]
    },
    "/redirect": {
      "filePath": "redirect.tsx"
    },
    "/users": {
      "filePath": "users.tsx",
      "children": [
        "/users/$userId",
        "/users/"
      ]
    },
    "/_layout/_layout-2": {
      "filePath": "_layout/_layout-2.tsx",
      "parent": "/_layout",
      "children": [
        "/_layout/_layout-2/layout-a",
        "/_layout/_layout-2/layout-b"
      ]
    },
    "/auth/callback": {
      "filePath": "auth/callback.tsx"
    },
    "/posts/$postId": {
      "filePath": "posts.$postId.tsx",
      "parent": "/posts"
    },
    "/users/$userId": {
      "filePath": "users.$userId.tsx",
      "parent": "/users"
    },
    "/posts/": {
      "filePath": "posts.index.tsx",
      "parent": "/posts"
    },
    "/users/": {
      "filePath": "users.index.tsx",
      "parent": "/users"
    },
    "/_layout/_layout-2/layout-a": {
      "filePath": "_layout/_layout-2/layout-a.tsx",
      "parent": "/_layout/_layout-2"
    },
    "/_layout/_layout-2/layout-b": {
      "filePath": "_layout/_layout-2/layout-b.tsx",
      "parent": "/_layout/_layout-2"
    },
    "/posts_/$postId/deep": {
      "filePath": "posts_.$postId.deep.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
