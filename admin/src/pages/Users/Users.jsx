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
            toast.error("Hiba")
        }
    }

    useEffect(() => {
        fetchUsers();
    }, [])

    return (
        <div className='users add flex-col'>
            <p>Felhasználók</p>
            <div className="users-table">
                <div className="users-table-format title">
                    <b>Avatar</b>
                    <b>Név</b>
                    <b>Email</b>
                    <b>Telefon</b>
                    <b>Azonosító</b>
                </div>
                {users.map((item, index) => {
                    return (
                        <div key={index} className='users-table-format'>
                            <img src={item.avatarUrl || '/profile_icon.png'} alt="" className="user-avatar" />
                            <p>{item.name}</p>
                            <p>{item.email}</p>
                            <p>{item.phone || "-"}</p>
                            <p className='small-id'>{item._id}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Users
