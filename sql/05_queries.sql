-- ============================================================================
-- 05_queries.sql  -  Queries each Cooking Nexus API endpoint needs
-- ============================================================================
-- HOW TO USE THIS FILE (in MySQL Workbench)
--   1. Run the SET lines in the "Test values" section first (select them all,
--      then click the lightning bolt). They stand in for values the backend
--      will pass in as parameters.
--   2. Run ONE query at a time (select it, then lightning bolt).
--   3. READ queries (SELECT) are always safe.
--   4. WRITE queries (INSERT / UPDATE / DELETE) change data. To try one without
--      keeping the change, run these three steps in the same tab:
--         START TRANSACTION;
--         (the write query)
--         ROLLBACK;
--      If you forget, rebuild with 99_reset.sql, then 01, 02, 03, 04.
--
-- RULES THE BACKEND MUST FOLLOW
--   * @user_id is ALWAYS the logged-in user from the auth cookie, never a value
--     the browser sends in the request body.
--   * A write that reports 0 rows affected means "not found or not yours".
--     Return 404 (the SDD prefers 404 so private IDs are not revealed).
--   * Error 1062 (duplicate) on email / favorite / like -> return a friendly
--     "already exists" response, not a server error.
--   * Never build SQL by joining strings. Use parameters (SQLAlchemy does this).
--   * Wrap multi-statement actions (create recipe + ingredients) in ONE
--     transaction.
-- ============================================================================

USE cooking_nexus;

-- ---------------------------------------------------------------------------
-- Test values (stand-ins for request parameters)
-- ---------------------------------------------------------------------------
SET @user_id          = 1;                           -- logged-in user (Demo Cook)
SET @new_email        = 'new@cookingnexus.local';
SET @email            = 'demo@cookingnexus.local';
SET @password_hash    = 'FAKE_HASH_demo_only';
SET @display_name     = 'Demo Cook';
SET @pantry_item_id   = 2;
SET @shopping_item_id = 1;
SET @recipe_id        = 7;
SET @comment_id       = 1;
SET @name             = 'Basil';
SET @quantity         = 1;
SET @unit             = 'bag';
SET @expiration_date  = NULL;                        -- NULL = "Not tracked"
SET @amount           = 1;
SET @title            = 'Test Soup';
SET @description      = 'A test recipe.';
SET @instructions     = 'Step one.\nStep two.';
SET @prep             = 20;
SET @published        = TRUE;
SET @body             = 'Nice recipe!';
SET @search           = '';
SET @quick            = 0;                           -- 1 = only 30 minutes or less
SET @budget           = 0;                           -- 1 = only low cost


-- ============================================================================
-- ACCOUNTS
-- ============================================================================

-- Q01  POST /auth/register
-- Duplicate email -> error 1062 -> tell the user the email is taken.
INSERT INTO users (email, password_hash, display_name)
VALUES (@new_email, @password_hash, @display_name);

-- Q02  POST /auth/login
-- Backend verifies the password against password_hash. No rows -> generic
-- "invalid credentials" message.
SELECT user_id, password_hash, display_name
FROM users
WHERE email = @email;

-- Q03  GET /me
SELECT user_id AS id, email, display_name
FROM users
WHERE user_id = @user_id;

-- Q04  GET /me  (dietary preferences part of the response)
SELECT t.name
FROM user_dietary_preferences AS up
JOIN dietary_tags AS t ON t.dietary_tag_id = up.dietary_tag_id
WHERE up.user_id = @user_id
ORDER BY t.name;

-- Q05  PATCH /me  (display name)
UPDATE users
SET display_name = @display_name
WHERE user_id = @user_id;

-- Q06  PATCH /me  (replace dietary preferences) - 2 steps, one transaction
-- Step 1: remove the old selection
DELETE FROM user_dietary_preferences
WHERE user_id = @user_id;
-- Step 2: add the new selection (the backend builds this name list)
INSERT INTO user_dietary_preferences (user_id, dietary_tag_id)
SELECT @user_id, dietary_tag_id
FROM dietary_tags
WHERE name IN ('Vegetarian', 'Vegan');


-- ============================================================================
-- PANTRY
-- ============================================================================

-- Q07  GET /pantry
-- Expiration status is NOT stored. The UI (or this CASE) calculates it.
SELECT pantry_item_id AS id, user_id, name, quantity, unit, expiration_date,
  CASE
    WHEN expiration_date IS NULL                        THEN 'Not tracked'
    WHEN expiration_date < CURDATE()                    THEN 'Expired'
    WHEN expiration_date <= CURDATE() + INTERVAL 3 DAY  THEN 'Expiring soon'
    ELSE 'Normal'
  END AS status
FROM pantry_items
WHERE user_id = @user_id
ORDER BY name;

