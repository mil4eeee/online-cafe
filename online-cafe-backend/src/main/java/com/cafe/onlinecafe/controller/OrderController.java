package com.cafe.onlinecafe.controller;

import com.cafe.onlinecafe.model.Order;
import com.cafe.onlinecafe.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
})
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        return orderService.createOrder(order);
    }

    @GetMapping
    public List<Order> getOrders() {
        return orderService.getAllOrders();
    }

    @PutMapping("/{id}/status")
    public Order updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        return orderService.updateStatus(
                id,
                body.get("status")
        );
    }
    @DeleteMapping("/clear")
    public void clearOrders() {
        orderService.clearOrders();
    }

}