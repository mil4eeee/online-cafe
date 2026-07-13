package com.cafe.onlinecafe.repository;

import com.cafe.onlinecafe.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemRepository extends JpaRepository<MenuItem, String> {
}