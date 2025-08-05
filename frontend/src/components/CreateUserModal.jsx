// components/CreateUserModal.jsx
import React, { useState } from 'react';

const CreateUserModal = ({ onClose, onUserCreated }) => {
    const [form, setForm] = useState({
        username: '',
        phone: '',
        totalInstallment: '',
        paidInstallment: '',
        monthlyAmount: '',
        planDetails: '',
        nominee: '',
        address: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/users", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            onUserCreated();
            onClose();
        } catch (err) {
            alert("Error creating user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-5 rounded-lg w-[90%] max-w-md space-y-3"
            >
                <h3 className="text-lg font-bold text-center">Create New User</h3>
                {Object.keys(form).map((key) => (
                    <input
                        key={key}
                        name={key}
                        placeholder={key}
                        value={form[key]}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                ))}
                <div className="flex justify-between mt-3">
                    <button type="button" className="text-gray-500" onClick={onClose}>Cancel</button>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateUserModal;
