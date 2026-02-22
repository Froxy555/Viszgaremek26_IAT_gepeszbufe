import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import { useLocation } from 'react-router-dom';

const Home = () => {
  // Étel kategória állapot
  const [category, setCategory] = useState('All');
  const location = useLocation();

  // Görgetés a szekciókhoz URL paraméter alapján
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (section === 'menu') {
      const el = document.getElementById('explore-menu');
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    } else if (section === 'contact') {
      const el = document.getElementById('footer');
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [location.search]);

  return (
    <>
      <Header />
      <ExploreMenu setCategory={setCategory} category={category} />
      <FoodDisplay category={category} setCategory={setCategory} />
    </>
  );
};

export default Home;
