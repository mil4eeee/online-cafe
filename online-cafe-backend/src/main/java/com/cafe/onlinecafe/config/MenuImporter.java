package com.cafe.onlinecafe.config;

import com.cafe.onlinecafe.model.MenuItem;
import com.cafe.onlinecafe.repository.MenuItemRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
@Component
public class MenuImporter implements CommandLineRunner {

    private final MenuItemRepository menuItemRepository;
    private final ObjectMapper objectMapper;

    public MenuImporter(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public void run(String... args) throws Exception {
        if (menuItemRepository.count() > 0) {
            return;
        }

        InputStream inputStream = new ClassPathResource("menu.json").getInputStream();

        JsonNode root =  objectMapper.readTree(inputStream);
        JsonNode menuItems = root.get("menu_items");

        for (JsonNode menuItem : menuItems) {
            MenuItem menuItemEntity = objectMapper.treeToValue(menuItem, MenuItem.class);
            menuItemRepository.save(menuItemEntity);
        }
    }
}
