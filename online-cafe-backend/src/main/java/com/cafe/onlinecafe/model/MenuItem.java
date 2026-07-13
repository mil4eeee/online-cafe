package com.cafe.onlinecafe.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "menu_items")
public class MenuItem {

    @Id
    private String id;

    private String name;
    private String category;

    @ElementCollection
    @CollectionTable(
            name = "menu_item_prices",
            joinColumns = @JoinColumn(name = "menu_item_id")
    )
    private List<Price> prices = new ArrayList<>();

    private String temperature;
    private boolean caffeine;
    private boolean available;
    private String sweetness;

    @ElementCollection
    @CollectionTable(
            name = "menu_item_allergens",
            joinColumns = @JoinColumn(name = "menu_item_id")
    )
    @Column(name = "allergen")
    private List<String> allergens = new ArrayList<>();

    @ElementCollection
    @CollectionTable(
            name = "menu_item_flavors",
            joinColumns = @JoinColumn(name = "menu_item_id")
    )
    @Column(name = "flavor")
    private List<String> flavor_profile = new ArrayList<>();

    private String description;
}