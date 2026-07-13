package com.cafe.onlinecafe.mcp;

import com.fasterxml.jackson.databind.JsonNode;

public record McpJsonRpcRequest(
        String jsonrpc,
        String id,
        String method,
        JsonNode params
) {
}