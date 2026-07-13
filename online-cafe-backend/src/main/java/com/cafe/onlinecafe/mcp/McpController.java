package com.cafe.onlinecafe.mcp;

import com.cafe.onlinecafe.model.MenuItem;
import com.cafe.onlinecafe.service.MenuService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(path = "/mcp", produces = MediaType.APPLICATION_JSON_VALUE)
public class McpController {

    private final MenuService menuService;

    public McpController(MenuService menuService) {
        this.menuService = menuService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public McpJsonRpcResponse handle(@RequestBody McpJsonRpcRequest request) {
        if (request.method() == null) {
            return McpJsonRpcResponse.error(request.id(), -32600, "Missing method");
        }

        return switch (request.method()) {
            case "initialize" -> McpJsonRpcResponse.ok(request.id(), initializeResult());
            case "tools/list" -> McpJsonRpcResponse.ok(request.id(), toolsList());
            case "tools/call" -> callTool(request.id(), request.params());
            default -> McpJsonRpcResponse.error(request.id(), -32601, "Unknown method: " + request.method());
        };
    }

    @GetMapping
    public Map<String, Object> info() {
        return Map.of(
                "name", "online-cafe-mcp-server",
                "description", "MCP server for Online Cafe menu tools",
                "methods", List.of("initialize", "tools/list", "tools/call")
        );
    }

    private Map<String, Object> initializeResult() {
        return Map.of(
                "protocolVersion", "2025-03-26",
                "serverInfo", Map.of(
                        "name", "online-cafe-mcp-server",
                        "version", "0.0.1"
                ),
                "capabilities", Map.of(
                        "tools", Map.of()
                )
        );
    }

    private Map<String, Object> toolsList() {
        return Map.of(
                "tools", List.of(
                        Map.of(
                                "name", "get_menu",
                                "description", "Returns the full cafe menu with all menu items, prices, categories and descriptions.",
                                "inputSchema", Map.of(
                                        "type", "object",
                                        "properties", Map.of()
                                )
                        ),
                        Map.of(
                                "name", "search_menu_items",
                                "description", "Search cafe menu items by name, category, description, flavor, temperature or maximum price in MKD.",
                                "inputSchema", Map.of(
                                        "type", "object",
                                        "properties", Map.of(
                                                "query", Map.of(
                                                        "type", "string",
                                                        "description", "Search text, for example espresso, latte, cake, iced coffee"
                                                ),
                                                "category", Map.of(
                                                        "type", "string",
                                                        "description", "Optional category filter"
                                                ),
                                                "maxPriceMkd", Map.of(
                                                        "type", "integer",
                                                        "description", "Optional maximum price in Macedonian denars"
                                                ),
                                                "onlyAvailable", Map.of(
                                                        "type", "boolean",
                                                        "description", "If true, return only available items"
                                                )
                                        )
                                )
                        )
                )
        );
    }

    private McpJsonRpcResponse callTool(String id, JsonNode params) {
        if (params == null || !params.hasNonNull("name")) {
            return McpJsonRpcResponse.error(id, -32602, "Missing tool name");
        }

        String name = params.get("name").asText();
        JsonNode args = params.path("arguments");

        return switch (name) {
            case "get_menu" -> McpJsonRpcResponse.ok(id, Map.of(
                    "content", List.of(Map.of(
                            "type", "json",
                            "json", menuService.getMenu()
                    )),
                    "isError", false
            ));

            case "search_menu_items" -> McpJsonRpcResponse.ok(id, Map.of(
                    "content", List.of(Map.of(
                            "type", "json",
                            "json", searchMenuItems(args)
                    )),
                    "isError", false
            ));

            default -> McpJsonRpcResponse.error(id, -32602, "Unsupported tool: " + name);
        };
    }

    private List<MenuItem> searchMenuItems(JsonNode args) {
        String query = textOrEmpty(args, "query").toLowerCase();
        String category = textOrNull(args, "category");
        Integer maxPriceMkd = intOrNull(args, "maxPriceMkd");
        boolean onlyAvailable = args.has("onlyAvailable") && args.get("onlyAvailable").asBoolean();

        return menuService.getAllItems()
                .stream()
                .filter(item -> !onlyAvailable || item.isAvailable())
                .filter(item -> category == null || item.getCategory().equalsIgnoreCase(category))
                .filter(item -> maxPriceMkd == null || item.getPrices()
                        .stream()
                        .anyMatch(price -> price.getAmount_mkd() != null && price.getAmount_mkd() <= maxPriceMkd))
                .filter(item -> query.isBlank() || matchesQuery(item, query))
                .toList();
    }

    private boolean matchesQuery(MenuItem item, String query) {
        return contains(item.getName(), query)
                || contains(item.getCategory(), query)
                || contains(item.getDescription(), query)
                || contains(item.getTemperature(), query)
                || contains(item.getSweetness(), query)
                || item.getAllergens().stream().anyMatch(value -> contains(value, query))
                || item.getFlavor_profile().stream().anyMatch(value -> contains(value, query));
    }

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase().contains(query);
    }

    private static String textOrEmpty(JsonNode node, String field) {
        return node.hasNonNull(field) ? node.get(field).asText("") : "";
    }

    private static String textOrNull(JsonNode node, String field) {
        return node.hasNonNull(field) && !node.get(field).asText().isBlank()
                ? node.get(field).asText()
                : null;
    }

    private static Integer intOrNull(JsonNode node, String field) {
        return node.hasNonNull(field) ? node.get(field).asInt() : null;
    }
}