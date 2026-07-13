package com.cafe.onlinecafe.controller;

import com.cafe.onlinecafe.model.MenuItem;
import com.cafe.onlinecafe.service.MenuService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
})
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping("/")
    public String home() {
        return "Online Cafe backend is working!";
    }

    @GetMapping("/api/menu")
    public Map<String, Object> getMenu() {
        return menuService.getMenu();
    }

    @GetMapping("/api/admin/menu")
    public List<MenuItem> getAdminMenu() {
        return menuService.getAllItems();
    }

    @PostMapping("/api/admin/menu")
    public MenuItem createMenuItem(@RequestBody MenuItem item) {
        return menuService.createItem(item);
    }

    @PutMapping("/api/admin/menu/{id}")
    public MenuItem updateMenuItem(
            @PathVariable String id,
            @RequestBody MenuItem item
    ) {
        return menuService.updateItem(id, item);
    }

    @DeleteMapping("/api/admin/menu/{id}")
    public void deleteMenuItem(@PathVariable String id) {
        menuService.deleteItem(id);
    }
}