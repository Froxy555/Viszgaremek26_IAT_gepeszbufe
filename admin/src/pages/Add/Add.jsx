import React, { useState } from 'react'
import './Add.css'
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const Add = ({ url }) => {


    const [image, setImage] = useState(false);
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: "Hamburger",
        rating: 5
    });

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (!image) {
            toast.error('Nincs kép kiválasztva');
            return null;
        }

        if (Number(data.price) < 0) {
            toast.error('Az ár nem lehet negatív');
            return null;
        }

        if (Number(data.rating) < 0 || Number(data.rating) > 5) {
            toast.error('Az értékelés 0 és 5 között lehet');
            return null;
        }

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", Number(data.price));
        formData.append("category", data.category);
        formData.append("rating", Number(data.rating));
        formData.append("image", image);
        const response = await axios.post(`${url}/api/food/add`, formData);
        if (response.data.success) {
            toast.success(response.data.message)
            setData({
                name: "",
                description: "",
                price: "",
                category: data.category
            })
            setImage(false);
        }
        else {
            toast.error(response.data.message)
        }
    }

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    return (
        <div className='add'>
            <form className='flex-col' onSubmit={onSubmitHandler}>
                <div className='add-img-upload flex-col'>
                    <p>Kép feltöltése</p>
                    <input onChange={(e) => { setImage(e.target.files[0]); e.target.value = '' }} type="file" accept="image/*" id="image" hidden />
                    <label htmlFor="image">
                        <img src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="" />
                    </label>
                </div>
                <div className='add-product-name flex-col'>
                    <p>Termék neve</p>
                    <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Megnevezés' required />
                </div>
                <div className='add-product-description flex-col'>
                    <p>Termék leírása</p>
                    <textarea name='description' onChange={onChangeHandler} value={data.description} type="text" rows={6} placeholder='Termék jellemzői' required />
                </div>
                <div className='add-category-price'>
                    <div className='add-category flex-col'>
                        <p>Termék fajtája</p>
                        <select name='category' onChange={onChangeHandler} >
                            <option value="Hamburger">Hamburger</option>
                            <option value="Gyros">Gyros</option>
                            <option value="Pizza">Pizza</option>
                            <option value="Piritos">Piritos</option>
                            <option value="Italok">Italok</option>
                            <option value="Snackek">Snackek</option>


                        </select>
                    </div>
                    <div className='add-price flex-col'>
                        <p>Termék ára</p>
                        <input type="Number" name='price' onChange={onChangeHandler} value={data.price} placeholder=' x Ft' min="0" />
                    </div>
                    <div className='add-rating flex-col'>
                        <p>Értékelés (0-5)</p>
                        <input type="Number" name='rating' onChange={onChangeHandler} value={data.rating} placeholder='5' min="0" max="5" />
                    </div>
                </div>
                <button type='submit' className='add-btn' >HOZZÁADÁS</button>
            </form>
        </div>
    )
}

export default Add
