import {useForm} from "@inertiajs/react"
import {Mail, Lock, Loader2, Eye, EyeOff} from "lucide-react"
import {useState} from "react"

export default function Auth({appName = "SwapEx"}) {
    const [showPassword, setShowPassword] = useState(false)

    const loginForm = useForm({
        email: '',
        password: '',
        remember: false
    })

    const handleLogin = (e) => {
        e.preventDefault()
        loginForm.post('/admin/login', {
            onSuccess: () => loginForm.reset('password')
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-[#1F2937] mb-2">{appName}</h1>
                    <p className="text-gray-600">Secure Authentication</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                        <p className="text-gray-600 text-sm">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                                <input
                                    type="email"
                                    value={loginForm.data.email}
                                    onChange={e => loginForm.setData('email', e.target.value)}
                                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                                        loginForm.errors.email ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent`}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            {loginForm.errors.email && (
                                <p className="text-red-500 text-sm mt-1">{loginForm.errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={loginForm.data.password}
                                    onChange={e => loginForm.setData('password', e.target.value)}
                                    className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                                        loginForm.errors.password ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent`}
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                                </button>
                            </div>
                            {loginForm.errors.password && (
                                <p className="text-red-500 text-sm mt-1">{loginForm.errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={loginForm.data.remember}
                                    onChange={e => loginForm.setData('remember', e.target.checked)}
                                    className="w-4 h-4 text-[#1F2937] border-gray-300 rounded focus:ring-[#1F2937]"
                                />
                                <span className="ml-2 text-sm text-gray-600">Remember me</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loginForm.processing}
                            className="w-full bg-gradient-to-r from-[#1F2937] to-[#1F2937] hover:from-[#1F2937] hover:to-[#1F2937] text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loginForm.processing ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin"/>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    © 2026 {appName}. All rights reserved.
                </p>
            </div>
        </div>
    )
}
