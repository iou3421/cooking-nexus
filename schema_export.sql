CREATE DATABASE  IF NOT EXISTS `cooking_nexus` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `cooking_nexus`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: cooking_nexus
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `recipe_id` int NOT NULL,
  `body` varchar(500) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `fk_comments_user` (`user_id`),
  KEY `idx_comments_recipe_created` (`recipe_id`,`created_at`),
  CONSTRAINT `fk_comments_recipe` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`recipe_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `chk_comments_body` CHECK ((char_length(`body`) between 1 and 500))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,4,7,'Looks great!','2026-11-07 01:01:13');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cookbook_sources`
--

DROP TABLE IF EXISTS `cookbook_sources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cookbook_sources` (
  `cookbook_source_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `permission_status` varchar(30) NOT NULL DEFAULT 'permitted',
  PRIMARY KEY (`cookbook_source_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cookbook_sources`
--

LOCK TABLES `cookbook_sources` WRITE;
/*!40000 ALTER TABLE `cookbook_sources` DISABLE KEYS */;
INSERT INTO `cookbook_sources` VALUES (1,'Sample Cookbook (demo only)','Illustrative sample records, not a real cookbook','permitted');
/*!40000 ALTER TABLE `cookbook_sources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dietary_tags`
--

DROP TABLE IF EXISTS `dietary_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dietary_tags` (
  `dietary_tag_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(40) NOT NULL,
  PRIMARY KEY (`dietary_tag_id`),
  UNIQUE KEY `uq_dietary_tags_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dietary_tags`
--

LOCK TABLES `dietary_tags` WRITE;
/*!40000 ALTER TABLE `dietary_tags` DISABLE KEYS */;
INSERT INTO `dietary_tags` VALUES (4,'Dairy-free'),(3,'Gluten-free'),(2,'Vegan'),(1,'Vegetarian');
/*!40000 ALTER TABLE `dietary_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `favorite_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `recipe_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`favorite_id`),
  UNIQUE KEY `uq_favorites_user_recipe` (`user_id`,`recipe_id`),
  KEY `fk_favorites_recipe` (`recipe_id`),
  CONSTRAINT `fk_favorites_recipe` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`recipe_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (1,1,1,'2026-11-07 01:01:13'),(2,1,3,'2026-11-07 01:01:13'),(3,2,1,'2026-11-07 01:01:13');
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `like_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `recipe_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`like_id`),
  UNIQUE KEY `uq_likes_user_recipe` (`user_id`,`recipe_id`),
  KEY `fk_likes_recipe` (`recipe_id`),
  CONSTRAINT `fk_likes_recipe` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`recipe_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (1,3,7,'2026-11-07 01:01:13'),(2,4,7,'2026-11-07 01:01:13'),(3,2,8,'2026-11-07 01:01:13'),(4,2,9,'2026-11-07 01:01:13'),(5,3,9,'2026-11-07 01:01:13');
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pantry_items`
--

DROP TABLE IF EXISTS `pantry_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pantry_items` (
  `pantry_item_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`pantry_item_id`),
  KEY `fk_pantry_user` (`user_id`),
  CONSTRAINT `fk_pantry_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `chk_pantry_quantity` CHECK ((`quantity` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pantry_items`
--

LOCK TABLES `pantry_items` WRITE;
/*!40000 ALTER TABLE `pantry_items` DISABLE KEYS */;
INSERT INTO `pantry_items` VALUES (1,1,'Rice',2.00,'lb',NULL,'2026-11-07 01:01:13'),(2,1,'Chicken',1.50,'lb','2026-11-09','2026-11-07 01:01:13'),(3,1,'Yogurt',4.00,'cups','2026-11-06','2026-11-07 01:01:13'),(4,1,'Carrots',6.00,'whole','2026-11-15','2026-11-07 01:01:13'),(5,1,'Tomatoes',5.00,'whole','2026-11-11','2026-11-07 01:01:13'),(6,1,'Spinach',1.00,'bag','2026-11-10','2026-11-07 01:01:13'),(7,1,'Milk',1.00,'gal','2026-11-12','2026-11-07 01:01:13'),(8,2,'Flour',1.00,'bag',NULL,'2026-11-07 01:01:13');
/*!40000 ALTER TABLE `pantry_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_dietary_tags`
--

DROP TABLE IF EXISTS `recipe_dietary_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_dietary_tags` (
  `recipe_id` int NOT NULL,
  `dietary_tag_id` int NOT NULL,
  PRIMARY KEY (`recipe_id`,`dietary_tag_id`),
  KEY `fk_rdt_tag` (`dietary_tag_id`),
  CONSTRAINT `fk_rdt_recipe` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`recipe_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rdt_tag` FOREIGN KEY (`dietary_tag_id`) REFERENCES `dietary_tags` (`dietary_tag_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_dietary_tags`
--

LOCK TABLES `recipe_dietary_tags` WRITE;
/*!40000 ALTER TABLE `recipe_dietary_tags` DISABLE KEYS */;
INSERT INTO `recipe_dietary_tags` VALUES (1,1),(2,1),(3,1),(4,1),(5,1),(6,1),(8,1),(9,1),(3,2),(4,2),(6,2),(3,3),(4,3),(6,3),(2,4),(3,4),(4,4),(6,4);
/*!40000 ALTER TABLE `recipe_dietary_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_ingredients`
--

DROP TABLE IF EXISTS `recipe_ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_ingredients` (
  `ingredient_id` int NOT NULL AUTO_INCREMENT,
  `recipe_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `quantity` varchar(30) DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`ingredient_id`),
  UNIQUE KEY `uq_ingredient_per_recipe` (`recipe_id`,`name`),
  CONSTRAINT `fk_ingredients_recipe` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`recipe_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_ingredients`
--

LOCK TABLES `recipe_ingredients` WRITE;
/*!40000 ALTER TABLE `recipe_ingredients` DISABLE KEYS */;
INSERT INTO `recipe_ingredients` VALUES (1,1,'Spinach',NULL,NULL),(2,1,'Tomatoes',NULL,NULL),(3,1,'Pasta',NULL,NULL),(4,1,'Parmesan',NULL,NULL),(5,1,'Garlic',NULL,NULL),(6,2,'Rice',NULL,NULL),(7,2,'Carrots',NULL,NULL),(8,2,'Peas',NULL,NULL),(9,2,'Onions',NULL,NULL),(10,2,'Soy Sauce',NULL,NULL),(11,3,'Lentils',NULL,NULL),(12,3,'Carrots',NULL,NULL),(13,3,'Onions',NULL,NULL),(14,3,'Tomatoes',NULL,NULL),(15,3,'Vegetable Broth',NULL,NULL),(16,4,'Chickpeas',NULL,NULL),(17,4,'Coconut Milk',NULL,NULL),(18,4,'Onions',NULL,NULL),(19,4,'Garlic',NULL,NULL),(20,4,'Curry Paste',NULL,NULL),(21,5,'Black Beans',NULL,NULL),(22,5,'Tortillas',NULL,NULL),(23,5,'Cheese',NULL,NULL),(24,5,'Onions',NULL,NULL),(25,5,'Bell Pepper',NULL,NULL),(26,6,'Broccoli',NULL,NULL),(27,6,'Carrots',NULL,NULL),(28,6,'Potatoes',NULL,NULL),(29,6,'Onions',NULL,NULL),(30,6,'Olive Oil',NULL,NULL),(31,7,'Chicken',NULL,NULL),(32,7,'Rice',NULL,NULL),(33,7,'Bell Pepper',NULL,NULL),(34,8,'Tortilla',NULL,NULL),(35,8,'Lettuce',NULL,NULL),(36,8,'Carrots',NULL,NULL),(37,8,'Hummus',NULL,NULL),(38,9,'Potatoes',NULL,NULL),(39,9,'Garlic',NULL,NULL),(40,9,'Yogurt',NULL,NULL),(41,10,'Lentils',NULL,NULL);
/*!40000 ALTER TABLE `recipe_ingredients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipes`
--

DROP TABLE IF EXISTS `recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipes` (
  `recipe_id` int NOT NULL AUTO_INCREMENT,
  `author_user_id` int DEFAULT NULL,
  `cookbook_source_id` int DEFAULT NULL,
  `source_type` enum('cookbook','community') NOT NULL,
  `source_label` varchar(150) DEFAULT NULL,
  `title` varchar(120) NOT NULL,
  `description` varchar(700) DEFAULT NULL,
  `instructions` text NOT NULL,
  `prep_time_minutes` smallint DEFAULT NULL,
  `cost_band` enum('low','medium','high') DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`recipe_id`),
  KEY `fk_recipes_author` (`author_user_id`),
  KEY `fk_recipes_source` (`cookbook_source_id`),
  KEY `idx_recipes_feed` (`source_type`,`is_published`,`created_at`),
  CONSTRAINT `fk_recipes_author` FOREIGN KEY (`author_user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_recipes_source` FOREIGN KEY (`cookbook_source_id`) REFERENCES `cookbook_sources` (`cookbook_source_id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_recipes_prep` CHECK ((`prep_time_minutes` between 1 and 999))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipes`
--

LOCK TABLES `recipes` WRITE;
/*!40000 ALTER TABLE `recipes` DISABLE KEYS */;
INSERT INTO `recipes` VALUES (1,NULL,1,'cookbook','Sample recipe - Demo only','Tomato Spinach Pasta','A quick skillet pasta with wilted spinach and juicy tomatoes.','Cook pasta according to package directions.\nSaute garlic and tomatoes in olive oil.\nAdd spinach until wilted.\nToss with drained pasta and parmesan.',25,'low','/images/pasta.jpg',1,'2026-11-07 01:01:13'),(2,NULL,1,'cookbook','Sample recipe - Demo only','Vegetable Fried Rice','A great use for leftover rice and mixed vegetables.','Saute vegetables until tender.\nAdd cooked rice and stir-fry.\nSeason with soy sauce.',20,'low','/images/fried-rice.jpg',1,'2026-11-07 01:01:13'),(3,NULL,1,'cookbook','Sample recipe - Demo only','Quick Lentil Soup','Comforting lentils, carrots, tomato and broth.','Simmer lentils and vegetables in broth until tender.\nSeason and serve.',35,'low','/images/lentil-soup.jpg',1,'2026-11-07 01:01:13'),(4,NULL,1,'cookbook','Sample recipe - Demo only','Chickpea Coconut Curry','Creamy, flavorful curry with pantry-friendly ingredients.','Cook onions and garlic.\nAdd curry paste, chickpeas and coconut milk.\nSimmer and season to taste.',30,'low','/images/curry.jpg',1,'2026-11-07 01:01:13'),(5,NULL,1,'cookbook','Sample recipe - Demo only','Black Bean Quesadillas','Crisp tortillas filled with black beans and cheese.','Fill tortillas with black beans and cheese.\nPan-toast on both sides until golden.',15,'low','/images/quesadillas.jpg',1,'2026-11-07 01:01:13'),(6,NULL,1,'cookbook','Sample recipe - Demo only','Roasted Vegetable Sheet Pan','Easy roasted vegetables with crisp edges and herbs.','Chop the vegetables.\nCoat with oil and seasonings.\nRoast at 425 F until tender.',40,'low','/images/vegetables.jpg',1,'2026-11-07 01:01:13'),(7,2,NULL,'community',NULL,'Spicy Chicken Rice','Simple weeknight recipe with pantry staples.','Cook rice.\nPan-fry chicken with spices.\nServe together.',30,NULL,'/images/chicken-rice.jpg',1,'2026-11-07 01:01:13'),(8,3,NULL,'community',NULL,'Quick Veggie Wrap','Fast vegetarian lunch idea with flexible ingredients.','Spread hummus on the tortilla.\nAdd lettuce and carrots.\nRoll up and serve.',15,NULL,'/images/veggie-wrap.jpg',1,'2026-11-07 01:01:13'),(9,4,NULL,'community',NULL,'Garlic Potato Bowl','Crispy potatoes with garlic and herb yogurt sauce.','Roast potatoes until crispy.\nMix garlic into yogurt.\nServe potatoes with the sauce.',40,NULL,'/images/potato-bowl.jpg',1,'2026-11-07 01:01:13'),(10,1,NULL,'community',NULL,'My Draft Soup','Private draft, not published.','Work in progress.',20,NULL,NULL,0,'2026-11-07 01:01:13');
/*!40000 ALTER TABLE `recipes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shopping_list_items`
--

DROP TABLE IF EXISTS `shopping_list_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shopping_list_items` (
  `shopping_item_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `quantity` decimal(10,2) NOT NULL DEFAULT '1.00',
  `unit` varchar(20) DEFAULT NULL,
  `is_checked` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`shopping_item_id`),
  KEY `idx_shopping_user_checked` (`user_id`,`is_checked`),
  CONSTRAINT `fk_shopping_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `chk_shopping_quantity` CHECK ((`quantity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shopping_list_items`
--

LOCK TABLES `shopping_list_items` WRITE;
/*!40000 ALTER TABLE `shopping_list_items` DISABLE KEYS */;
INSERT INTO `shopping_list_items` VALUES (1,1,'Garlic',1.00,NULL,0),(2,1,'Parmesan',1.00,NULL,1),(3,2,'Milk',1.00,'gal',0);
/*!40000 ALTER TABLE `shopping_list_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_dietary_preferences`
--

DROP TABLE IF EXISTS `user_dietary_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_dietary_preferences` (
  `user_id` int NOT NULL,
  `dietary_tag_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`dietary_tag_id`),
  KEY `fk_udp_tag` (`dietary_tag_id`),
  CONSTRAINT `fk_udp_tag` FOREIGN KEY (`dietary_tag_id`) REFERENCES `dietary_tags` (`dietary_tag_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_udp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_dietary_preferences`
--

LOCK TABLES `user_dietary_preferences` WRITE;
/*!40000 ALTER TABLE `user_dietary_preferences` DISABLE KEYS */;
INSERT INTO `user_dietary_preferences` VALUES (2,2);
/*!40000 ALTER TABLE `user_dietary_preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `display_name` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'demo@cookingnexus.local','FAKE_HASH_demo_only','Demo Cook','2026-11-07 01:01:13'),(2,'alex@cookingnexus.local','FAKE_HASH_demo_only','Alex','2026-11-07 01:01:13'),(3,'morgan@cookingnexus.local','FAKE_HASH_demo_only','Morgan','2026-11-07 01:01:13'),(4,'jordan@cookingnexus.local','FAKE_HASH_demo_only','Jordan','2026-11-07 01:01:13');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-07 13:00:16
