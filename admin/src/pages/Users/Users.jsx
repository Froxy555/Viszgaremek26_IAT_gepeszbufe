import React, { useEffect, useState } from 'react'
import './Users.css'
import axios from "axios"
import { toast } from "react-toastify"

const Users = ({ url }) => {

    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        const response = await axios.get(`${url}/api/user/list`);
        if (response.data.success) {
            setUsers(response.data.data)
        }
        else {
            toast.error("Hiba a felhasználók lekérésekor")
        }
    }

    const removeUser = async (userId) => {
        const response = await axios.post(`${url}/api/user/remove`, {
            id: userId
        })
        await fetchUsers();
        if (response.data.success) {
            toast.success(response.data.message);
        }
        else {
            toast.error(response.data.message || "Hiba történt a törlés során");
        }
    }

    useEffect(() => {
        fetchUsers();
    }, [])

    return (
        <div className='users add flex-col'>
            <h2 className="users-title">Admin Felhasználók</h2>
            <div className="users-table">
                <div className="users-table-format title">
                    <b>Kép</b>
                    <b>Név / Azonosító</b>
                    <b>Email</b>
                    <b>Telefon</b>
                    <b style={{ textAlign: "center" }}>Törlés</b>
                </div>
                {users.map((item, index) => {
                    return (
                        <div key={index} className='users-table-format'>
                            <img src={item.avatarUrl || '/profile_icon.png'} alt="user avatar" className="user-avatar" />
                            <div className="user-info-col">
                                <p className="user-name">{item.name}</p>
                                <p className='small-id' title={item._id}>ID: {item._id.substring(0, 8)}...</p>
                            </div>
                            <p className="user-email">{item.email}</p>
                            <p className="user-phone">{item.phone || "-"}</p>
                            <div className="action-col">
                                <div className='action-btn delete-btn cursor' onClick={() => removeUser(item._id)}>✕</div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Users
