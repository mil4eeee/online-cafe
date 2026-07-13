package com.cafe.onlinecafe.service;

import com.cafe.onlinecafe.model.MenuItem;
import com.cafe.onlinecafe.repository.MenuItemRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MenuService {

    private final MenuItemRepository menuItemRepository;

    public MenuService(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    public Map<String, Object> getMenu() {
        Map<String, Object> response = new HashMap<>();

        response.put("cafe_name", "My Grandparents House Cafe");
        response.put("currency", "MKD");
        response.put("version", "1.0");
        response.put("menu_items", menuItemRepository.findAll());

        return response;
    }

    public String getMenuJson() {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.writeValueAsString(getMenu());
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert menu to JSON", e);
        }
    }

    public List<MenuItem> getAllItems() {
        return menuItemRepository.findAll();
    }

    public MenuItem createItem(MenuItem item) {
        return menuItemRepository.save(item);
    }

    public MenuItem updateItem(String id, MenuItem item) {
        item.setId(id);
        return menuItemRepository.save(item);
    }

    public void deleteItem(String id) {
        menuItemRepository.deleteById(id);
    }
}