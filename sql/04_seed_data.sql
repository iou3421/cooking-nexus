USE cooking_nexus;

INSERT INTO users (user_id, email, password_hash, display_name) VALUES
  (1, 'demo@cookingnexus.local',   'FAKE_HASH_demo_only', 'Demo Cook'),
  (2, 'alex@cookingnexus.local',   'FAKE_HASH_demo_only', 'Alex'),
  (3, 'morgan@cookingnexus.local', 'FAKE_HASH_demo_only', 'Morgan'),
  (4, 'jordan@cookingnexus.local', 'FAKE_HASH_demo_only', 'Jordan');
  
INSERT INTO dietary_tags (dietary_tag_id, name) VALUES
  (1, 'Vegetarian'), (2, 'Vegan'), (3, 'Gluten-free'), (4, 'Dairy-free');
  
INSERT INTO cookbook_sources (cookbook_source_id, title, reference, permission_status)
VALUES (1, 'Sample Cookbook (demo only)', 'Illustrative sample records, not a real cookbook', 'permitted');

INSERT INTO recipes
  (recipe_id, cookbook_source_id, source_type, source_label, title, description,
   instructions, prep_time_minutes, cost_band, image_url, is_published)
VALUES
  (1, 1, 'cookbook', 'Sample recipe - Demo only', 'Tomato Spinach Pasta',
   'A quick skillet pasta with wilted spinach and juicy tomatoes.',
   'Cook pasta according to package directions.\nSaute garlic and tomatoes in olive oil.\nAdd spinach until wilted.\nToss with drained pasta and parmesan.',
   25, 'low', '/images/pasta.jpg', TRUE),
  (2, 1, 'cookbook', 'Sample recipe - Demo only', 'Vegetable Fried Rice',
   'A great use for leftover rice and mixed vegetables.',
   'Saute vegetables until tender.\nAdd cooked rice and stir-fry.\nSeason with soy sauce.',
   20, 'low', '/images/fried-rice.jpg', TRUE),
  (3, 1, 'cookbook', 'Sample recipe - Demo only', 'Quick Lentil Soup',
   'Comforting lentils, carrots, tomato and broth.',
   'Simmer lentils and vegetables in broth until tender.\nSeason and serve.',
   35, 'low', '/images/lentil-soup.jpg', TRUE),
  (4, 1, 'cookbook', 'Sample recipe - Demo only', 'Chickpea Coconut Curry',
   'Creamy, flavorful curry with pantry-friendly ingredients.',
   'Cook onions and garlic.\nAdd curry paste, chickpeas and coconut milk.\nSimmer and season to taste.',
   30, 'low', '/images/curry.jpg', TRUE),
  (5, 1, 'cookbook', 'Sample recipe - Demo only', 'Black Bean Quesadillas',
   'Crisp tortillas filled with black beans and cheese.',
   'Fill tortillas with black beans and cheese.\nPan-toast on both sides until golden.',
   15, 'low', '/images/quesadillas.jpg', TRUE),
  (6, 1, 'cookbook', 'Sample recipe - Demo only', 'Roasted Vegetable Sheet Pan',
   'Easy roasted vegetables with crisp edges and herbs.',
   'Chop the vegetables.\nCoat with oil and seasonings.\nRoast at 425 F until tender.',
   40, 'low', '/images/vegetables.jpg', TRUE);
   

INSERT INTO recipes
  (recipe_id, author_user_id, source_type, title, description,
   instructions, prep_time_minutes, image_url, is_published)