-- Q08  POST /pantry
INSERT INTO pantry_items (user_id, name, quantity, unit, expiration_date)
VALUES (@user_id, @name, @quantity, @unit, @expiration_date);

-- Q09  PATCH /pantry/{id}
-- 0 rows affected -> 404.
UPDATE pantry_items
SET name = @name, quantity = @quantity, unit = @unit,
    expiration_date = @expiration_date
WHERE pantry_item_id = @pantry_item_id
  AND user_id = @user_id;

-- Q10  PATCH /pantry/{id}  ("Use item": reduce quantity, never below zero)
UPDATE pantry_items
SET quantity = GREATEST(quantity - @amount, 0)
WHERE pantry_item_id = @pantry_item_id
  AND user_id = @user_id;

-- Q11  DELETE /pantry/{id}
DELETE FROM pantry_items
WHERE pantry_item_id = @pantry_item_id
  AND user_id = @user_id;

-- Q12  Dashboard: items expiring soon or already expired
SELECT pantry_item_id AS id, name, expiration_date,
       DATEDIFF(expiration_date, CURDATE()) AS days_left
FROM pantry_items
WHERE user_id = @user_id
  AND expiration_date IS NOT NULL
  AND expiration_date <= CURDATE() + INTERVAL 3 DAY
ORDER BY expiration_date;

-- Q13  Dashboard: summary card numbers
SELECT
  (SELECT COUNT(*) FROM pantry_items
     WHERE user_id = @user_id)                               AS pantry_items,
  (SELECT COUNT(*) FROM pantry_items
     WHERE user_id = @user_id
       AND expiration_date >= CURDATE()
       AND expiration_date <= CURDATE() + INTERVAL 3 DAY)    AS expiring_soon,
  (SELECT COUNT(*) FROM favorites
     WHERE user_id = @user_id)                               AS favorites,
  (SELECT COUNT(*) FROM shopping_list_items
     WHERE user_id = @user_id)                               AS shopping_items,
  (SELECT COALESCE(SUM(is_checked), 0) FROM shopping_list_items
     WHERE user_id = @user_id)                               AS shopping_checked;


-- ============================================================================
-- RECIPE DISCOVERY AND DETAIL
-- ============================================================================

-- Q14  POST /recipes/discover  (search + quick + budget + pantry match)
-- have_count = how many of the recipe's ingredients the user's pantry has.
-- Pagination, if needed: add  LIMIT 20 OFFSET 0  (numbers, not variables).
SELECT r.recipe_id AS id, r.title, r.description, r.source_label,
       r.prep_time_minutes, r.cost_band, r.image_url,
       COUNT(ri.ingredient_id)            AS total_ingredients,
       SUM(p.pantry_item_id IS NOT NULL)  AS have_count
FROM recipes AS r
JOIN recipe_ingredients AS ri ON ri.recipe_id = r.recipe_id
LEFT JOIN pantry_items AS p
       ON p.user_id = @user_id AND LOWER(p.name) = LOWER(ri.name)
WHERE r.source_type = 'cookbook'
  AND r.is_published = TRUE
  AND (@quick  = 0 OR r.prep_time_minutes <= 30)
  AND (@budget = 0 OR r.cost_band = 'low')
  AND (@search = ''
       OR r.title LIKE CONCAT('%', @search, '%')
       OR r.recipe_id IN (SELECT x.recipe_id
                          FROM recipe_ingredients AS x
                          WHERE x.name LIKE CONCAT('%', @search, '%')))
GROUP BY r.recipe_id, r.title, r.description, r.source_label,
         r.prep_time_minutes, r.cost_band, r.image_url
ORDER BY have_count DESC, r.title;

-- Q15  Same as Q14 plus dietary tags: recipes that have ALL chosen tags.
-- The backend builds the IN (...) list and sets the number after = to the
-- number of tags chosen (here 2: Vegan AND Gluten-free).
SELECT r.recipe_id AS id, r.title, r.source_label, r.prep_time_minutes,
       COUNT(ri.ingredient_id)            AS total_ingredients,
       SUM(p.pantry_item_id IS NOT NULL)  AS have_count
FROM recipes AS r
JOIN recipe_ingredients AS ri ON ri.recipe_id = r.recipe_id
LEFT JOIN pantry_items AS p
       ON p.user_id = @user_id AND LOWER(p.name) = LOWER(ri.name)
WHERE r.source_type = 'cookbook'
  AND r.is_published = TRUE
  AND r.recipe_id IN (
        SELECT rt.recipe_id
        FROM recipe_dietary_tags AS rt
        JOIN dietary_tags AS t ON t.dietary_tag_id = rt.dietary_tag_id
        WHERE t.name IN ('Vegan', 'Gluten-free')
        GROUP BY rt.recipe_id
        HAVING COUNT(DISTINCT t.name) = 2)
