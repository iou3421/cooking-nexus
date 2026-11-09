	USE cooking_nexus;

   CREATE TABLE users (
     user_id        INT           NOT NULL AUTO_INCREMENT,
     email          VARCHAR(255)  NOT NULL,
     password_hash  VARCHAR(255)  NOT NULL,
     display_name   VARCHAR(50)   NOT NULL,
     created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
     PRIMARY KEY (user_id),
     UNIQUE KEY uq_users_email (email)
   ) ENGINE=InnoDB;
   
CREATE TABLE pantry_items (
  pantry_item_id   INT            NOT NULL AUTO_INCREMENT,
  user_id          INT            NOT NULL,
  name             VARCHAR(100)   NOT NULL,
  quantity         DECIMAL(10,2)  NOT NULL,
  unit             VARCHAR(20)    NULL,
  expiration_date  DATE           NULL,
  created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (pantry_item_id),
  CONSTRAINT fk_pantry_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE,
  CONSTRAINT chk_pantry_quantity CHECK (quantity >= 0)
) ENGINE=InnoDB;

CREATE TABLE cookbook_sources (
  cookbook_source_id  INT           NOT NULL AUTO_INCREMENT,
  title               VARCHAR(150)  NOT NULL,
  reference           VARCHAR(255)  NULL,
  permission_status   VARCHAR(30)   NOT NULL DEFAULT 'permitted',
  PRIMARY KEY (cookbook_source_id)
) ENGINE=InnoDB;

CREATE TABLE recipes (
  recipe_id           INT           NOT NULL AUTO_INCREMENT,
  author_user_id      INT           NULL,
  cookbook_source_id  INT           NULL,
  source_type         ENUM('cookbook','community') NOT NULL,
  source_label        VARCHAR(150)  NULL,
  title               VARCHAR(120)  NOT NULL,
  description         VARCHAR(700)  NULL,
  instructions        TEXT          NOT NULL,
  prep_time_minutes   SMALLINT      NULL,
  cost_band           ENUM('low','medium','high') NULL,
  image_url           VARCHAR(255)  NULL,
  is_published        BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (recipe_id),
  CONSTRAINT fk_recipes_author
    FOREIGN KEY (author_user_id) REFERENCES users (user_id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_recipes_source
    FOREIGN KEY (cookbook_source_id) REFERENCES cookbook_sources (cookbook_source_id)
    ON DELETE RESTRICT,
  CONSTRAINT chk_recipes_prep CHECK (prep_time_minutes BETWEEN 1 AND 999)
) ENGINE=InnoDB;

CREATE TABLE recipe_ingredients (
  ingredient_id  INT           NOT NULL AUTO_INCREMENT,
  recipe_id      INT           NOT NULL,
  name           VARCHAR(100)  NOT NULL,
  quantity       VARCHAR(30)   NULL,
  unit           VARCHAR(20)   NULL,
  PRIMARY KEY (ingredient_id),
  UNIQUE KEY uq_ingredient_per_recipe (recipe_id, name),
  CONSTRAINT fk_ingredients_recipe
    FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE dietary_tags (
  dietary_tag_id  INT          NOT NULL AUTO_INCREMENT,
  name            VARCHAR(40)  NOT NULL,
  PRIMARY KEY (dietary_tag_id),
  UNIQUE KEY uq_dietary_tags_name (name)
) ENGINE=InnoDB;

CREATE TABLE recipe_dietary_tags (
  recipe_id       INT  NOT NULL,
  dietary_tag_id  INT  NOT NULL,
  PRIMARY KEY (recipe_id, dietary_tag_id),
  CONSTRAINT fk_rdt_recipe
    FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_rdt_tag
    FOREIGN KEY (dietary_tag_id) REFERENCES dietary_tags (dietary_tag_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE favorites (
  favorite_id  INT       NOT NULL AUTO_INCREMENT,
  user_id      INT       NOT NULL,
  recipe_id    INT       NOT NULL,
  created_at   DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (favorite_id),
  UNIQUE KEY uq_favorites_user_recipe (user_id, recipe_id),
  CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_favorites_recipe
    FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE shopping_list_items (
  shopping_item_id  INT            NOT NULL AUTO_INCREMENT,
  user_id           INT            NOT NULL,
  name              VARCHAR(100)   NOT NULL,
  quantity          DECIMAL(10,2)  NOT NULL DEFAULT 1,
  unit              VARCHAR(20)    NULL,
  is_checked        BOOLEAN        NOT NULL DEFAULT FALSE,
  PRIMARY KEY (shopping_item_id),
  CONSTRAINT fk_shopping_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE,
  CONSTRAINT chk_shopping_quantity CHECK (quantity > 0)
) ENGINE=InnoDB;

CREATE TABLE user_dietary_preferences (
  user_id         INT  NOT NULL,
  dietary_tag_id  INT  NOT NULL,
  PRIMARY KEY (user_id, dietary_tag_id),
  CONSTRAINT fk_udp_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_udp_tag
    FOREIGN KEY (dietary_tag_id) REFERENCES dietary_tags (dietary_tag_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE likes (
  like_id     INT       NOT NULL AUTO_INCREMENT,
  user_id     INT       NOT NULL,
  recipe_id   INT       NOT NULL,
  created_at  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (like_id),
  UNIQUE KEY uq_likes_user_recipe (user_id, recipe_id),
  CONSTRAINT fk_likes_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_likes_recipe
    FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE comments (
  comment_id  INT           NOT NULL AUTO_INCREMENT,
  user_id     INT           NOT NULL,
  recipe_id   INT           NOT NULL,
  body        VARCHAR(500)  NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comment_id),
  CONSTRAINT fk_comments_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_comments_recipe
    FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id)
    ON DELETE CASCADE,
  CONSTRAINT chk_comments_body CHECK (CHAR_LENGTH(body) BETWEEN 1 AND 500)
) ENGINE=InnoDB;

