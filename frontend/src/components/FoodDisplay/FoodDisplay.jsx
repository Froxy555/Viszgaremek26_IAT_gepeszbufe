import React, { useContext } from 'react'
import './FoodDisplay.css'
import FoodItem from '../FoodItem/FoodItem'
import { StoreContext } from '../../Context/StoreContext'

// Étel megjelenítő komponens
const FoodDisplay = ({ category }) => {

  const { food_list, searchTerm, setSearchTerm } = useContext(StoreContext);

  // Lista szűrése kategória és keresési kifejezés alapján
  const filteredList = food_list.filter((item) => {
    const matchesCategory = category === 'All' || category === item.category;
    const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className='food-display section animate-fade-up' id='food-display'>
      {/* Fejlé: cím és keresőmező */}
      <div className='food-display-header'>
        <h2>Menü</h2>
        <input
          id='food-search-input'
          className='food-search-input'
          type='text'
          placeholder='Keresés az ételek között...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {/* Szurt etel lista megjelenitese */}
      <div className='food-display-list'>
        {filteredList.map((item) => (
          <FoodItem
            key={item._id}
            image={item.image}
            name={item.name}
            desc={item.description}
            price={item.price}
            id={item._id}
            category={item.category}
            available={item.available}
            rating={item.rating}
          />
        ))}
      </div>
    </div>
  )
}

export default FoodDisplay
