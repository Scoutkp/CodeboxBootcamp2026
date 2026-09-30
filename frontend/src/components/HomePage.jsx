import { useEffect, useState } from 'react';
import { clearStoredUser, getStoredUser } from '../auth/session';
import RecipeCard from './RecipeCard';

const emptyRecipe = { title: '', ingredients: '', instructions: '' };

export default function HomePage() {
  const user = getStoredUser();
  const isLoggedIn = Boolean(user);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newRecipeId, setNewRecipeId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      window.location.replace('/login');
      return;
    }
    fetch(`/api/users/${user.id}/recipes`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load your recipes.');
        return response.json();
      })
      .then(setRecipes)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [isLoggedIn, user?.id]);

  function signOut() {
    clearStoredUser();
    window.location.replace('/login');
  }

  async function addRecipe() {
    setError('');
    const response = await fetch(`/api/users/${user.id}/recipes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(emptyRecipe) });
    if (!response.ok) { setError('Could not add a recipe.'); return; }
    const recipe = await response.json();
    setRecipes((current) => [...current, recipe]);
    setNewRecipeId(recipe.id);
  }

  async function saveRecipe(id, recipe) {
    const response = await fetch(`/api/users/${user.id}/recipes/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(recipe) });
    if (!response.ok) { setError('Could not save that recipe.'); return; }
    const saved = await response.json();
    setRecipes((current) => current.map((item) => item.id === id ? saved : item));
  }

  async function deleteRecipe(recipe) {
    const name = recipe.title.trim() || 'this recipe';
    if (!window.confirm(`Delete ${name}?`)) return;
    const response = await fetch(`/api/users/${user.id}/recipes/${recipe.id}`, { method: 'DELETE' });
    if (!response.ok) { setError('Could not delete that recipe.'); return; }
    setRecipes((current) => current.filter((item) => item.id !== recipe.id));
  }

  useEffect(() => {
    if (!isLoggedIn) {
      window.location.replace('/login');
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;

  return (
    <main className="recipe-page">
      <header className="recipe-header">
        <div>
          <p className="eyebrow">CodeBox Kitchen</p>
          <h1>Your Recipes</h1>
          <p className="welcome">Welcome, {user.name}.</p>
        </div>
        <button className="sign-out-button" type="button" onClick={signOut}>Sign out</button>
      </header>
      {error && <p className="recipe-error" role="alert">{error}</p>}
      {loading ? <p className="recipe-status">Loading your recipes...</p> : (
        <section className="recipe-grid" aria-label="Your recipes">
          {recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} onSave={saveRecipe} onDelete={deleteRecipe} autoFocus={recipe.id === newRecipeId} />)}
          <button className="add-recipe-card" type="button" onClick={addRecipe}><span aria-hidden="true">+</span><strong>Add Recipe</strong></button>
        </section>
      )}
    </main>
  );
}
