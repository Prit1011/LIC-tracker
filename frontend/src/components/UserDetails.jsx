// components/UserDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Loader = () => <div className="text-center py-10">Loading...</div>;
const ErrorMessage = ({ msg }) => <div className="text-red-600 text-center py-10">{msg}</div>;

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`http://localhost:5000/users/${id}`);
                if (!res.ok) throw new Error("User not found");
                const data = await res.json();
                setUser(data);
            } catch (error) {
                setErr(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    if (loading) return <Loader />;
    if (err) return <ErrorMessage msg={err} />;
    if (!user) return <ErrorMessage msg="User not found" />;

    return (
        <div className="p-4 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">{user.username}'s Details</h2>
            <div className="space-y-2 bg-white rounded-xl p-4 shadow">
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Total Installments:</strong> {user.totalInstallment}</p>
                <p><strong>Paid:</strong> {user.paidInstallment}</p>
                <p><strong>Monthly Amount:</strong> ₹{user.monthlyAmount}</p>
                <p><strong>Plan:</strong> {user.planDetails}</p>
                <p><strong>Nominee:</strong> {user.nominee}</p>
                <p><strong>Address:</strong> {user.address}</p>
            </div>

            <button
                className="fixed bottom-5 right-5 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700"
                onClick={() => navigate(`/installments/${id}`)}
            >
                ➕ Add Installment
            </button>
        </div>
    );
};

export default UserDetails;
