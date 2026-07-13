CREATE TABLE menu_items (
                            id VARCHAR(100) PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            category VARCHAR(100) NOT NULL,
                            temperature VARCHAR(50),
                            caffeine BOOLEAN,
                            available BOOLEAN,
                            sweetness VARCHAR(100),
                            description TEXT
);

CREATE TABLE menu_item_prices (
                                  id BIGSERIAL PRIMARY KEY,
                                  menu_item_id VARCHAR(100) NOT NULL,
                                  amount_mkd INTEGER NOT NULL,
                                  option_name VARCHAR(255),
                                  CONSTRAINT fk_price_menu_item
                                      FOREIGN KEY (menu_item_id)
                                          REFERENCES menu_items(id)
                                          ON DELETE CASCADE
);