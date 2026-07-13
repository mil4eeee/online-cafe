INSERT INTO menu_items (
    id, name, category, temperature, caffeine, available, sweetness, description
)
VALUES
    ('espresso', 'Espresso', 'hot_drinks', 'hot', true, true, 'none', 'Strong and concentrated coffee served in a small cup.'),
    ('double_espresso', 'Double Espresso', 'hot_drinks', 'hot', true, true, 'none', 'Two shots of rich espresso.'),
    ('cappuccino', 'Cappuccino', 'hot_drinks', 'hot', true, true, 'medium', 'Espresso with steamed milk and foam.'),
    ('latte', 'Latte', 'hot_drinks', 'hot', true, true, 'medium', 'Smooth espresso with steamed milk.'),
    ('antioxidant_smoothie', 'Antioxidant Smoothie', 'smoothies', 'cold', false, true, 'medium', 'Refreshing smoothie with berries, banana, and chia seeds.');

INSERT INTO menu_item_prices (menu_item_id, amount_mkd, option_name)
VALUES
    ('espresso', 100, NULL),
    ('double_espresso', 150, NULL),
    ('cappuccino', 180, NULL),
    ('latte', 200, NULL),
    ('antioxidant_smoothie', 220, 'regular milk'),
    ('antioxidant_smoothie', 250, 'almond milk');

INSERT INTO menu_item_allergens (menu_item_id, allergen)
VALUES
    ('cappuccino', 'milk'),
    ('latte', 'milk'),
    ('antioxidant_smoothie', 'milk'),
    ('antioxidant_smoothie', 'nuts');

INSERT INTO menu_item_flavors (menu_item_id, flavor)
VALUES
    ('espresso', 'bold'),
    ('espresso', 'strong'),
    ('double_espresso', 'bold'),
    ('cappuccino', 'creamy'),
    ('latte', 'smooth'),
    ('antioxidant_smoothie', 'fruity'),
    ('antioxidant_smoothie', 'refreshing');