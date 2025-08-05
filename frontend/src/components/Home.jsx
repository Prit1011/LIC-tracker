import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Home = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        try {
            const res = await axios.get("http://localhost:5000/users");
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            setError("❌ Failed to fetch users. Please try again later.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-4 pb-24">
            <h1 className="text-2xl font-bold text-center mb-6 text-blue-700">
                LIC Tracker Dashboard
            </h1>

            {/* 🔄 Loading Spinner */}
            {loading && (
                <div className="flex justify-center items-center mt-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
                </div>
            )}

            {/* ❌ Error Message */}
            {!loading && error && (
                <div className="text-center text-red-500 mt-10 font-semibold">
                    {error}
                </div>
            )}

            {/* 😔 No Data Found */}
            {!loading && !error && users.length === 0 && (
                <div className="text-center text-gray-500 mt-10 font-semibold">
                    🙏 Sorry, no LIC records found.
                </div>
            )}

            {/* ✅ User List */}
            {!loading && !error && users.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {users.map((user) => {
                        const paid = user.installments?.filter(i => i.status === "Paid").length || 0;
                        return (
                            <Link
                                to={`/user/${user._id}`}
                                key={user._id}
                                className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition-all duration-300"
                            >
                                <p className="text-lg font-semibold text-gray-800">{user.name}</p>
                                <p className="text-sm text-gray-500">📱 {user.mobileNumber}</p>
                                <div className="mt-2 text-sm space-y-1">
                                    <p>💰 Monthly: ₹{user.monthlyAmount}</p>
                                    <p>✅ Paid: {paid} / {user.totalInstallments}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}


        </div>
    );
};

export default Home;
