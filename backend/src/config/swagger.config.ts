import { OpenAPIV3 } from "openapi-types";
import swaggerUI from "swagger-ui-express";

const swaggerDocument: OpenAPIV3.Document = {
    openapi: "3.0.0",
    info: {
        title: "CRM API",
        version: "1.0.0",
        description: "API documentation for the CRM application",
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
            description: "Telegram account linking and notification preferences",
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
    ],
    paths: {
        "/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "User login",
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
                    "401": {
                        description: "Invalid email or password",
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
                        description: "User is banned or not activated",
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

        "/auth/refresh": {
            post: {
                tags: ["Auth"],
                summary: "Refresh access and refresh tokens",
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
                    "403": {
                        description:
                            "No refresh token provided or token is invalid",
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
                summary: "Activate user account",
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
                        description: "User account activated successfully",
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
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["token", "password"],
                                properties: {
                                    token: { type: "string" },
                                    password: { type: "string" },
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
                    "401": {
                        description: "Invalid or expired token",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
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
                    "Requires the current password. Invalidates the user's existing sessions by bumping tokenVersion.",
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
                                    newPassword: { type: "string" },
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
                    "401": {
                        description: "Current password is incorrect, or unauthorized",
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
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },

        "/auth/recovery/{userId}": {
            post: {
                tags: ["Auth"],
                summary: "Generate a password recovery token for a user",
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
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "pageSize", in: "query", schema: { type: "integer", default: 25 } },
                    { name: "page", in: "query", schema: { type: "integer", default: 1 } },
                    {
                        name: "order",
                        in: "query",
                        description:
                            "Sort field. Prefix with '-' for descending order (e.g. -created_at)",
                        schema: { type: "string" },
                    },
                    {
                        name: "my",
                        in: "query",
                        description: "Return only orders assigned to the current manager",
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
                        schema: {
                            type: "string",
                            enum: ["In work", "New", "Aggre", "Disaggre", "Dubbing"],
                        },
                    },
                    { name: "group", in: "query", schema: { type: "string" } },
                    { name: "start_date", in: "query", schema: { type: "string", format: "date" } },
                    { name: "end_date", in: "query", schema: { type: "string", format: "date" } },
                ],
                responses: {
                    "200": {
                        description: "Paginated list of orders",
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
                    "Creates a new order with status New. If auto-assign is enabled, the order's manager is picked automatically (round-robin or load-based).",
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
                                    name: { type: "string" },
                                    surname: { type: "string" },
                                    email: { type: "string" },
                                    phone: { type: "string" },
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
                                    utm: { type: "string" },
                                    msg: { type: "string" },
                                    group: { type: "string" },
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
                        description: "Validation error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
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
                    "Returns the count of Disagree orders grouped by disagree_reason for the given period.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "start_date", in: "query", schema: { type: "string", format: "date-time" } },
                    { name: "end_date", in: "query", schema: { type: "string", format: "date-time" } },
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
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "pageSize", in: "query", schema: { type: "integer", default: 25 } },
                    { name: "page", in: "query", schema: { type: "integer", default: 1 } },
                    { name: "order", in: "query", schema: { type: "string" } },
                    { name: "my", in: "query", schema: { type: "boolean" } },
                    { name: "name", in: "query", schema: { type: "string" } },
                    { name: "surname", in: "query", schema: { type: "string" } },
                    { name: "email", in: "query", schema: { type: "string" } },
                    { name: "phone", in: "query", schema: { type: "string" } },
                    { name: "age", in: "query", schema: { type: "integer", minimum: 0 } },
                    { name: "course", in: "query", schema: { type: "string" } },
                    { name: "course_format", in: "query", schema: { type: "string" } },
                    { name: "course_type", in: "query", schema: { type: "string" } },
                    { name: "status", in: "query", schema: { type: "string" } },
                    { name: "group", in: "query", schema: { type: "string" } },
                    { name: "start_date", in: "query", schema: { type: "string", format: "date" } },
                    { name: "end_date", in: "query", schema: { type: "string", format: "date" } },
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
                description:
                    "Note: if no order matches the given id, the API currently responds 200 with an empty/partial body instead of 404.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: {
                    "200": {
                        description: "Order found, including its comments",
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
            patch: {
                tags: ["Orders"],
                summary: "Update an order by id",
                description:
                    "On first update, assigns the order to the current user's surname as manager and sets status to 'In work' if it was 'New'. Only the assigned manager can update the order afterwards.",
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
                                    name: { type: "string", nullable: true },
                                    surname: { type: "string", nullable: true },
                                    email: { type: "string", format: "email", nullable: true },
                                    phone: { type: "string", nullable: true },
                                    age: { type: "integer", minimum: 0, nullable: true },
                                    sum: { type: "number", minimum: 0, nullable: true },
                                    already_paid: { type: "number", minimum: 0, nullable: true },
                                    status: {
                                        type: "string",
                                        enum: ["In work", "New", "Aggre", "Disaggre", "Dubbing"],
                                        nullable: true,
                                    },
                                    course: {
                                        type: "string",
                                        enum: ["FS", "QACX", "JCX", "JSCX", "FE", "PCX"],
                                        nullable: true,
                                    },
                                    course_type: {
                                        type: "string",
                                        enum: ["pro", "minimal", "premium", "incubator", "vip"],
                                        nullable: true,
                                    },
                                    course_format: {
                                        type: "string",
                                        enum: ["static", "online"],
                                        nullable: true,
                                    },
                                    group: { type: "string", nullable: true },
                                    msg: { type: "string", nullable: true },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Order updated successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Order" },
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
                        description:
                            "Forbidden - the order is already assigned to a different manager",
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
                    "Replaces the order's tag list. Up to 20 tags, 30 characters each. Not subject to manager ownership checks.",
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
                                        items: { type: "string" },
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
                    "Logs the change to the history log and notifies the new manager via Telegram and in-app notification.",
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
                        description: "Validation error, or manager not found",
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
                    "On first comment, assigns the order to the current user's surname as manager and sets status to 'In work' if it was 'New'. Only the assigned manager can comment afterwards.",
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
                        description:
                            "Forbidden - the order is already assigned to a different manager",
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
                    "Returns a chronological list of tracked changes (status, manager, group, field edits) and comment events for this order, newest first.",
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
                    "Returns a paginated, filterable log of all tracked order events across the whole system.",
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
                        schema: { type: "integer", minimum: 1, default: 25 },
                    },
                    {
                        name: "author",
                        in: "query",
                        schema: { type: "string" },
                        description: "Filter by author (user) id",
                    },
                    {
                        name: "start_date",
                        in: "query",
                        schema: { type: "string", format: "date-time" },
                    },
                    {
                        name: "end_date",
                        in: "query",
                        schema: { type: "string", format: "date-time" },
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
                    "Generates a short-lived code the user sends to the Telegram bot via /start <code> (or a deep-link) to link their account.",
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
                },
            },
        },

        "/telegram/link": {
            delete: {
                tags: ["Telegram"],
                summary: "Unlink the current user's Telegram account",
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
                    "Enables or disables specific notification events (new_order, status_change, comment_added) sent to Telegram.",
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
                    "Enable/disable auto-assign, switch mode (round_robin / load_based), or update the list of participating managers.",
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
                                        items: { type: "string" },
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
                                    thresholdHours: { type: "integer", minimum: 1 },
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
                    "If the order's status hasn't changed by dueDate, the assignee gets a reminder (in Telegram, if enabled).",
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
                                    title: { type: "string" },
                                    assignee: { type: "string", description: "User id" },
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
            get: {
                tags: ["Tasks"],
                summary: "Get tasks for an order",
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

        "/notifications": {
            get: {
                tags: ["Notifications"],
                summary: "Get paginated in-app notifications for the current user",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "pageSize", in: "query", schema: { type: "integer", default: 20 } },
                    { name: "page", in: "query", schema: { type: "integer", default: 1 } },
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
                    "Returns all users except the currently authenticated admin.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "pageSize", in: "query", schema: { type: "integer", default: 25 } },
                    { name: "page", in: "query", schema: { type: "integer", default: 1 } },
                    { name: "search", in: "query", description: "Search by name or email", schema: { type: "string" } },
                    {
                        name: "order",
                        in: "query",
                        description:
                            "Sort field. Prefix with '-' for descending order (e.g. -createdAt)",
                        schema: { type: "string" },
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
                                    name: { type: "string" },
                                    surname: { type: "string" },
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

        "/users/{id}": {
            get: {
                tags: ["Users"],
                summary: "Get a user by id (Admin only)",
                description:
                    "Note: if no user matches the given id, the API currently responds 200 with a null body instead of 404.",
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
                                    name: { type: "string" },
                                    surname: { type: "string" },
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
                        description: "Invalid id format",
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

        "/users/{id}/avatar": {
            post: {
                tags: ["Users"],
                summary: "Upload a profile avatar",
                description:
                    "Users may upload their own avatar; admins may upload for any user. Accepts JPEG, PNG, or WEBP, up to 5MB.",
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
                        description: "Invalid file type, file too large, or no file uploaded",
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
                        description: "Forbidden - can only upload your own avatar",
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
                },
            },
        },

        "/users/{id}/ban": {
            patch: {
                tags: ["Users"],
                summary: "Ban a user (Admin only)",
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
                                    name: { type: "string" },
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
            Tokens: {
                type: "object",
                properties: {
                    accessToken: { type: "string" },
                    refreshToken: { type: "string" },
                },
            },
            User: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    email: { type: "string" },
                    password: {
                        type: "string",
                        description:
                            "Hashed password. Note: the API currently returns this field as-is; it is not stripped from responses.",
                    },
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
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                    last_login: { type: "string", format: "date-time", nullable: true },
                },
            },
            Order: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    name: { type: "string" },
                    surname: { type: "string" },
                    email: { type: "string" },
                    phone: { type: "string" },
                    age: { type: "integer" },
                    course: {
                        type: "string",
                        enum: ["FS", "QACX", "JCX", "JSCX", "FE", "PCX"],
                    },
                    course_format: { type: "string", enum: ["static", "online"] },
                    course_type: {
                        type: "string",
                        enum: ["pro", "minimal", "premium", "incubator", "vip"],
                    },
                    sum: { type: "number" },
                    already_paid: { type: "number" },
                    created_at: { type: "string", format: "date-time" },
                    utm: { type: "string" },
                    msg: { type: "string" },
                    status: {
                        type: "string",
                        enum: ["In work", "New", "Aggre", "Disaggre", "Dubbing"],
                    },
                    status_updated_at: {
                        type: "string",
                        format: "date-time",
                        description: "Timestamp of the last status change",
                    },
                    is_overdue: {
                        type: "boolean",
                        description: "True if flagged overdue by the automated check (New status, no comment, past the configured threshold)",
                    },
                    disagree_at: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        description: "Timestamp of the most recent transition into Disaggre status; used by the loss report period filter",
                    },
                    manager: {
                        type: "object",
                        nullable: true,
                        description:
                            "User assigned to this order (populated with _id, name, surname). Set automatically to the current user on first update or first comment (including by an Admin), by the auto-assign feature on creation, or explicitly via PATCH /orders/{id}/reassign (Admin only). Once set, only that manager can edit, comment on, or reassign the order.",
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
                        type: "integer",
                        description: "Hours a New order can stay without a comment before being flagged overdue",
                    },
                },
            },
            Task: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    title: { type: "string" },
                    order: { type: "string" },
                    assignee: { type: "string" },
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
                description: "Total orders, one count per status (keyed by status value, e.g. 'New', 'In work'), and overdueCount.",
                properties: {
                    total: { type: "integer" },
                    overdueCount: { type: "integer" },
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
                    order: { type: "string" },
                    author: {
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
                            "Populated with author's name/surname when returned via GET endpoints.",
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
