import { useEffect, useRef, useState } from 'react';

const fields = [
  { key: 'ingredients', label: 'Ingredient list', placeholder: 'Add ingredients, one per line', rows: 4 },
  { key: 'instructions', label: 'How to make', placeholder: 'Write the steps for this recipe', rows: 6 },
];

export default function RecipeCard({ recipe, onSave, onDelete, autoFocus }) {
  const [draft, setDraft] = useState(recipe);
  const titleRef = useRef(null);
  const saveQueue = useRef(Promise.resolve());
  useEffect(() => setDraft(recipe), [recipe]);
  useEffect(() => { if (autoFocus) titleRef.current?.focus(); }, [autoFocus]);
  function changeField(field, value) { setDraft((current) => ({ ...current, [field]: value })); }
  function saveField(field) {
    if (draft[field] !== recipe[field]) {
      const snapshot = { ...draft, [field]: draft[field] };
      saveQueue.current = saveQueue.current.then(() => onSave(recipe.id, snapshot));
    }
  }
  return (
    <article className="recipe-card">
      <input ref={titleRef} className="recipe-title" value={draft.title} onChange={(event) => changeField('title', event.target.value)} onBlur={() => saveField('title')} placeholder="Name of recipe" aria-label="Recipe title" />
      {fields.map((field) => (
        <label className="recipe-field" key={field.key}>
          <span>{field.label}</span>
          <textarea rows={field.rows} value={draft[field.key]} onChange={(event) => changeField(field.key, event.target.value)} onBlur={() => saveField(field.key)} placeholder={field.placeholder} aria-label={field.label} />
        </label>
      ))}
      <button className="delete-button" type="button" onClick={() => onDelete(recipe)}>Delete</button>
    </article>
  );
}
