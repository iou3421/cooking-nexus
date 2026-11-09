USE cooking_nexus;

-- TEST 1: expiration status is calculated from the date, and NULL means Not tracked
SELECT pantry_item_id, name, expiration_date,
  CASE
    WHEN expiration_date IS NULL                        THEN 'Not tracked'
    WHEN expiration_date < CURDATE()                    THEN 'Expired'
    WHEN expiration_date <= CURDATE() + INTERVAL 3 DAY  THEN 'Expiring soon'
    ELSE 'Normal'
  END AS status
FROM pantry_items
WHERE user_id = 1
ORDER BY pantry_item_id;

-- TEST 2: user 2 asks for pantry item 1 (Rice, owned by user 1) -> must return nothing
SELECT * FROM pantry_items
WHERE pantry_item_id = 1 AND user_id = 2;

-- TEST 3: user 2 tries to change user 1's Rice -> must affect 0 rows
UPDATE pantry_items
SET quantity = 99
WHERE pantry_item_id = 1 AND user_id = 2;

-- TEST 4: Rice must still have quantity 2
SELECT quantity FROM pantry_items WHERE pantry_item_id = 1;

-- TEST 5: published community recipes only, newest first, with author and like count
SELECT r.recipe_id, r.title, u.display_name AS author,
       COUNT(l.like_id) AS like_count
FROM recipes AS r
JOIN users AS u ON u.user_id = r.author_user_id
LEFT JOIN likes AS l ON l.recipe_id = r.recipe_id
WHERE r.source_type = 'community'
  AND r.is_published = TRUE
GROUP BY r.recipe_id, r.title, u.display_name, r.created_at
ORDER BY r.created_at DESC, r.recipe_id DESC;

-- TEST 6: the author sees ALL their own recipes, including drafts
SELECT recipe_id, title, is_published
FROM recipes
WHERE author_user_id = 1;

-- TEST 7: recipes that are BOTH Vegan AND Gluten-free
SELECT r.recipe_id, r.title
FROM recipes AS r
JOIN recipe_dietary_tags AS rt ON rt.recipe_id = r.recipe_id
JOIN dietary_tags AS t ON t.dietary_tag_id = rt.dietary_tag_id
WHERE r.is_published = TRUE
  AND t.name IN ('Vegan', 'Gluten-free')
GROUP BY r.recipe_id, r.title
HAVING COUNT(DISTINCT t.name) = 2
ORDER BY r.recipe_id;

-- TEST 8: cookbook recipes that are quick (30 min or less) AND low cost
SELECT recipe_id, title, prep_time_minutes
FROM recipes
WHERE source_type = 'cookbook'
  AND prep_time_minutes <= 30
  AND cost_band = 'low'
ORDER BY recipe_id;

-- TEST 9: for each cookbook recipe, how many ingredients user 1 already has
SELECT r.recipe_id, r.title,
       COUNT(ri.ingredient_id)             AS total_ingredients,
       SUM(p.pantry_item_id IS NOT NULL)   AS have_count
FROM recipes AS r
JOIN recipe_ingredients AS ri ON ri.recipe_id = r.recipe_id
LEFT JOIN pantry_items AS p
       ON p.user_id = 1 AND LOWER(p.name) = LOWER(ri.name)
WHERE r.source_type = 'cookbook'
GROUP BY r.recipe_id, r.title
ORDER BY have_count DESC, r.recipe_id;

-- TEST 10: dashboard summary numbers for user 1
SELECT
  (SELECT COUNT(*) FROM pantry_items
     WHERE user_id = 1)                                     AS pantry_items,
  (SELECT COUNT(*) FROM pantry_items
     WHERE user_id = 1
       AND expiration_date >= CURDATE()
       AND expiration_date <= CURDATE() + INTERVAL 3 DAY)   AS expiring_soon,
  (SELECT COUNT(*) FROM favorites
     WHERE user_id = 1)                                     AS favorites,
  (SELECT COUNT(*) FROM shopping_list_items
     WHERE user_id = 1)                                     AS shopping_items,
  (SELECT COALESCE(SUM(is_checked), 0) FROM shopping_list_items
     WHERE user_id = 1)                                     AS shopping_checked;
     
-- TEST 11: Morgan (3) tries to delete Jordan's (4) comment -> must affect 0 rows
DELETE FROM comments
WHERE comment_id = 1 AND user_id = 3;

-- TEST 12: deleting user 1 must be blocked because they authored recipe 10
DELETE FROM users WHERE user_id = 1;