VALUES
  (7, 2, 'community', 'Spicy Chicken Rice',
   'Simple weeknight recipe with pantry staples.',
   'Cook rice.\nPan-fry chicken with spices.\nServe together.',
   30, '/images/chicken-rice.jpg', TRUE),
  (8, 3, 'community', 'Quick Veggie Wrap',
   'Fast vegetarian lunch idea with flexible ingredients.',
   'Spread hummus on the tortilla.\nAdd lettuce and carrots.\nRoll up and serve.',
   15, '/images/veggie-wrap.jpg', TRUE),
  (9, 4, 'community', 'Garlic Potato Bowl',
   'Crispy potatoes with garlic and herb yogurt sauce.',
   'Roast potatoes until crispy.\nMix garlic into yogurt.\nServe potatoes with the sauce.',
   40, '/images/potato-bowl.jpg', TRUE),
  (10, 1, 'community', 'My Draft Soup',
   'Private draft, not published.',
   'Work in progress.',
   20, NULL, FALSE);
   
   INSERT INTO recipe_ingredients (recipe_id, name) VALUES
  (1, 'Spinach'), (1, 'Tomatoes'), (1, 'Pasta'), (1, 'Parmesan'), (1, 'Garlic'),
  (2, 'Rice'), (2, 'Carrots'), (2, 'Peas'), (2, 'Onions'), (2, 'Soy Sauce'),
  (3, 'Lentils'), (3, 'Carrots'), (3, 'Onions'), (3, 'Tomatoes'), (3, 'Vegetable Broth'),
  (4, 'Chickpeas'), (4, 'Coconut Milk'), (4, 'Onions'), (4, 'Garlic'), (4, 'Curry Paste'),
  (5, 'Black Beans'), (5, 'Tortillas'), (5, 'Cheese'), (5, 'Onions'), (5, 'Bell Pepper'),
  (6, 'Broccoli'), (6, 'Carrots'), (6, 'Potatoes'), (6, 'Onions'), (6, 'Olive Oil');
  
  INSERT INTO recipe_ingredients (recipe_id, name) VALUES
  (7, 'Chicken'), (7, 'Rice'), (7, 'Bell Pepper'),
  (8, 'Tortilla'), (8, 'Lettuce'), (8, 'Carrots'), (8, 'Hummus'),
  (9, 'Potatoes'), (9, 'Garlic'), (9, 'Yogurt'),
  (10, 'Lentils');
  
  INSERT INTO recipe_dietary_tags (recipe_id, dietary_tag_id) VALUES
  (1, 1),
  (2, 1), (2, 4),
  (3, 1), (3, 2), (3, 3), (3, 4),
  (4, 1), (4, 2), (4, 3), (4, 4),
  (5, 1),
  (6, 1), (6, 2), (6, 3), (6, 4),
  (8, 1),
  (9, 1);
  
  INSERT INTO pantry_items (user_id, name, quantity, unit, expiration_date) VALUES
  (1, 'Rice',     2,   'lb',    NULL),
  (1, 'Chicken',  1.5, 'lb',    CURDATE() + INTERVAL 2 DAY),
  (1, 'Yogurt',   4,   'cups',  CURDATE() - INTERVAL 1 DAY),
  (1, 'Carrots',  6,   'whole', CURDATE() + INTERVAL 8 DAY),
  (1, 'Tomatoes', 5,   'whole', CURDATE() + INTERVAL 4 DAY),
  (1, 'Spinach',  1,   'bag',   CURDATE() + INTERVAL 3 DAY),
  (1, 'Milk',     1,   'gal',   CURDATE() + INTERVAL 5 DAY),
  (2, 'Flour',    1,   'bag',   NULL);
  
  INSERT INTO user_dietary_preferences (user_id, dietary_tag_id) VALUES (2, 2);
  
  INSERT INTO favorites (user_id, recipe_id) VALUES (1, 1), (1, 3), (2, 1);
  
  INSERT INTO shopping_list_items (user_id, name, quantity, unit, is_checked) VALUES
  (1, 'Garlic',   1, NULL,  FALSE),
  (1, 'Parmesan', 1, NULL,  TRUE),
  (2, 'Milk',     1, 'gal', FALSE);
  
  INSERT INTO likes (user_id, recipe_id) VALUES (3, 7), (4, 7), (2, 8), (2, 9), (3, 9);
  
  INSERT INTO comments (user_id, recipe_id, body) VALUES (4, 7, 'Looks great!');
  
  