import React, { useContext } from 'react'
import './ExploreMenu.css'
import { StoreContext } from '../../Context/StoreContext'

// menü böngészés sáv komponense
const ExploreMenu = ({ category, setCategory }) => {

  const { menu_list } = useContext(StoreContext);

  return (
    <div className='explore-menu section animate-fade-up' id='explore-menu'>
      <h1>Fedezd fel választékainkat</h1>
      <p className='explore-menu-text'>Válassz egy vagy több ételt a menünből, rendeld meg online és már szállítjuk is hozzád 😊</p>

      {/* kategória lista */}
      <div className="explore-menu-list">
        {menu_list.map((item, index) => {
          return (
            <div onClick={() => setCategory(prev => prev === item.menu_name ? "All" : item.menu_name)} key={index} className='explore-menu-list-item'>
              <img src={item.menu_image} className={category === item.menu_name ? "active" : ""} alt="" />
              <p>{item.menu_name}</p>
            </div>
          )
        })}
      </div>
      <hr />
    </div>
  )
}

export default ExploreMenu
