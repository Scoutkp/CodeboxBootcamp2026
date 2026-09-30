const pool = require('../db/pool');

const MAX_RECIPE_TEXT_LENGTH = 20000;

function validateRecipeInput(recipe) {
  if (!recipe || typeof recipe !== 'object' || Array.isArray(recipe)) return 'Recipe body must be an object';
  for (const field of ['title', 'ingredients', 'instructions']) {
    if (recipe[field] !== undefined && (typeof recipe[field] !== 'string' || recipe[field].length > MAX_RECIPE_TEXT_LENGTH)) {
      return `${field} must be a string under ${MAX_RECIPE_TEXT_LENGTH} characters`;
    }
  }
  return null;
}

function publicRecipe(recipe) {
  return {
    id: Number(recipe.id),
    userId: Number(recipe.user_id),
    title: recipe.title,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
  };
}

async function listRecipesForUser(userId) {
  const result = await pool.query(
    'select id, user_id, title, ingredients, instructions from public.recipes where user_id = $1 order by created_at, id',
    [Number(userId)],
  );
  return result.rows.map(publicRecipe);
}

async function createRecipe(userId, recipe) {
  const result = await pool.query(
    `insert into public.recipes (user_id, title, ingredients, instructions)
     values ($1, $2, $3, $4)
     returning id, user_id, title, ingredients, instructions`,
    [Number(userId), recipe.title ?? '', recipe.ingredients ?? '', recipe.instructions ?? ''],
  );
  return publicRecipe(result.rows[0]);
}

async function updateRecipe(userId, recipeId, recipe) {
  const result = await pool.query(
    `update public.recipes
     set title = $1, ingredients = $2, instructions = $3, updated_at = now()
     where id = $4 and user_id = $5
     returning id, user_id, title, ingredients, instructions`,
    [recipe.title ?? '', recipe.ingredients ?? '', recipe.instructions ?? '', Number(recipeId), Number(userId)],
  );
  return result.rows[0] ? publicRecipe(result.rows[0]) : null;
}

async function deleteRecipe(userId, recipeId) {
  const result = await pool.query(
    'delete from public.recipes where id = $1 and user_id = $2 returning id',
    [Number(recipeId), Number(userId)],
  );
  return result.rowCount > 0;
}

module.exports = { listRecipesForUser, createRecipe, updateRecipe, deleteRecipe, validateRecipeInput };
