import { OpenAPIV3 } from "openapi-types";
import swaggerUI from "swagger-ui-express";
import OrderQueryOrderEnum from "../enums/order-query-order.enum";
import UserQueryOrderEnum from "../enums/user-query-order.enum";

const withDescending = (fields: string[]): string[] => [
    ...fields,
    ...fields.map((field) => `-${field}`),
];

const START_DATE_DESCRIPTION =
    "Inclusive lower bound (>=). ISO 8601 date (YYYY-MM-DD, treated as 00:00 UTC) or date-time.";

const END_DATE_DESCRIPTION =
    "Upper bound. A date-only value (YYYY-MM-DD) includes the whole day (< next midnight UTC); a full date-time is inclusive (<=).";

const NAME_PATTERN = "^\\p{Lu}[\\p{L}'’-]{1,49}$";

const swaggerDocument: OpenAPIV3.Document = {
    openapi: "3.0.0",
    info: {
        title: "CRM API",
        version: "1.0.0",
        description:
            "API documentation for the CRM application. Errors are returned as { status, message }; rate-limited endpoints respond 429 with { message }. Routes with an :id path parameter respond 400 'Invalid id [<param>]' when it is not a valid ObjectId. Validated request bodies are checked with Joi: unknown fields and a missing body (when the body has required fields) are rejected with 400.",
    },
    servers: [
        {
            url: "/",
            description: "Current server",
        },
    ],
    tags: [
        {
            name: "Auth",
            description: "Authentication related endpoints",
        },
        {
            name: "Users",
            description: "User management endpoints",
        },
        {
            name: "Orders",
            description: "Order management endpoints",
        },
        {
            name: "Groups",
            description: "Group management endpoints",
        },
        {
            name: "History",
            description: "Order activity log / audit trail endpoints",
        },
        {
            name: "Telegram",
            description:
                "Telegram account linking and notification preferences. Telegram delivery errors (e.g. the user blocked the bot) are logged and never fail the request; admins don't get Telegram notifications about their own actions.",
        },
        {
            name: "AutoAssign",
            description: "Automatic order-to-manager assignment settings",
        },
        {
            name: "OverdueSettings",
            description: "Settings for automatic overdue-order detection",
        },
        {
            name: "Tasks",
            description: "Order tasks and reminders",
        },
        {
            name: "Notifications",
            description: "In-app notifications for the current user",
        },
    ],
    paths: {
        "/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "User login",
                description:
                    "Banned / not-activated status is reported only after the password has been verified. A user who has not set a password yet (not activated) gets the same 401 as a wrong password.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: {
                                        type: "string",
                                        format: "email",
                                    },
                                    password: {
                                        type: "string",
                                        format: "password",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Successful login",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        user: {
                                            $ref: "#/components/schemas/User",
                                        },
                                        tokens: {
                                            $ref: "#/components/schemas/Tokens",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description:
                            "Validation error - email or password missing, empty or not a string",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description:
                            "Invalid email or password (unknown email, wrong password, or user without a password yet)",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "number",
                                            default: 401,
                                        },
                                        message: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    "403": {
                        description:
                            "Correct password, but the user is banned ('User is banned') or not activated ('User is not activate')",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "number",
                                            default: 403,
                                        },
                                        message: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    "429": {
                        description: "Too many login attempts, try again later",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/RateLimitError" },
                            },
                        },
                    },
                },
            },
        },

        "/auth/refresh": {
            post: {
                tags: ["Auth"],
                summary: "Refresh access and refresh tokens",
                description:
                    "Issues a new token pair and deletes the pair the refresh token belonged to.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["refreshToken"],
                                properties: {
                                    refreshToken: {
                                        type: "string",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Tokens refreshed successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        accessToken: { type: "string" },
                                        refreshToken: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    "401": {
                        description:
                            "Invalid token - the refresh JWT is malformed, has a bad signature or is expired",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description:
                            "'No refresh token provided' (no body or no refreshToken), 'Invalid token' (token revoked or already used), or 'User is banned' (user is banned or deleted; all of their tokens are revoked)",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "number",
                                            default: 403,
                                        },
                                        message: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },

        "/auth/activate/{userId}": {
            post: {
                tags: ["Auth"],
                summary: "Issue an account activation token (Admin only)",
                description:
                    "Only issues an activation token; the account itself is not changed. The user becomes active after setting a password via POST /auth/set-password with this token.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "userId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Activation token issued",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        token: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid id [userId]",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "number",
                                            default: 401,
                                        },
                                        message: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    "403": {
                        description:
                            "Forbidden - User does not have the required role to activate accounts",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "number",
                                            default: 403,
                                        },
                                        message: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    "404": {
                        description: "User not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/auth/set-password": {
            post: {
                tags: ["Auth"],
                summary: "Set a new password using an activation/recovery token",
                description:
                    "An activation token also activates the account. Each link works once: setting the password invalidates all unused activation/recovery links of the user and revokes all of the user's sessions.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["token", "password"],
                                properties: {
                                    token: { type: "string" },
                                    password: { type: "string", minLength: 8, maxLength: 128 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Password set successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Validation error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Invalid or expired token, or the link was already used",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "404": {
                        description: "User not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "429": {
                        description: "Too many attempts, try again later",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/RateLimitError" },
                            },
                        },
                    },
                },
            },
        },

        "/auth/change-password": {
            post: {
                tags: ["Auth"],
                summary: "Change the current user's password",
                description:
                    "Requires the current password. All of the user's sessions (including the current one) are invalidated by deleting their tokens, so the user has to log in again. The tokenVersion bump only invalidates unused activation/recovery links.",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["currentPassword", "newPassword"],
                                properties: {
                                    currentPassword: { type: "string" },
                                    newPassword: { type: "string", minLength: 8, maxLength: 128 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Password changed successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description:
                            "Validation error, or 'Current password is incorrect'",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "429": {
                        description: "Too many attempts, try again later",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/RateLimitError" },
                            },
                        },
                    },
                },
            },
        },

        "/auth/recovery/{userId}": {
            post: {
                tags: ["Auth"],
                summary: "Generate a password recovery token for a user (Admin only)",
                description:
                    "The token is used with POST /auth/set-password. Unlike an activation token, it does not activate an inactive account.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "userId",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "200": {
                        description: "Recovery token generated successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        token: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid id [userId]",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description:
                            "Forbidden - only an Admin can request a recovery token",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "404": {
                        description: "User not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/auth/logout": {
            delete: {
                tags: ["Auth"],
                summary: "User logout",
                description: "Revokes only the token pair of the current session.",
                security: [{ bearerAuth: [] }],
                responses: {
                    "204": {
                        description: "User logged out successfully",
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "number",
                                            default: 401,
                                        },
                                        message: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },

        "/orders": {
            get: {
                tags: ["Orders"],
                summary: "Get a paginated list of orders",
                description:
                    "Text filters (name, surname, email, phone, group) are case-insensitive substring matches; special characters are matched literally. course, course_format, course_type, status and age are exact matches. Empty filter values are ignored. Default sort: created_at descending.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "pageSize",
                        in: "query",
                        schema: { type: "integer", minimum: 1, maximum: 100, default: 25 },
                    },
                    { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
                    {
                        name: "order",
                        in: "query",
                        description:
                            "Sort field. Prefix with '-' for descending order (e.g. -created_at)",
                        schema: {
                            type: "string",
                            enum: withDescending(Object.values(OrderQueryOrderEnum)),
                        },
                    },
                    {
                        name: "my",
                        in: "query",
                        description: "Return only orders assigned to the current user",
                        schema: { type: "boolean" },
                    },
                    { name: "name", in: "query", schema: { type: "string" } },
                    { name: "surname", in: "query", schema: { type: "string" } },
                    { name: "email", in: "query", schema: { type: "string" } },
                    { name: "phone", in: "query", schema: { type: "string" } },
                    { name: "age", in: "query", schema: { type: "integer", minimum: 0 } },
                    {
                        name: "course",
                        in: "query",
                        schema: { type: "string", enum: ["FS", "QACX", "JCX", "JSCX", "FE", "PCX"] },
                    },
                    {
                        name: "course_format",
                        in: "query",
                        schema: { type: "string", enum: ["static", "online"] },
                    },
                    {
                        name: "course_type",
                        in: "query",
                        schema: {
                            type: "string",
                            enum: ["pro", "minimal", "premium", "incubator", "vip"],
                        },
                    },
                    {
                        name: "status",
                        in: "query",
                        description:
                            "Filtering by 'New' also matches orders with an empty/null status, since the two are treated as equivalent.",
                        schema: {
                            type: "string",
                            enum: ["In work", "New", "Agree", "Disagree", "Dubbing"],
                        },
                    },
                    { name: "group", in: "query", schema: { type: "string" } },
                    {
                        name: "start_date",
                        in: "query",
                        description: `Filter by created_at. ${START_DATE_DESCRIPTION}`,
                        schema: { type: "string" },
                    },
                    {
                        name: "end_date",
                        in: "query",
                        description: `Filter by created_at. ${END_DATE_DESCRIPTION}`,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "200": {
                        description: "Paginated list of orders (manager populated with _id, name, surname)",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        data: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/Order" },
                                        },
                                        total: { type: "integer" },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid query parameters",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ["Orders"],
                summary: "Create a new order (public, e.g. from a lead form)",
                description:
                    "Creates a new order with status New. If auto-assign is enabled, the order's manager is picked automatically (round-robin or load-based). Admins and the assigned manager are notified (in-app, and via Telegram if enabled).",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: [
                                    "name",
                                    "surname",
                                    "email",
                                    "phone",
                                    "course",
                                    "course_type",
                                    "course_format",
                                ],
                                properties: {
                                    name: { type: "string", maxLength: 100 },
                                    surname: { type: "string", maxLength: 100 },
                                    email: { type: "string", format: "email", maxLength: 200 },
                                    phone: { type: "string", maxLength: 30 },
                                    age: { type: "integer", minimum: 0 },
                                    course: {
                                        type: "string",
                                        enum: ["FS", "QACX", "JCX", "JSCX", "FE", "PCX"],
                                    },
                                    course_type: {
                                        type: "string",
                                        enum: ["pro", "minimal", "premium", "incubator", "vip"],
                                    },
                                    course_format: {
                                        type: "string",
                                        enum: ["static", "online"],
                                    },
                                    sum: { type: "number", minimum: 0 },
                                    already_paid: { type: "number", minimum: 0 },
                                    utm: { type: "string", maxLength: 500 },
                                    msg: { type: "string", maxLength: 2000 },
                                    group: { type: "string", maxLength: 100, nullable: true },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Order created",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Order" },
                            },
                        },
                    },
                    "400": {
                        description: "Validation error (including a missing body)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "429": {
                        description: "Too many orders created from this IP, try again later",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/RateLimitError" },
                            },
                        },
                    },
                },
            },
        },

        "/orders/statistic": {
            get: {
                tags: ["Orders"],
                summary: "Get overall order statistics grouped by status (Admin only)",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "Order statistics",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/OrderStatistic" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden - Admin role required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/orders/loss-report": {
            get: {
                tags: ["Orders"],
                summary: "Get a breakdown of lost orders by disagree reason (Admin only)",
                description:
                    "Returns the count of Disagree orders grouped by disagree_reason for the given period, sorted by count descending. The period filters disagree_at. Orders without a reason are reported as 'Unspecified'.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "start_date",
                        in: "query",
                        description: `Filter by disagree_at. ${START_DATE_DESCRIPTION}`,
                        schema: { type: "string" },
                    },
                    {
                        name: "end_date",
                        in: "query",
                        description: `Filter by disagree_at. ${END_DATE_DESCRIPTION}`,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "200": {
                        description: "Loss report breakdown",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            reason: { type: "string" },
                                            count: { type: "integer" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid query parameters",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden - Admin role required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/orders/excel": {
            get: {
                tags: ["Orders"],
                summary: "Export the filtered list of orders as an Excel file",
                description:
                    "Accepts the same filters and sort as GET /orders, but exports all matching orders (no pagination).",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "pageSize",
                        in: "query",
                        description: "Accepted for compatibility with GET /orders, but ignored",
                        schema: { type: "integer", minimum: 1, maximum: 100, default: 25 },
                    },
                    {
                        name: "page",
                        in: "query",
                        description: "Accepted for compatibility with GET /orders, but ignored",
                        schema: { type: "integer", minimum: 1, default: 1 },
                    },
                    {
                        name: "order",
                        in: "query",
                        description:
                            "Sort field. Prefix with '-' for descending order (e.g. -created_at). Default: created_at descending.",
                        schema: {
                            type: "string",
                            enum: withDescending(Object.values(OrderQueryOrderEnum)),
                        },
                    },
                    { name: "my", in: "query", schema: { type: "boolean" } },
                    { name: "name", in: "query", schema: { type: "string" } },
                    { name: "surname", in: "query", schema: { type: "string" } },
                    { name: "email", in: "query", schema: { type: "string" } },
                    { name: "phone", in: "query", schema: { type: "string" } },
                    { name: "age", in: "query", schema: { type: "integer", minimum: 0 } },
                    {
                        name: "course",
                        in: "query",
                        schema: { type: "string", enum: ["FS", "QACX", "JCX", "JSCX", "FE", "PCX"] },
                    },
                    {
                        name: "course_format",
                        in: "query",
                        schema: { type: "string", enum: ["static", "online"] },
                    },
                    {
                        name: "course_type",
                        in: "query",
                        schema: {
                            type: "string",
                            enum: ["pro", "minimal", "premium", "incubator", "vip"],
                        },
                    },
                    {
                        name: "status",
                        in: "query",
                        description:
                            "Filtering by 'New' also matches orders with an empty/null status, since the two are treated as equivalent.",
                        schema: {
                            type: "string",
                            enum: ["In work", "New", "Agree", "Disagree", "Dubbing"],
                        },
                    },
                    { name: "group", in: "query", schema: { type: "string" } },
                    {
                        name: "start_date",
                        in: "query",
                        description: `Filter by created_at. ${START_DATE_DESCRIPTION}`,
                        schema: { type: "string" },
                    },
                    {
                        name: "end_date",
                        in: "query",
                        description: `Filter by created_at. ${END_DATE_DESCRIPTION}`,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "200": {
                        description: "Excel (.xlsx) file with the filtered orders",
                        content: {
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                                {
                                    schema: {
                                        type: "string",
                                        format: "binary",
                                    },
                                },
                        },
                    },
                    "400": {
                        description: "Invalid query parameters",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/orders/{id}": {
            get: {
                tags: ["Orders"],
                summary: "Get an order by id",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: {
                    "200": {
                        description: "Order found (manager populated), including its comments",
                        content: {
                            "application/json": {
                                schema: {
                                    allOf: [
                                        { $ref: "#/components/schemas/Order" },
                                        {
                                            type: "object",
                                            properties: {
                                                comments: {
                                                    type: "array",
                                                    description:
                                                        "Unlike the plain Comment schema, _userId is populated here with the author's name and surname.",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            _id: { type: "string" },
                                                            text: { type: "string" },
                                                            _orderId: { type: "string" },
                                                            _userId: {
                                                                type: "object",
                                                                properties: {
                                                                    _id: { type: "string" },
                                                                    name: { type: "string" },
                                                                    surname: { type: "string" },
                                                                },
                                                            },
                                                            createdAt: {
                                                                type: "string",
                                                                format: "date-time",
                                                            },
                                                            updatedAt: {
                                                                type: "string",
                                                                format: "date-time",
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid id [id]",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "404": {
                        description: "Order not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
            patch: {
                tags: ["Orders"],
                summary: "Update an order by id",
                description:
                    "Ownership: once an order is assigned, only that user can update it — this applies to Admin as well. The first edit of a free (unassigned) order assigns it to the caller (including Admin). Unless the body sets status explicitly, an empty/New status becomes 'In work'. Editing a free order with an explicit status 'New' keeps it unassigned; changing the status to New clears the manager. If the body sets no status and the resulting sum > 0 and already_paid >= sum, the status becomes 'Agree'. Changing the status away from Disagree clears disagree_reason / disagree_reason_comment. An empty string for status, course, course_type or course_format is stored as null.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    name: { type: "string", maxLength: 100, nullable: true },
                                    surname: { type: "string", maxLength: 100, nullable: true },
                                    email: {
                                        type: "string",
                                        format: "email",
                                        maxLength: 200,
                                        nullable: true,
                                    },
                                    phone: { type: "string", maxLength: 30, nullable: true },
                                    age: { type: "integer", minimum: 0, nullable: true },
                                    sum: { type: "number", minimum: 0, nullable: true },
                                    already_paid: { type: "number", minimum: 0, nullable: true },
                                    status: {
                                        type: "string",
                                        enum: ["In work", "New", "Agree", "Disagree", "Dubbing", ""],
                                        nullable: true,
                                        description: "\"\" is stored as null",
                                    },
                                    course: {
                                        type: "string",
                                        enum: ["FS", "QACX", "JCX", "JSCX", "FE", "PCX", ""],
                                        nullable: true,
                                        description: "\"\" is stored as null",
                                    },
                                    course_type: {
                                        type: "string",
                                        enum: ["pro", "minimal", "premium", "incubator", "vip", ""],
                                        nullable: true,
                                        description: "\"\" is stored as null",
                                    },
                                    course_format: {
                                        type: "string",
                                        enum: ["static", "online", ""],
                                        nullable: true,
                                        description: "\"\" is stored as null",
                                    },
                                    group: { type: "string", maxLength: 100, nullable: true },
                                    msg: { type: "string", maxLength: 2000, nullable: true },
                                    disagree_reason: {
                                        type: "string",
                                        maxLength: 200,
                                        nullable: true,
                                        description:
                                            "Required when status is 'Disagree' (in the body, or already on the order)",
                                    },
                                    disagree_reason_comment: {
                                        type: "string",
                                        maxLength: 1000,
                                        nullable: true,
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Order updated successfully (manager is not populated)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Order" },
                            },
                        },
                    },
                    "400": {
                        description:
                            "Validation error, Invalid id [id], or 'Disagree reason is required when status is Disagree'",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description:
                            "Forbidden - the order is already assigned to a different user (including when the requester is an Admin)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "404": {
                        description: "Order not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/orders/{id}/tags": {
            patch: {
                tags: ["Orders"],
                summary: "Set the tags on an order",
                description:
                    "Replaces the order's tag list. Up to 20 tags, 30 characters each (trimmed). Subject to the same manager ownership check as update/comment — Forbidden if the order is already assigned to a different user (including when the requester is an Admin). Tagging alone does not claim an unassigned order.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["tags"],
                                properties: {
                                    tags: {
                                        type: "array",
                                        items: { type: "string", maxLength: 30 },
                                        maxItems: 20,
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Tags updated successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Order" },
                            },
                        },
                    },
                    "400": {
                        description: "Validation error or Invalid id [id]",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description:
                            "Forbidden - the order is already assigned to a different user (including when the requester is an Admin)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "404": {
                        description: "Order not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/orders/{id}/reassign": {
            patch: {
                tags: ["Orders"],
                summary: "Reassign an order to a different manager (Admin only)",
                description:
                    "An admin can reassign any order, regardless of its current manager. The order status is not changed. Logs the change to the history log and notifies the new manager in-app (and via Telegram if enabled).",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["manager"],
                                properties: {
                                    manager: {
                                        type: "string",
                                        pattern: "^[0-9a-fA-F]{24}$",
                                        description: "ObjectId of the target manager (User._id)",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Order reassigned successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Order" },
                            },
                        },
                    },
                    "400": {
                        description:
                            "Validation error, Invalid id [id], or 'Manager not found' (the target user doesn't exist or isn't a manager)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden - Admin role required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "404": {
                        description: "Order not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/orders/{id}/comments": {
            post: {
                tags: ["Orders"],
                summary: "Add a comment to an order",
                description:
                    "On first comment, assigns the order to the current user (including Admin) as manager and sets an empty/New status to 'In work'. Once assigned, only that user can comment afterwards — this applies to Admin as well. An optional status changes the order status together with the comment; 'Disagree' requires disagree_reason. Commenting clears the overdue flag.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["text"],
                                properties: {
                                    text: { type: "string", minLength: 1 },
                                    status: {
                                        type: "string",
                                        enum: ["In work", "New", "Agree", "Disagree", "Dubbing"],
                                    },
                                    disagree_reason: {
                                        type: "string",
                                        maxLength: 200,
                                        nullable: true,
                                        description: "Required when status is 'Disagree'",
                                    },
                                    disagree_reason_comment: {
                                        type: "string",
                                        maxLength: 1000,
                                        nullable: true,
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Comment created successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Comment" },
                            },
                        },
                    },
                    "400": {
                        description:
                            "Validation error, Invalid id [id], or 'Disagree reason is required when status is Disagree'",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description:
                            "Forbidden - the order is already assigned to a different user (including when the requester is an Admin)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "404": {
                        description: "Order not found or user not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/orders/{id}/history": {
            get: {
                tags: ["Orders"],
                summary: "Get activity history for an order",
                description:
                    "Returns a chronological list of tracked changes (status, manager, group, field edits) and comment events for this order, newest first. author is populated with surname only; order is not populated.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: {
                    "200": {
                        description: "List of history entries for the order",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/HistoryEntry" },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid id [id]",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/history": {
            get: {
                tags: ["History"],
                summary: "Get full activity log across the system (admin only)",
                description:
                    "Returns a paginated, filterable log of all tracked order events across the whole system, newest first. author is populated with surname; order is populated with name, surname and email.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "page",
                        in: "query",
                        schema: { type: "integer", minimum: 1, default: 1 },
                    },
                    {
                        name: "pageSize",
                        in: "query",
                        schema: { type: "integer", minimum: 1, maximum: 100, default: 25 },
                    },
                    {
                        name: "author",
                        in: "query",
                        schema: { type: "string", pattern: "^([0-9a-fA-F]{24})?$" },
                        description: "Filter by author (user) id: a 24-hex ObjectId, or empty for no filter",
                    },
                    {
                        name: "start_date",
                        in: "query",
                        description: `Filter by created_at. ${START_DATE_DESCRIPTION}`,
                        schema: { type: "string" },
                    },
                    {
                        name: "end_date",
                        in: "query",
                        description: `Filter by created_at. ${END_DATE_DESCRIPTION}`,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "200": {
                        description: "Paginated list of history entries",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        data: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/HistoryEntry" },
                                        },
                                        total: { type: "integer" },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid query parameters (e.g. author is not an ObjectId)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden - admin role required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/telegram/status": {
            get: {
                tags: ["Telegram"],
                summary: "Get current user's Telegram link status",
                description:
                    "Returns whether the authenticated user has a linked Telegram account and their notification preferences.",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "Telegram link status",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        telegram_chat_id: {
                                            type: "string",
                                            nullable: true,
                                            description: "Absent or null when no Telegram account is linked",
                                        },
                                        telegram_notifications: {
                                            type: "object",
                                            additionalProperties: { type: "boolean" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/telegram/link-code": {
            post: {
                tags: ["Telegram"],
                summary: "Generate a one-time Telegram link code",
                description:
                    "Generates a code the user sends to the Telegram bot via /start <code> (or a deep-link) to link their account. The code expires after 10 minutes.",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "Generated link code",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        code: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "429": {
                        description: "Too many link code requests, try again later",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/RateLimitError" },
                            },
                        },
                    },
                },
            },
        },

        "/telegram/link": {
            delete: {
                tags: ["Telegram"],
                summary: "Unlink the current user's Telegram account",
                description: "Also deletes the user's pending link codes.",
                security: [{ bearerAuth: [] }],
                responses: {
                    "204": {
                        description: "Telegram account unlinked",
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/telegram/preferences": {
            patch: {
                tags: ["Telegram"],
                summary: "Update Telegram notification preferences",
                description:
                    "Enables or disables specific notification events sent to Telegram. Keys not in the body keep their previous value; an event is sent only when its key is true. Telegram delivery errors are logged and never fail the triggering request; admins don't get Telegram notifications about their own actions.",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    new_order: { type: "boolean" },
                                    status_change: { type: "boolean" },
                                    comment_added: { type: "boolean" },
                                    order_overdue: { type: "boolean" },
                                    task_reminder: { type: "boolean" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Preferences updated",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: { type: "boolean" },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Validation error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/auto-assign": {
            get: {
                tags: ["AutoAssign"],
                summary: "Get auto-assign settings (Admin only)",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "Current auto-assign settings",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/AutoAssignSettings" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden - Admin role required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
            patch: {
                tags: ["AutoAssign"],
                summary: "Update auto-assign settings (Admin only)",
                description:
                    "Enable/disable auto-assign, switch mode (round_robin / load_based), or update the list of participating managers. Only active, non-banned managers among the participants are picked.",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    enabled: { type: "boolean" },
                                    mode: {
                                        type: "string",
                                        enum: ["round_robin", "load_based"],
                                    },
                                    participantIds: {
                                        type: "array",
                                        items: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Updated auto-assign settings",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/AutoAssignSettings" },
                            },
                        },
                    },
                    "400": {
                        description: "Validation error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden - Admin role required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/overdue-settings": {
            get: {
                tags: ["OverdueSettings"],
                summary: "Get overdue-detection settings (Admin only)",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "Current overdue settings",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/OverdueSettings" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden - Admin role required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
            patch: {
                tags: ["OverdueSettings"],
                summary: "Update overdue-detection settings (Admin only)",
                description:
                    "Enable/disable automatic overdue detection and set the threshold (hours) a New order can stay without a comment before being flagged.",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    enabled: { type: "boolean" },
                                    thresholdHours: { type: "number", minimum: 1 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Updated overdue settings",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/OverdueSettings" },
                            },
                        },
                    },
                    "400": {
                        description: "Validation error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden - Admin role required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/orders/{id}/tasks": {
            post: {
                tags: ["Tasks"],
                summary: "Create a task/reminder for an order",
                description:
                    "When dueDate is reached and the order's status hasn't changed since the task was created, the assignee always gets an in-app notification as a reminder, and a Telegram message if the task_reminder preference is enabled. An order without a status is recorded as 'New'.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["title", "assignee", "dueDate"],
                                properties: {
                                    title: { type: "string", minLength: 1 },
                                    assignee: {
                                        type: "string",
                                        pattern: "^[0-9a-fA-F]{24}$",
                                        description: "User id (24-hex ObjectId)",
                                    },
                                    dueDate: { type: "string", format: "date-time" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Task created",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Task" },
                            },
                        },
                    },
                    "400": {
                        description:
                            "Validation error (e.g. assignee is not a 24-hex ObjectId) or Invalid id [id]",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "404": {
                        description: "Order not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
            get: {
                tags: ["Tasks"],
                summary: "Get tasks for an order",
                description: "Sorted by dueDate ascending; assignee is populated with name and surname.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: {
                    "200": {
                        description: "List of tasks for the order",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Task" },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid id [id]",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/tasks/my": {
            get: {
                tags: ["Tasks"],
                summary: "Get open tasks assigned to the current user",
                description:
                    "Sorted by dueDate ascending; order is populated with name, surname and email.",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "List of open tasks",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Task" },
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/tasks/{taskId}/done": {
            patch: {
                tags: ["Tasks"],
                summary: "Mark a task as done",
                description:
                    "Any authenticated user can mark any task as done (there is no assignee check).",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "taskId", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: {
                    "200": {
                        description: "Updated task",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Task" },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid id [taskId]",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "404": {
                        description: "Task not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/notifications": {
            get: {
                tags: ["Notifications"],
                summary: "Get paginated in-app notifications for the current user",
                description: "Newest first.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "pageSize",
                        in: "query",
                        schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
                    },
                    { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
                ],
                responses: {
                    "200": {
                        description: "Paginated list of notifications",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        data: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/Notification" },
                                        },
                                        total: { type: "integer" },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid query parameters",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/notifications/unread-count": {
            get: {
                tags: ["Notifications"],
                summary: "Get the count of unread notifications for the current user",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "Unread notification count",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { count: { type: "integer" } },
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/notifications/read-all": {
            patch: {
                tags: ["Notifications"],
                summary: "Mark all notifications as read for the current user",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "All notifications marked as read",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { success: { type: "boolean" } },
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/notifications/{notificationId}/read": {
            patch: {
                tags: ["Notifications"],
                summary: "Mark a single notification as read",
                description:
                    "Only the current user's notifications are updated; an unknown id or another user's notification is silently ignored (still 200).",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "notificationId", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: {
                    "200": {
                        description: "Notification marked as read",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { success: { type: "boolean" } },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid id [notificationId]",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/users": {
            get: {
                tags: ["Users"],
                summary: "Get a paginated list of users (Admin only)",
                description:
                    "Returns all users, including admins and the caller. Default sort: _id descending (newest first).",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "pageSize",
                        in: "query",
                        schema: { type: "integer", minimum: 1, maximum: 100, default: 25 },
                    },
                    { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
                    {
                        name: "search",
                        in: "query",
                        description:
                            "Case-insensitive substring match on name or email; special characters are matched literally",
                        schema: { type: "string" },
                    },
                    {
                        name: "order",
                        in: "query",
                        description:
                            "Sort field. Prefix with '-' for descending order (e.g. -createdAt)",
                        schema: {
                            type: "string",
                            enum: withDescending(Object.values(UserQueryOrderEnum)),
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Paginated list of users",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        data: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/User" },
                                        },
                                        total: { type: "integer" },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid query parameters",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden - Admin role required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ["Users"],
                summary: "Create a new user (Admin only)",
                description:
                    "Creates an inactive manager without a password; activate it via POST /auth/activate/{userId} and POST /auth/set-password.",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "name", "surname"],
                                properties: {
                                    email: { type: "string", format: "email" },
                                    name: { type: "string", pattern: NAME_PATTERN },
                                    surname: { type: "string", pattern: NAME_PATTERN },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "User created successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/User" },
                            },
                        },
                    },
                    "400": {
                        description: "Validation error, or 'User already exists!' (duplicate email)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden - Admin role required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/users/{id}": {
            get: {
                tags: ["Users"],
                summary: "Get a user by id (Admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: {
                    "200": {
                        description: "User found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/User" },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid id [id]",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden - Admin role required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "404": {
                        description: "User not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
            put: {
                tags: ["Users"],
                summary: "Update a user's name, surname, and email",
                description:
                    "Users may update their own profile; admins may update any profile.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    name: { type: "string", pattern: NAME_PATTERN },
                                    surname: { type: "string", pattern: NAME_PATTERN },
                                    email: { type: "string", format: "email" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "User updated successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/User" },
                            },
                        },
                    },
                    "400": {
                        description:
                            "Validation error, Invalid id [id], or 'User already exists!' (duplicate email)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description: "You can only edit your own profile",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "404": {
                        description: "User not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
            delete: {
                tags: ["Users"],
                summary: "Delete a user by id (Admin only)",
                description:
                    "Side effects: all of the user's tokens are revoked; their 'In work' orders become 'New' (status_updated_at = now, is_overdue = false); manager is set to null on all of their orders; their open tasks, notifications and Telegram link codes are deleted; they are removed from the auto-assign participants and from lastAssignedUserId.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: {
                    "200": {
                        description: "User deleted successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid id [id]",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description:
                            "Forbidden - Admin role required, 'You cannot delete yourself', or 'Admin cannot be deleted'",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "404": {
                        description: "User not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/users/{id}/avatar": {
            post: {
                tags: ["Users"],
                summary: "Upload a profile avatar",
                description:
                    "Users may upload their own avatar; admins may upload for any user. Accepts JPEG, PNG, or WEBP (by the part's Content-Type), up to 5MB, in the 'avatar' field. The stored file extension (.jpg/.png/.webp) is derived from the validated MIME type, never from the client file name. Files under /uploads are served with X-Content-Type-Options: nosniff. The previous avatar file is deleted.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                required: ["avatar"],
                                properties: {
                                    avatar: { type: "string", format: "binary" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Avatar uploaded successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/User" },
                            },
                        },
                    },
                    "400": {
                        description:
                            "Invalid file type, file too large, unexpected field name, no file uploaded, or Invalid id [id]",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description:
                            "Forbidden - can only upload your own avatar (the uploaded file is deleted)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "404": {
                        description: "User not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/users/statistic": {
            get: {
                tags: ["Users"],
                summary: "Get order statistics for several managers at once (Admin only)",
                description:
                    "Returns a map of manager id → statistics. Managers without orders get { total: 0 }.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "ids",
                        in: "query",
                        required: true,
                        description: "Comma-separated user ids (24-hex ObjectIds, up to 100)",
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "200": {
                        description: "Statistics keyed by manager id",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    additionalProperties: {
                                        $ref: "#/components/schemas/ManagerStatistic",
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid ids",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden - Admin role required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/users/{id}/statistic": {
            get: {
                tags: ["Users"],
                summary: "Get order statistics for a specific manager",
                description: "Available to admins, or to the user for their own id.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "Manager's user id",
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "200": {
                        description: "Order statistics for the manager",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ManagerStatistic" },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid id [id]",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description: "You can only view your own statistic",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "404": {
                        description: "User not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/users/{id}/ban": {
            patch: {
                tags: ["Users"],
                summary: "Ban a user (Admin only)",
                description: "Also revokes all of the user's tokens.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: {
                    "200": {
                        description: "User banned successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid id [id]",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description:
                            "Forbidden - Admin role required, or attempting to ban yourself",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "404": {
                        description: "User not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/users/{id}/unban": {
            patch: {
                tags: ["Users"],
                summary: "Unban a user (Admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: {
                    "200": {
                        description: "User unbanned successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid id [id]",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden - Admin role required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "404": {
                        description: "User not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/groups": {
            get: {
                tags: ["Groups"],
                summary: "Get all groups",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "List of groups",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Group" },
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ["Groups"],
                summary: "Create a new group",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["name"],
                                properties: {
                                    name: { type: "string", minLength: 1, maxLength: 50 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Group created successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Group" },
                            },
                        },
                    },
                    "400": {
                        description:
                            "Name is required, or a group with this name already exists",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
        schemas: {
            Error: {
                type: "object",
                properties: {
                    status: { type: "number" },
                    message: { type: "string" },
                },
            },
            RateLimitError: {
                type: "object",
                description: "Body of 429 responses from rate-limited endpoints",
                properties: {
                    message: { type: "string" },
                },
            },
            Tokens: {
                type: "object",
                properties: {
                    accessToken: { type: "string" },
                    refreshToken: { type: "string" },
                },
            },
            User: {
                type: "object",
                description: "The password hash is never returned.",
                properties: {
                    _id: { type: "string" },
                    email: { type: "string" },
                    name: { type: "string" },
                    surname: { type: "string" },
                    avatarUrl: {
                        type: "string",
                        nullable: true,
                        description: "Relative path under /uploads/avatars, or null",
                    },
                    role: { type: "string", enum: ["admin", "manager"] },
                    is_active: { type: "boolean", default: false },
                    is_banned: { type: "boolean", default: false },
                    isDeleted: { type: "boolean", default: false },
                    isVerified: { type: "boolean", default: false },
                    tokenVersion: {
                        type: "integer",
                        description: "Incremented whenever the password is set or changed",
                    },
                    telegram_chat_id: {
                        type: "string",
                        nullable: true,
                        description: "Absent or null when no Telegram account is linked",
                    },
                    telegram_notifications: {
                        type: "object",
                        additionalProperties: { type: "boolean" },
                        description: "Telegram notification preferences keyed by event",
                    },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                    last_login: { type: "string", format: "date-time", nullable: true },
                },
            },
            Order: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    name: { type: "string", nullable: true },
                    surname: { type: "string", nullable: true },
                    email: { type: "string", nullable: true },
                    phone: { type: "string", nullable: true },
                    age: { type: "integer", nullable: true },
                    course: {
                        type: "string",
                        enum: ["FS", "QACX", "JCX", "JSCX", "FE", "PCX"],
                        nullable: true,
                    },
                    course_format: {
                        type: "string",
                        enum: ["static", "online"],
                        nullable: true,
                    },
                    course_type: {
                        type: "string",
                        enum: ["pro", "minimal", "premium", "incubator", "vip"],
                        nullable: true,
                    },
                    sum: { type: "number", nullable: true },
                    already_paid: { type: "number", nullable: true },
                    created_at: { type: "string", format: "date-time" },
                    utm: { type: "string" },
                    msg: { type: "string", nullable: true },
                    status: {
                        type: "string",
                        enum: ["In work", "New", "Agree", "Disagree", "Dubbing"],
                        nullable: true,
                        description: "null is treated as New",
                    },
                    status_updated_at: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        description: "Timestamp of the last status change",
                    },
                    is_overdue: {
                        type: "boolean",
                        description: "True if flagged overdue by the automated check (New status, no comment, past the configured threshold)",
                    },
                    disagree_reason: { type: "string", nullable: true },
                    disagree_reason_comment: { type: "string", nullable: true },
                    disagree_at: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        description: "Timestamp of the most recent transition into Disagree status; used by the loss report period filter",
                    },
                    manager: {
                        nullable: true,
                        oneOf: [
                            { type: "string" },
                            {
                                type: "object",
                                properties: {
                                    _id: { type: "string" },
                                    name: { type: "string" },
                                    surname: { type: "string" },
                                },
                            },
                        ],
                        description:
                            "User assigned to this order. Populated with _id, name and surname only in GET /orders and GET /orders/{id}; other endpoints return the manager's id. Set automatically to the current user on first update or first comment (including by an Admin), by the auto-assign feature on creation, or explicitly via PATCH /orders/{id}/reassign (Admin only, any order). Once set, only that manager can edit, comment on or tag the order — tagging alone does not claim an unassigned order.",
                    },
                    group: { type: "string", nullable: true },
                    tags: {
                        type: "array",
                        items: { type: "string" },
                        description: "Free-form labels, up to 20 tags of 30 characters each",
                    },
                },
            },
            AutoAssignSettings: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    enabled: { type: "boolean" },
                    mode: {
                        type: "string",
                        enum: ["round_robin", "load_based"],
                    },
                    participantIds: {
                        type: "array",
                        items: { type: "string" },
                        description: "IDs of managers participating in auto-assign",
                    },
                    lastAssignedUserId: {
                        type: "string",
                        nullable: true,
                        description: "Internal round-robin pointer (last assigned manager's user id)",
                    },
                },
            },
            OverdueSettings: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    enabled: { type: "boolean" },
                    thresholdHours: {
                        type: "number",
                        description: "Hours a New order can stay without a comment before being flagged overdue",
                    },
                },
            },
            Task: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    title: { type: "string" },
                    order: {
                        type: "string",
                        description:
                            "Order id; populated with name, surname and email in GET /tasks/my",
                    },
                    assignee: {
                        type: "string",
                        description:
                            "User id; populated with name and surname in GET /orders/{id}/tasks",
                    },
                    dueDate: { type: "string", format: "date-time" },
                    statusAtCreation: { type: "string" },
                    isDone: { type: "boolean" },
                    reminderSentAt: { type: "string", format: "date-time", nullable: true },
                    createdAt: { type: "string", format: "date-time" },
                },
            },
            Notification: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    user: { type: "string" },
                    event: {
                        type: "string",
                        enum: ["new_order", "status_change", "comment_added", "order_overdue", "task_reminder"],
                    },
                    text: { type: "string" },
                    order: { type: "string", nullable: true },
                    read: { type: "boolean" },
                    createdAt: { type: "string", format: "date-time" },
                },
            },
            OrderStatistic: {
                type: "object",
                description:
                    "Total orders, one count per status (keyed by status value, e.g. 'New', 'In work'), and overdueCount. Orders without a status are counted as 'New'; statuses with zero orders are omitted.",
                properties: {
                    total: { type: "integer" },
                    overdueCount: { type: "integer" },
                },
                additionalProperties: { type: "integer" },
            },
            ManagerStatistic: {
                type: "object",
                description:
                    "Orders of one manager: total plus one count per status (keyed by status value). Orders without a status are counted as 'New'; statuses with zero orders are omitted, only total is always present. No overdueCount.",
                required: ["total"],
                properties: {
                    total: { type: "integer" },
                },
                additionalProperties: { type: "integer" },
            },
            Group: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    name: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                },
            },
            Comment: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    text: { type: "string" },
                    _orderId: { type: "string" },
                    _userId: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                },
            },
            HistoryEntry: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    order: {
                        oneOf: [
                            { type: "string" },
                            {
                                type: "object",
                                properties: {
                                    _id: { type: "string" },
                                    name: { type: "string" },
                                    surname: { type: "string" },
                                    email: { type: "string" },
                                },
                            },
                        ],
                        description:
                            "Populated with name, surname and email in GET /history; the order id in GET /orders/{id}/history.",
                    },
                    author: {
                        oneOf: [
                            { type: "string" },
                            {
                                type: "object",
                                properties: {
                                    _id: { type: "string" },
                                    surname: { type: "string" },
                                },
                            },
                        ],
                        description:
                            "Populated with the author's surname (only) when returned via GET endpoints.",
                    },
                    type: {
                        type: "string",
                        enum: [
                            "status_change",
                            "manager_change",
                            "group_change",
                            "field_edit",
                            "comment_added",
                        ],
                    },
                    field: { type: "string", nullable: true },
                    old_value: { type: "string", nullable: true },
                    new_value: { type: "string", nullable: true },
                    created_at: { type: "string", format: "date-time" },
                },
            },
        },
    },
};

export { swaggerDocument, swaggerUI };
