import logo from './logo.png'
import add_icon from './add_icon.png'
import order_icon from './order_icon.png'
import profile_image from './profile_image.png'
import upload_area from './upload_area.png'
import parcel_icon from './parcel_icon.png'
import profile_icon from './profile_icon.png'
import user_icon from './user_icon.svg'

export const url = import.meta.env.PROD ? 'https://gepeszbufe-backend.onrender.com' : 'http://localhost:4000'
export const currency = 'Ft'

export const assets = {
    logo,
    add_icon,
    order_icon,
    profile_image,
    profile_icon,
    user_icon,
    upload_area,
    parcel_icon
}
