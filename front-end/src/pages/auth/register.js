import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../servicecall/api';
import { toast } from 'react-toastify';

export const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: '',
        residencyNumber: '',
        designation: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: value
            };

            if (name === 'role') {
                newData.residencyNumber = '';
                newData.designation = '';
            }

            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);

        try {
            const submitData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
                role: formData.role === 'GUEST' ? 'ROLE_GUEST' : 'ROLE_RESIDENT'
            };

            if (formData.role === 'GUEST') {
                submitData.designation = formData.designation;
            } else if (formData.role === 'RESIDENT') {
                submitData.residencyNumber = formData.residencyNumber;
            }

            const response = await register(submitData);

            toast.success('Registration successful! Please login to continue.', {
                toastId: 'register-success',
                autoClose: 3000
            });
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 1000);

        } catch (err) {
            if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                err.response.data.errors.forEach((error, index) => {
                    setTimeout(() => {
                        toast.error(error, {
                            toastId: `register-error-${index}`,
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true
                        });
                    }, index * 1200);
                });
            } else {
                const errorMessage = err.response?.data?.message ||
                    err.response?.data?.error ||
                    'An error occurred during registration';

                toast.error(errorMessage, {
                    toastId: 'register-error',
                    autoClose: 5000
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const isFormValid = () => {
        const baseFieldsValid = formData.firstName &&
            formData.lastName &&
            formData.email &&
            formData.password &&
            formData.phoneNumber &&
            formData.role;

        if (!baseFieldsValid) return false;

        if (formData.role === 'GUEST') {
            return formData.designation;
        } else if (formData.role === 'RESIDENT') {
            return formData.residencyNumber;
        }

        return false;
    };

    return (
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden fixed left-0 top-0 bottom-0">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 h-full">
                    <div className="w-64 h-64 bg-white bg-opacity-10 rounded-full flex items-center justify-center mb-8 backdrop-blur-sm">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 text-center">Join Us Today</h1>
                    <p className="text-xl text-center opacity-90 max-w-md">
                        Create your account to start managing your residency
                    </p>
                </div>

                <div className="absolute top-10 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full"></div>
                <div className="absolute bottom-20 right-20 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
                <div className="absolute top-1/3 right-10 w-12 h-12 bg-white bg-opacity-10 rounded-full"></div>
            </div>

            <div className="w-full lg:w-1/2 lg:ml-auto bg-white">
                <div className="h-screen overflow-y-auto">
                    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
                        <div className="mx-auto w-full max-w-md">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                                <p className="text-sm text-gray-600">Fill in your information to get started</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="Enter your first name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="Enter your last name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            disabled={isLoading}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                                        >
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                {showPassword ? (
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                                    />
                                                ) : (
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-12.542 0c1.274-4.057 5.064-7 9.542-7 4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                )}
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        required
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                        Role
                                    </label>
                                    <select
                                        id="role"
                                        name="role"
                                        required
                                        value={formData.role}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Select your role</option>
                                        <option value="GUEST">Guest</option>
                                        <option value="RESIDENT">Resident</option>
                                    </select>
                                </div>

                                {formData.role === 'GUEST' && (
                                    <div>
                                        <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-2">
                                            Designation
                                        </label>
                                        <input
                                            id="designation"
                                            name="designation"
                                            type="text"
                                            required
                                            value={formData.designation}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            placeholder="Enter your designation"
                                        />
                                    </div>
                                )}

                                {formData.role === 'RESIDENT' && (
                                    <div>
                                        <label htmlFor="residencyNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                            Residency Number
                                        </label>
                                        <input
                                            id="residencyNumber"
                                            name="residencyNumber"
                                            type="text"
                                            required
                                            value={formData.residencyNumber}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            placeholder="Enter your residency number"
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading || !isFormValid()}
                                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating Account...
                                        </div>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </form>

                            <p className="mt-6 text-center text-sm text-gray-600">
                                Already have an account?{' '}
                                <a href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition duration-200">
                                    Sign in
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};