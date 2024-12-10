import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Keyboard } from 'react';
export const GlobalContext = createContext(null);

export default function GlobalState({ children }) {
  const [searchParam, setSearchParam] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipeList, setRecipeList] = useState([]);
  const [recipeDetailsData, setRecipeDetailsData] = useState(null);
  const storedFavorites = localStorage.getItem("favoritesList");
  const [favoritesList, setFavoritesList] = useState(() => {
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (storedFavorites) {
      console.log("Loaded from localStorage:", storedFavorites);
      setFavoritesList(JSON.parse(storedFavorites));
    }
  }, [storedFavorites]); 

  // Save favoritesList to localStorage whenever it changes
  useEffect(() => {
    console.log("Saving to localStorage:");
    localStorage.setItem("favoritesList", JSON.stringify(favoritesList));
  }, [favoritesList]);

  // Handle adding/removing favorites
  function handleAddToFavorite(getCurrentItem) {
    let cpyFavoritesList = [...favoritesList];
    const index = cpyFavoritesList.findIndex(item => item.id === getCurrentItem.id);

    if (index === -1) {
      // Add to favorites
      cpyFavoritesList.push(getCurrentItem);
    } else {
      // Remove from favorites
      cpyFavoritesList.splice(index, 1);
    }

    setFavoritesList(cpyFavoritesList);  // Update the favorites list
  }

  // Define handleSubmit for searching recipes (assuming it's needed)
  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`https://forkify-api.herokuapp.com/api/v2/recipes?search=${searchParam}`);
      const data = await response.json();
      if (data?.data?.recipes) {
        setRecipeList(data.data.recipes);
        setLoading(false);
        Keyboard.dismiss(); // Dismiss the keyboard
        navigate('/');
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setLoading(false);
    }
  }

  return (
    <GlobalContext.Provider
      value={{
        searchParam,
        loading,
        recipeList,
        setSearchParam,
        handleSubmit,
        recipeDetailsData,
        setRecipeDetailsData,
        handleAddToFavorite,
        favoritesList,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
