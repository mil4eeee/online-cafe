package com.cafe.onlinecafe.mcp;

import java.util.Map;

public record McpJsonRpcResponse(
        String jsonrpc,
        String id,
        Object result,
        Object error
) {
    public static McpJsonRpcResponse ok(String id, Object result) {
        return new McpJsonRpcResponse("2.0", id, result, null);
    }

    public static McpJsonRpcResponse error(String id, int code, String message) {
        return new McpJsonRpcResponse(
                "2.0",
                id,
                null,
                Map.of(
                        "code", code,
                        "message", message
                )
        );
    }
}