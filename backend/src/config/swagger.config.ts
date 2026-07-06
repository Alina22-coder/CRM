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
            url: "http://localhost:3000",
            description: "Local server",
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
                summary: "Update a user's name and surname",
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
                                required: ["name", "surname"],
                                properties: {
                                    name: { type: "string" },
                                    surname: { type: "string" },
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
                    manager: {
                        type: "string",
                        nullable: true,
                        description:
                            "Surname of the manager assigned to this order. Set automatically to the current user's surname on first update or first comment.",
                    },
                    group: { type: "string", nullable: true },
                },
            },
            OrderStatistic: {
                type: "object",
                properties: {
                    total: { type: "integer" },
                    byStatus: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                _id: {
                                    type: "string",
                                    description: "Order status",
                                },
                                count: { type: "integer" },
                            },
                        },
                    },
                },
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
        },
    },
};

export { swaggerDocument, swaggerUI };
