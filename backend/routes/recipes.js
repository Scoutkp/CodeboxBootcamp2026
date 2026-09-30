const express = require('express');
const recipeService = require('../services/recipeService');
const userService = require('../services/userService');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

async function getUserId(req, res) {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId) || userId < 1) {
    res.status(400).json({ error: 'Invalid user ID' });
    return null;
  }
  if (req.user.id !== userId) {
    res.status(403).json({ error: 'You cannot access another user\'s recipes' });
    return null;
  }
  if (!await userService.findUserById(userId)) {
    res.status(404).json({ error: 'User not found' });
    return null;
  }
  return userId;
}

async function listRecipes(req, res, next) {
  try {
    const userId = await getUserId(req, res);
    if (userId === null) return;
    res.status(200).json(await recipeService.listRecipesForUser(userId));
  } catch (error) { next(error); }
}

async function addRecipe(req, res, next) {
  try {
    const userId = await getUserId(req, res);
    if (userId === null) return;
    const validationError = recipeService.validateRecipeInput(req.body);
    if (validationError) return res.status(400).json({ error: validationError });
    res.status(201).json(await recipeService.createRecipe(userId, req.body || {}));
  } catch (error) { next(error); }
}

async function editRecipe(req, res, next) {
  try {
    const recipeId = Number(req.params.recipeId);
    if (!Number.isInteger(recipeId) || recipeId < 1) return res.status(400).json({ error: 'Invalid recipe ID' });
    const userId = await getUserId(req, res);
    if (userId === null) return;
    const validationError = recipeService.validateRecipeInput(req.body);
    if (validationError) return res.status(400).json({ error: validationError });
    const recipe = await recipeService.updateRecipe(userId, recipeId, req.body || {});
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.status(200).json(recipe);
  } catch (error) { next(error); }
}

async function removeRecipe(req, res, next) {
  try {
    const recipeId = Number(req.params.recipeId);
    if (!Number.isInteger(recipeId) || recipeId < 1) return res.status(400).json({ error: 'Invalid recipe ID' });
    const userId = await getUserId(req, res);
    if (userId === null) return;
    const removed = await recipeService.deleteRecipe(userId, recipeId);
    if (!removed) return res.status(404).json({ error: 'Recipe not found' });
    res.status(200).json({ message: 'Recipe deleted' });
  } catch (error) { next(error); }
}

router.use(authenticate);
router.get('/users/:userId/recipes', listRecipes);
router.post('/users/:userId/recipes', addRecipe);
router.patch('/users/:userId/recipes/:recipeId', editRecipe);
router.delete('/users/:userId/recipes/:recipeId', removeRecipe);

module.exports = router;