GROUP BY r.recipe_id, r.title, r.source_label, r.prep_time_minutes
ORDER BY have_count DESC, r.title;

-- Q16  GET /recipes/{id}  (main row; visible if published OR you wrote it)
-- No row -> 404.
SELECT r.recipe_id AS id, r.title, r.description, r.instructions,
       r.source_type, r.source_label, r.prep_time_minutes, r.cost_band,
       r.image_url, r.is_published, r.author_user_id,
       u.display_name AS author_name
FROM recipes AS r
LEFT JOIN users AS u ON u.user_id = r.author_user_id
WHERE r.recipe_id = @recipe_id
  AND (r.is_published = TRUE OR r.author_user_id = @user_id);

-- Q17  GET /recipes/{id}  (ingredients; the backend only runs this if Q16 found a row)
SELECT name, quantity, unit
FROM recipe_ingredients
WHERE recipe_id = @recipe_id
ORDER BY ingredient_id;

-- Q18  GET /recipes/{id}  (dietary tags; same note as Q17)
SELECT t.name
FROM recipe_dietary_tags AS rt
JOIN dietary_tags AS t ON t.dietary_tag_id = rt.dietary_tag_id
WHERE rt.recipe_id = @recipe_id
ORDER BY t.name;

-- Q19  Which of a recipe's ingredients is the user missing?
SELECT ri.name
FROM recipe_ingredients AS ri
WHERE ri.recipe_id = @recipe_id
  AND NOT EXISTS (
        SELECT 1 FROM pantry_items AS p
        WHERE p.user_id = @user_id AND LOWER(p.name) = LOWER(ri.name))
ORDER BY ri.ingredient_id;


-- ============================================================================
-- FAVORITES
-- ============================================================================

-- Q20  GET /favorites  (full recipe info, newest favorite first)
-- A favorite whose recipe was later unpublished by its author is hidden,
-- unless the user is that author (drafts are never shown to other users).
SELECT r.recipe_id AS id, r.title, r.description, r.source_type, r.source_label,
       r.prep_time_minutes, r.cost_band, r.image_url
FROM favorites AS f
JOIN recipes AS r ON r.recipe_id = f.recipe_id
WHERE f.user_id = @user_id
  AND (r.is_published = TRUE OR r.author_user_id = @user_id)
ORDER BY f.created_at DESC, f.favorite_id DESC;

-- Q21  POST /favorites/{recipeId}
-- Only published recipes (or your own). 0 rows affected -> 404.
-- Duplicate -> error 1062 -> already a favorite.
INSERT INTO favorites (user_id, recipe_id)
SELECT @user_id, r.recipe_id
FROM recipes AS r
WHERE r.recipe_id = @recipe_id
  AND (r.is_published = TRUE OR r.author_user_id = @user_id);

-- Q22  DELETE /favorites/{recipeId}
DELETE FROM favorites
WHERE user_id = @user_id
  AND recipe_id = @recipe_id;


-- ============================================================================
-- SHOPPING LIST
-- ============================================================================

-- Q23  GET /shopping-list
SELECT shopping_item_id AS id, user_id, name, quantity, unit, is_checked
FROM shopping_list_items
WHERE user_id = @user_id
ORDER BY is_checked, name;

-- Q24  POST /shopping-list
INSERT INTO shopping_list_items (user_id, name, quantity, unit)
VALUES (@user_id, @name, @quantity, @unit);

-- Q25  PATCH /shopping-list/{id}  (check / uncheck)
UPDATE shopping_list_items
SET is_checked = NOT is_checked
WHERE shopping_item_id = @shopping_item_id
  AND user_id = @user_id;

-- Q26  DELETE /shopping-list/{id}
DELETE FROM shopping_list_items
WHERE shopping_item_id = @shopping_item_id
  AND user_id = @user_id;

-- Q27  "Add missing ingredients" for a recipe, skipping duplicates
INSERT INTO shopping_list_items (user_id, name)
SELECT @user_id, ri.name
FROM recipe_ingredients AS ri
WHERE ri.recipe_id = @recipe_id
  AND NOT EXISTS (SELECT 1 FROM pantry_items AS p
                  WHERE p.user_id = @user_id AND LOWER(p.name) = LOWER(ri.name))
  AND NOT EXISTS (SELECT 1 FROM shopping_list_items AS s
                  WHERE s.user_id = @user_id AND LOWER(s.name) = LOWER(ri.name));


-- ============================================================================
-- COMMUNITY
-- ============================================================================

