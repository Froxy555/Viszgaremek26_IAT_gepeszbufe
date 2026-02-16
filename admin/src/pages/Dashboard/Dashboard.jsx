import React, { useState, useEffect } from 'react'
import './Dashboard.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = ({ url }) => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${url}/api/order/stats`)
            if (response.data.success) {
                setStats(response.data)
            } else {
                toast.error("Hiba a statisztikák betöltésekor")
            }
        } catch (error) {
            console.error(error)
            toast.error("Szerver hiba")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    if (loading) return <div className="loader">Betöltés...</div>
    if (!stats) return <div className="error">Nincs adat</div>

    const lineData = {
        labels: stats.salesData.labels,
        datasets: [
            {
                label: 'Bevétel (Ft)',
                data: stats.salesData.data,
                borderColor: '#ff6347',
                backgroundColor: 'rgba(255, 99, 71, 0.2)',
                tension: 0.4,
            },
        ],
    };

    const productData = {
        labels: stats.topProducts.map(p => p.name),
        datasets: [
            {
                label: 'Eladott darabszám',
                data: stats.topProducts.map(p => p.count),
                backgroundColor: [
                    '#ff6347',
                    '#4bc0c0',
                    '#ffce56',
                    '#36a2eb',
                    '#9966ff',
                ],
            },
        ],
    };

    return (
        <div className='dashboard flex-col'>
            <h2>Admin Dashboard</h2>

            <div className="stats-cards">
                <div className="card">
                    <h3>Összes bevétel</h3>
                    <p className="amount">{stats.totalRevenue.toLocaleString()} Ft</p>
                </div>
                <div className="card">
                    <h3>Rendelések száma</h3>
                    <p className="count">{stats.totalOrders} db</p>
                </div>
                <div className="card">
                    <h3>Beszerzett termékek</h3>
                    <p className="count">{stats.topProducts.length} aktív top termék</p>
                </div>
            </div>

            <div className="charts-container">
                <div className="chart-box">
                    <h3>Bevétel az elmúlt 7 napban</h3>
                    <Line data={lineData} />
                </div>
                <div className="chart-box">
                    <h3>Népszerű termékek</h3>
                    <Bar data={productData} />
                </div>
            </div>
        </div>
    )
}

export default Dashboard
