CREATE INDEX idx_recipes_feed
  ON recipes (source_type, is_published, created_at);
  
CREATE INDEX idx_comments_recipe_created
  ON comments (recipe_id, created_at);
  
CREATE INDEX idx_shopping_user_checked
  ON shopping_list_items (user_id, is_checked);