-- Q28  GET /community/recipes  (published feed, newest first)
-- liked_by_me and comment_count are calculated, never stored.
-- comment_count uses a sub-select on purpose: joining both likes and comments
-- would multiply the rows and give wrong counts.
-- Pagination: add  LIMIT 20 OFFSET 0  (numbers, not variables).
SELECT r.recipe_id AS id, r.author_user_id, u.display_name AS author_name,
       r.title, r.description, r.image_url, r.prep_time_minutes, r.is_published,
       COUNT(l.like_id)                                   AS like_count,
       COALESCE(MAX(l.user_id = @user_id), 0)             AS liked_by_me,
       (SELECT COUNT(*) FROM comments AS c
         WHERE c.recipe_id = r.recipe_id)                 AS comment_count
FROM recipes AS r
JOIN users AS u ON u.user_id = r.author_user_id
LEFT JOIN likes AS l ON l.recipe_id = r.recipe_id
WHERE r.source_type = 'community'
  AND r.is_published = TRUE
GROUP BY r.recipe_id, r.author_user_id, u.display_name, r.title, r.description,
         r.image_url, r.prep_time_minutes, r.is_published, r.created_at
ORDER BY r.created_at DESC, r.recipe_id DESC;

-- Q29  GET /community/recipes/mine  (ALL of your recipes, drafts included)
SELECT r.recipe_id AS id, r.title, r.description, r.image_url,
       r.prep_time_minutes, r.is_published,
       (SELECT COUNT(*) FROM likes AS l WHERE l.recipe_id = r.recipe_id) AS like_count
FROM recipes AS r
WHERE r.author_user_id = @user_id
ORDER BY r.created_at DESC, r.recipe_id DESC;

-- Q30  Comments under one post (with author names)
SELECT c.comment_id AS id, c.user_id, u.display_name AS author_name, c.body,
       c.created_at
FROM comments AS c
JOIN users AS u ON u.user_id = c.user_id
WHERE c.recipe_id = @recipe_id
ORDER BY c.created_at, c.comment_id;

-- Q31  POST /community/recipes  (create a private draft) - one transaction
-- Step 1: the recipe row. Drafts start as is_published = FALSE.
INSERT INTO recipes (author_user_id, source_type, title, description,
                     instructions, prep_time_minutes, is_published)
VALUES (@user_id, 'community', @title, @description, @instructions, @prep, FALSE);
-- Step 2: remember the new ID (the backend gets this from its database driver)
SET @new_recipe_id = LAST_INSERT_ID();
-- Step 3: its ingredients, then its dietary tags
INSERT INTO recipe_ingredients (recipe_id, name)
VALUES (@new_recipe_id, 'Potatoes'), (@new_recipe_id, 'Garlic');
INSERT INTO recipe_dietary_tags (recipe_id, dietary_tag_id)
SELECT @new_recipe_id, dietary_tag_id FROM dietary_tags WHERE name IN ('Vegetarian');

-- Q32  PATCH /community/recipes/{id}  (author only)
-- 0 rows affected -> 404. If it succeeds, the backend then deletes and
-- re-inserts the ingredients / tags (same transaction).
UPDATE recipes
SET title = @title, description = @description,
    instructions = @instructions, prep_time_minutes = @prep
WHERE recipe_id = @recipe_id
  AND author_user_id = @user_id
  AND source_type = 'community';

-- Q33  POST /community/recipes/{id}/publish  (publish or unpublish)
UPDATE recipes
SET is_published = @published
WHERE recipe_id = @recipe_id
  AND author_user_id = @user_id
  AND source_type = 'community';

-- Q34  DELETE /community/recipes/{id}
-- Ingredients, tags, likes, comments and favorites are removed automatically
-- (ON DELETE CASCADE).
DELETE FROM recipes
WHERE recipe_id = @recipe_id
  AND author_user_id = @user_id
  AND source_type = 'community';

-- Q35  POST /community/recipes/{id}/like
-- Only published community recipes can be liked. 0 rows affected -> 404.
-- Already liked -> error 1062.
INSERT INTO likes (user_id, recipe_id)
SELECT @user_id, r.recipe_id
FROM recipes AS r
WHERE r.recipe_id = @recipe_id
  AND r.source_type = 'community'
  AND r.is_published = TRUE;

-- Q36  DELETE /community/recipes/{id}/like
DELETE FROM likes
WHERE user_id = @user_id
  AND recipe_id = @recipe_id;

-- Q37  POST /community/recipes/{id}/comments
-- Same rule as likes: published community recipes only.
INSERT INTO comments (user_id, recipe_id, body)
SELECT @user_id, r.recipe_id, @body
FROM recipes AS r
WHERE r.recipe_id = @recipe_id
  AND r.source_type = 'community'
  AND r.is_published = TRUE;

-- Q38  DELETE /comments/{id}  (your own comment only)
DELETE FROM comments
WHERE comment_id = @comment_id
  AND user_id = @user_id;
