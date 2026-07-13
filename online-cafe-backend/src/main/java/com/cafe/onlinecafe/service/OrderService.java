package com.cafe.onlinecafe.service;

import com.cafe.onlinecafe.model.Order;
import com.cafe.onlinecafe.model.OrderItem;
import com.cafe.onlinecafe.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Order createOrder(Order order) {

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                item.setOrder(order);
            }
        }

        order.setStatus("PENDING");

        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public Order updateStatus(Long id, String status) {

        Order order = orderRepository.findById(id)
                .orElseThrow();

        order.setStatus(status);

        return orderRepository.save(order);
    }
    public void clearOrders() {
        orderRepository.deleteAll();
    }
}