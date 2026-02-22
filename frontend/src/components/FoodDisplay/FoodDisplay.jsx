import React, { useContext, useState, useRef, useEffect } from 'react'
import './FoodDisplay.css'
import FoodItem from '../FoodItem/FoodItem'
import { StoreContext } from '../../Context/StoreContext'
import { assets } from '../../assets/assets'

// Étel megjelenítő komponens
const FoodDisplay = ({ category, setCategory }) => {

  const { food_list, searchTerm, setSearchTerm, t } = useContext(StoreContext);
  const [sortOption, setSortOption] = useState('default');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sortRef]);

  // Lista szűrése kategória és keresési kifejezés alapján
  const filteredList = food_list.filter((item) => {
    let matchesCategory = false;
    if (category === 'All') {
      matchesCategory = true;
    } else if (category === 'Ételek') {
      matchesCategory = item.category !== 'Italok' && item.category !== 'Snackek';
    } else {
      matchesCategory = category === item.category;
    }
    const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Szűrt lista rendezése a kiválasztott szempont alapján
  const sortedList = [...filteredList].sort((a, b) => {
    switch (sortOption) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'rating-desc': return b.rating - a.rating;
      case 'name-asc': return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  return (
    <div className='food-display section animate-fade-up' id='food-display'>
      {/* Fejléc: cím és keresőmező, valamint szűrők */}
      <div className='food-display-header'>
        <h2>{t('food.title')}</h2>

        <div className="food-display-controls">
          <div className='food-search-wrapper'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="search-icon-svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              id='food-search-input'
              className='food-search-input'
              type='text'
              placeholder={t('food.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="food-sort-dropdown" ref={sortRef}>
              <div className="sort-trigger" onClick={() => setIsSortOpen(!isSortOpen)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="sort-icon-svg">
                  <path d="M3 18v-2h6v2H3zm0-5v-2h12v2H3zm0-5V6h18v2H3z" />
                </svg>
              </div>

              {isSortOpen && (
                <ul className="custom-sort-menu">
                  <li className="sort-header">{t('food.sort.default')}</li>
                  <li className={sortOption === 'price-asc' ? 'active' : ''} onClick={() => { setSortOption('price-asc'); setIsSortOpen(false); }}>{t('food.sort.price_asc')}</li>
                  <li className={sortOption === 'price-desc' ? 'active' : ''} onClick={() => { setSortOption('price-desc'); setIsSortOpen(false); }}>{t('food.sort.price_desc')}</li>
                  <li className={sortOption === 'rating-desc' ? 'active' : ''} onClick={() => { setSortOption('rating-desc'); setIsSortOpen(false); }}>{t('food.sort.rating')}</li>
                  <li className={sortOption === 'name-asc' ? 'active' : ''} onClick={() => { setSortOption('name-asc'); setIsSortOpen(false); }}>{t('food.sort.name')}</li>
                </ul>
              )}
            </div>
          </div>

          <div className="food-filter-buttons">
            <button
              className={`filter-btn ${category === 'All' ? 'active' : ''}`}
              onClick={() => setCategory?.('All')}
            >
              {t('food.filter.all')}
            </button>
            <button
              className={`filter-btn ${category === 'Ételek' || (category !== 'All' && category !== 'Italok' && category !== 'Snackek') ? 'active' : ''}`}
              onClick={() => setCategory?.('Ételek')}
            >
              {t('food.filter.food')}
            </button>
            <button
              className={`filter-btn ${category === 'Italok' ? 'active' : ''}`}
              onClick={() => setCategory?.('Italok')}
            >
              {t('food.filter.drinks')}
            </button>
          </div>
        </div>
      </div>
      {/* Szurt etel lista megjelenitese */}
      <div className='food-display-list'>
        {sortedList.map((item) => (
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
