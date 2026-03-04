import { useForm } from "@inertiajs/react"
import { useState, useEffect } from "react"
import { Eye, EyeOff, Loader2, MessageSquare, Zap, Shield, BarChart3 } from "lucide-react"

const features = [
    { icon: MessageSquare, label: "Bulk Messaging",  desc: "WhatsApp & Telegram campaigns" },
    { icon: Zap,           label: "AI-Powered",      desc: "Smart message generation" },
    { icon: BarChart3,     label: "Analytics",        desc: "Real-time campaign insights" },
    { icon: Shield,        label: "Secure",           desc: "Enterprise-grade security" },
]

export default function Login({ appName = "BlastBot" }) {
    const [showPassword, setShowPassword] = useState(false)
    const [mounted, setMounted]           = useState(false)

    useEffect(() => { setMounted(true) }, [])

    const form = useForm({ email: "", password: "", remember: false })

    const handleSubmit = (e) => {
        e.preventDefault()
        form.post("/admin/login", { onSuccess: () => form.reset("password") })
    }

    return (
        <div className="min-h-screen flex bg-zinc-950">

            {/* ── Left panel (dark branding) ── */}
            <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">

                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
                <div className="absolute inset-0 opacity-30"
                     style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #22c55e22 0%, transparent 60%), radial-gradient(circle at 80% 20%, #16a34a18 0%, transparent 50%)" }} />
                <div className="absolute inset-0 opacity-[0.04]"
                     style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
                     style={{ background: "radial-gradient(circle, #22c55e, transparent 70%)" }} />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <MessageSquare className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">{appName}</span>
                </div>

                {/* Headline + features */}
                <div className="relative z-10 space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-medium text-emerald-400 tracking-wider uppercase">AI-Powered Messaging</span>
                        </div>
                        <h1 className="text-5xl font-bold text-white leading-[1.1] tracking-tight">
                            Reach thousands<br />
                            <span className="text-emerald-400">in seconds.</span>
                        </h1>
                        <p className="text-zinc-400 text-lg leading-relaxed max-w-sm">
                            The complete WhatsApp & Telegram broadcast platform with AI-driven campaign intelligence.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {features.map(({ icon: Icon, label, desc }) => (
                            <div key={label} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <Icon className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{label}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Demo banner */}
                <div className="relative z-10">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
                        <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-amber-400 text-xs font-bold">i</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-amber-400 mb-1">Demo Access</p>
                            <p className="text-xs text-zinc-400">
                                Email: <span className="text-zinc-200 font-mono">admin@blastbot.io</span>
                                <span className="mx-2 text-zinc-600">·</span>
                                Password: <span className="text-zinc-200 font-mono">password</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right panel (clean white design) ── */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white relative">

                {/* Subtle left border on desktop */}
                <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-zinc-200" />

                <div className={`w-full max-w-sm transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2 mb-10">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-lg font-bold text-zinc-900">{appName}</span>
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Welcome back</h2>
                        <p className="text-zinc-500 mt-1.5 text-sm">Sign in to your admin panel</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-zinc-600 uppercase tracking-wider block">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={form.data.email}
                                onChange={e => form.setData("email", e.target.value)}
                                placeholder="admin@blastbot.io"
                                autoComplete="email"
                                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-zinc-900 placeholder-zinc-400 bg-white transition-all outline-none
                        ${form.errors.email
                                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                    : "border-zinc-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                }`}
                            />
                            {form.errors.email && (
                                <p className="text-xs text-red-500 mt-1">{form.errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-zinc-600 uppercase tracking-wider block">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={form.data.password}
                                    onChange={e => form.setData("password", e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className={`w-full px-4 py-2.5 pr-11 rounded-lg border text-sm text-zinc-900 placeholder-zinc-400 bg-white transition-all outline-none
                            ${form.errors.password
                                        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                        : "border-zinc-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {form.errors.password && (
                                <p className="text-xs text-red-500 mt-1">{form.errors.password}</p>
                            )}
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center">
                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <div className="relative w-4 h-4">
                                    <input
                                        type="checkbox"
                                        checked={form.data.remember}
                                        onChange={e => form.setData("remember", e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-4 h-4 rounded border border-zinc-300 bg-white peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center">
                                        {form.data.remember && (
                                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm text-zinc-600 group-hover:text-zinc-800 transition-colors select-none">
                        Remember me
                    </span>
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {form.processing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>

                    </form>

                    {/* Mobile demo credentials */}
                    <div className="lg:hidden mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
                        <p className="text-xs font-semibold text-amber-600 mb-1">Demo Credentials</p>
                        <p className="text-xs text-zinc-600">
                            <span className="font-mono text-zinc-800">admin@blastbot.io</span>
                            <span className="mx-2">·</span>
                            <span className="font-mono text-zinc-800">password</span>
                        </p>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-zinc-400 mt-10">
                        © {new Date().getFullYear()} {appName}. All rights reserved.
                    </p>

                </div>
            </div>
        </div>
    )
}
