import React, { useEffect, useState } from 'react'
import './Edit.css'
import axios from "axios"
import { toast } from "react-toastify"
import { assets } from '../../assets/assets'
import { useLocation, useNavigate } from 'react-router-dom'

const Edit = ({ url }) => {

    const location = useLocation();
    const navigate = useNavigate();
    const product = location.state?.product;

    const [image, setImage] = useState(false);
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        available: true,
        rating: 5
    })

    useEffect(() => {
        if (product) {
            setData({
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                available: product.available !== undefined ? product.available : true,
                rating: product.rating !== undefined ? product.rating : 5
            });

        } else {
            toast.error("Nincs kiválasztott termék");
            navigate('/list');
        }
    }, [product, navigate]);

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (Number(data.price) < 0) {
            toast.error('Az ár nem lehet negatív');
            return null;
        }

        if (Number(data.rating) < 0 || Number(data.rating) > 5) {
            toast.error('Az értékelés 0 és 5 között lehet');
            return null;
        }

        const formData = new FormData();
        formData.append("id", product._id);
        formData.append("name", data.name)
        formData.append("description", data.description)
        formData.append("price", Number(data.price))
        formData.append("category", data.category)
        formData.append("available", data.available)
        formData.append("rating", Number(data.rating))

        if (image) {
            formData.append("image", image)
        }

        const response = await axios.post(`${url}/api/food/update`, formData);
        if (response.data.success) {
            toast.success(response.data.message)
            navigate('/list');
        }
        else {
            toast.error(response.data.message)
        }
    }

    return (
        <div className='add'>
            <form className='flex-col' onSubmit={onSubmitHandler}>
                <div className="add-img-upload flex-col">
                    <p>Kép módosítása (opcionális)</p>
                    <label htmlFor="image">
                        <img src={image ? URL.createObjectURL(image) : `${url}/images/${product?.image}`} alt="" />
                    </label>
                    <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
                </div>
                <div className="add-product-name flex-col">
                    <p>Termék neve</p>
                    <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='Type here' />
                </div>
                <div className="add-product-description flex-col">
                    <p>Termék leírása</p>
                    <textarea onChange={onChangeHandler} value={data.description} name="description" rows="6" placeholder='Write content here' required></textarea>
                </div>
                <div className="add-category-price">
                    <div className="add-category flex-col">
                        <p>Kategória</p>
                        <select onChange={onChangeHandler} name="category" value={data.category}>
                            <option value="Pizza">Pizza</option>
                            <option value="Hamburger">Hamburger</option>
                            <option value="Hot-dog">Hot-dog</option>
                            <option value="Szendvics">Szendvics</option>
                            <option value="Pékáru">Pékáru</option>
                            <option value="Italok">Italok</option>
                            <option value="Nasi">Nasi</option>
                            <option value="Édesség">Édesség</option>
                        </select>
                    </div>
                    <div className="add-price flex-col">
                        <p>Ár</p>
                        <input onChange={onChangeHandler} value={data.price} type="number" name='price' placeholder='2000 Ft' min="0" />
                    </div>
                    <div className="add-rating flex-col">
                        <p>Értékelés (0-5)</p>
                        <input onChange={onChangeHandler} value={data.rating} type="number" name='rating' placeholder='5' min="0" max="5" />
                    </div>
                </div>

                <div className="add-available flex-row">
                    <input
                        type="checkbox"
                        id="available"
                        name="available"
                        checked={data.available}
                        onChange={onChangeHandler}
                        style={{ width: '20px', height: '20px' }}
                    />
                    <label htmlFor="available" style={{ marginLeft: '10px', fontSize: '16px', cursor: 'pointer' }}>
                        Elérhető (Pipa: rendelhető, Üres: elfogyott)
                    </label>
                </div>

                <button type='submit' className='add-btn' >Mentés</button>
            </form>
        </div>
    )
}

export default Edit
