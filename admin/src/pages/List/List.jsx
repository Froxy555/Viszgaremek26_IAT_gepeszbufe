import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './List.css'
import { currency } from '../../assets/assets'
import axios from 'axios';
import { toast } from 'react-toastify';

const List = ({ url }) => {

  const [list, setList] = useState([]);

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/food/list`)
    if (response.data.success) {
      setList(response.data.data);
    }
    else {
      toast.error("Error")
    }
  }

  const removeFood = async (foodId) => {
    const response = await axios.post(`${url}/api/food/remove`, {
      id: foodId
    })
    await fetchList();
    if (response.data.success) {
      toast.success(response.data.message);
    }
    else {
      toast.error("Error")
    }
  }

  useEffect(() => {
    fetchList();
  }, [])

  const navigate = useNavigate();

  return (
    <div className='list add flex-col'>
      <div className='list-table'>
        <div className="list-table-format title">
          <b>Kép</b>
          <b>Név</b>
          <b>Kategória</b>
          <b>Ár</b>
          <b>Szerk</b>
          <b>Törlés</b>
        </div>
        {list.map((item, index) => {
          return (
            <div key={index} className='list-table-format'>
              <img src={`${url}/images/` + item.image} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{item.price}{currency}</p>
              <p className='cursor' onClick={() => navigate('/edit', { state: { product: item } })}>✎</p>
              <p className='cursor' onClick={() => removeFood(item._id)}>x</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default List
