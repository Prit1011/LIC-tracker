// components/Installments.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Installments = () => {
    const { id } = useParams();
    const [installments, setInstallments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    useEffect(() => {
        const fetchInstallments = async () => {
            try {
                const res = await fetch(`http://localhost:5000/users/${id}`);
                const data = await res.json();
                setInstallments(data.installments || []);
            } catch (error) {
                setErr("Could not load installments");
            } finally {
                setLoading(false);
            }
        };
        fetchInstallments();
    }, [id]);

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (err) return <div className="text-center text-red-600">{err}</div>;

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Installments</h2>
            {installments.length === 0 ? (
                <p className="text-center text-gray-500">No installment history found.</p>
            ) : (
                <div className="space-y-3">
                    {installments.map((ins, index) => (
                        <div key={index} className="flex justify-between bg-white p-3 rounded shadow">
                            <span>{ins.month}</span>
                            <span className={ins.paid ? "text-green-600" : "text-red-600"}>
                                ₹{ins.amount} - {ins.paid ? "Paid" : "Unpaid"}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Installments;
