import { addDays } from '../lib/utils.js';

export const DEMO_USER = { id: 'demo-user', display_name: 'Demo Cook', email: 'demo@cookingnexus.local', dietary_preferences: [] };

export const SEED_PANTRY = [
  { id: 'pi-1', user_id: DEMO_USER.id, name: 'Rice', quantity: 2, unit: 'lb', expiration_date: null },
  { id: 'pi-2', user_id: DEMO_USER.id, name: 'Chicken', quantity: 1.5, unit: 'lb', expiration_date: addDays(2) },
  { id: 'pi-3', user_id: DEMO_USER.id, name: 'Yogurt', quantity: 4, unit: 'cups', expiration_date: addDays(-1) },
  { id: 'pi-4', user_id: DEMO_USER.id, name: 'Carrots', quantity: 6, unit: 'whole', expiration_date: addDays(8) },
  { id: 'pi-5', user_id: DEMO_USER.id, name: 'Tomatoes', quantity: 5, unit: 'whole', expiration_date: addDays(4) },
  { id: 'pi-6', user_id: DEMO_USER.id, name: 'Spinach', quantity: 1, unit: 'bag', expiration_date: addDays(3) },
  { id: 'pi-7', user_id: DEMO_USER.id, name: 'Milk', quantity: 1, unit: 'gal', expiration_date: addDays(5) }
];

// These records are *illustrative*. They are NOT retrieved from installed cookbooks
// and are NOT results from a functioning LLM. Replace them via POST /recipes/discover.
export const SEED_RECIPES = [
  { id: 'r-1', title: 'Tomato Spinach Pasta', description: 'A quick skillet pasta with wilted spinach and juicy tomatoes.', image_url: '/images/pasta.jpg', source_type: 'sample', source_label: 'Sample recipe • Demo only', prep_time_minutes: 25, cost_band: 'low', dietary_tags: ['Vegetarian'], ingredients: [{name:'Spinach'}, {name:'Tomatoes'}, {name:'Pasta'}, {name:'Parmesan'}, {name:'Garlic'}], instructions: ['Cook pasta according to package directions.', 'Sauté garlic and tomatoes in olive oil.', 'Add spinach until wilted.', 'Toss with drained pasta and parmesan.'] },
  { id: 'r-2', title: 'Vegetable Fried Rice', description: 'A great use for leftover rice and mixed vegetables.', image_url: '/images/fried-rice.jpg', source_type: 'sample', source_label: 'Sample recipe • Demo only', prep_time_minutes: 20, cost_band: 'low', dietary_tags: ['Vegetarian','Dairy-free'], ingredients: [{name:'Rice'}, {name:'Carrots'}, {name:'Peas'}, {name:'Onions'}, {name:'Soy Sauce'}], instructions: ['Sauté vegetables until tender.', 'Add cooked rice and stir-fry.', 'Season with soy sauce.'] },
  { id: 'r-3', title: 'Quick Lentil Soup', description: 'Comforting lentils, carrots, tomato and broth.', image_url: '/images/lentil-soup.jpg', source_type: 'sample', source_label: 'Sample recipe • Demo only', prep_time_minutes: 35, cost_band: 'low', dietary_tags: ['Vegetarian','Vegan','Gluten-free','Dairy-free'], ingredients: [{name:'Lentils'}, {name:'Carrots'}, {name:'Onions'}, {name:'Tomatoes'}, {name:'Vegetable Broth'}], instructions: ['Simmer lentils and vegetables in broth until tender.', 'Season and serve.'] },
  { id: 'r-4', title: 'Chickpea Coconut Curry', description: 'Creamy, flavorful curry with pantry-friendly ingredients.', image_url: '/images/curry.jpg', source_type: 'sample', source_label: 'Sample recipe • Demo only', prep_time_minutes: 30, cost_band: 'low', dietary_tags: ['Vegetarian','Vegan','Gluten-free','Dairy-free'], ingredients: [{name:'Chickpeas'}, {name:'Coconut Milk'}, {name:'Onions'}, {name:'Garlic'}, {name:'Curry Paste'}], instructions: ['Cook onions and garlic.', 'Add curry paste, chickpeas and coconut milk.', 'Simmer and season to taste.'] },
  { id: 'r-5', title: 'Black Bean Quesadillas', description: 'Crisp tortillas filled with black beans and cheese.', image_url: '/images/quesadillas.jpg', source_type: 'sample', source_label: 'Sample recipe • Demo only', prep_time_minutes: 15, cost_band: 'low', dietary_tags: ['Vegetarian'], ingredients: [{name:'Black Beans'}, {name:'Tortillas'}, {name:'Cheese'}, {name:'Onions'}, {name:'Bell Pepper'}], instructions: ['Fill tortillas with black beans and cheese.', 'Pan-toast on both sides until golden.'] },
  { id: 'r-6', title: 'Roasted Vegetable Sheet Pan', description: 'Easy roasted vegetables with crisp edges and herbs.', image_url: '/images/vegetables.jpg', source_type: 'sample', source_label: 'Sample recipe • Demo only', prep_time_minutes: 40, cost_band: 'low', dietary_tags: ['Vegetarian','Vegan','Gluten-free','Dairy-free'], ingredients: [{name:'Broccoli'}, {name:'Carrots'}, {name:'Potatoes'}, {name:'Onions'}, {name:'Olive Oil'}], instructions: ['Chop the vegetables.', 'Coat with oil and seasonings.', 'Roast at 425°F until tender.'] },
];

export const SEED_POSTS = [
  { id:'c-1', author_user_id:'seed-1', author_name:'Alex', title:'Spicy Chicken Rice', description:'Simple weeknight recipe with pantry staples.', image_url:'/images/chicken-rice.jpg', ingredients:[{name:'Chicken'}, {name:'Rice'}, {name:'Bell Pepper'}], prep_time_minutes:30, dietary_tags:[], is_published:true, like_user_ids:['seed-2','seed-3'], comments:[{id:'cm-1',user_id:'seed-2',author_name:'Jordan',body:'Looks great!'}] },
  { id:'c-2', author_user_id:'seed-2', author_name:'Morgan', title:'Quick Veggie Wrap', description:'Fast vegetarian lunch idea with flexible ingredients.', image_url:'/images/veggie-wrap.jpg', ingredients:[{name:'Tortilla'}, {name:'Lettuce'}, {name:'Carrots'}, {name:'Hummus'}], prep_time_minutes:15, dietary_tags:['Vegetarian'], is_published:true, like_user_ids:['seed-1'], comments:[] },
  { id:'c-3', author_user_id:'seed-3', author_name:'Jordan', title:'Garlic Potato Bowl', description:'Crispy potatoes with garlic and herb yogurt sauce.', image_url:'/images/potato-bowl.jpg', ingredients:[{name:'Potatoes'}, {name:'Garlic'}, {name:'Yogurt'}], prep_time_minutes:40, dietary_tags:['Vegetarian'], is_published:true, like_user_ids:['seed-1','seed-2'], comments:[] }
];

export function makeInitialStore() {
  return {
    users: [DEMO_USER], current_user_id: null,
    pantry: [...SEED_PANTRY],
    cookbook_recipes: [...SEED_RECIPES], community_recipes: [...SEED_POSTS],
    favorites: [], shopping: [],
  };
}
