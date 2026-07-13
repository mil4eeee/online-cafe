package com.cafe.onlinecafe.repository;

import com.cafe.onlinecafe.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}