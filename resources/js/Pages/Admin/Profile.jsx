import React from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, useForm } from '@inertiajs/react';
import { User, Lock, Save, Loader2 } from 'lucide-react';

const Profile = ({ auth }) => {
    const profileForm = useForm({
        name:  auth.user.name  || '',
        email: auth.user.email || '',
    });

    const passwordForm = useForm({
        current_password:      '',
        password:              '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        profileForm.put(route('admin.profile.update'), { preserveScroll: true });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        passwordForm.put('/admin/profile/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    const inputClass = "w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600";
    const labelClass = "block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5";

    return (
        <Layout pageTitle="Profile" pageSection="Settings">
            <Head title="Profile" />

            <div className="max-w-2xl space-y-8 mx-auto">

                {/* Profile Info */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <User className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Personal Information</h2>
                            <p className="text-xs text-zinc-400">Update your name and email address</p>
                        </div>
                    </div>
                    <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
                        <div>
                            <label className={labelClass}>Name</label>
                            <input
                                type="text"
                                value={profileForm.data.name}
                                onChange={e => profileForm.setData('name', e.target.value)}
                                className={inputClass}
                                placeholder="Your full name"
                            />
                            {profileForm.errors.name && (
                                <p className="text-xs text-red-500 mt-1">{profileForm.errors.name}</p>
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>Email Address</label>
                            <input
                                type="email"
                                value={profileForm.data.email}
                                onChange={e => profileForm.setData('email', e.target.value)}
                                className={inputClass}
                                placeholder="your@email.com"
                            />
                            {profileForm.errors.email && (
                                <p className="text-xs text-red-500 mt-1">{profileForm.errors.email}</p>
                            )}
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={profileForm.processing}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors disabled:opacity-50"
                            >
                                {profileForm.processing
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                    : <><Save className="w-4 h-4" /> Save Changes</>
                                }
                            </button>
                        </div>
                    </form>
                </div>

                {/* Change Password */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Change Password</h2>
                            <p className="text-xs text-zinc-400">Update your account password</p>
                        </div>
                    </div>
                    <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                        <div>
                            <label className={labelClass}>Current Password</label>
                            <input
                                type="password"
                                value={passwordForm.data.current_password}
                                onChange={e => passwordForm.setData('current_password', e.target.value)}
                                className={inputClass}
                                placeholder="Enter current password"
                            />
                            {passwordForm.errors.current_password && (
                                <p className="text-xs text-red-500 mt-1">{passwordForm.errors.current_password}</p>
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>New Password</label>
                            <input
                                type="password"
                                value={passwordForm.data.password}
                                onChange={e => passwordForm.setData('password', e.target.value)}
                                className={inputClass}
                                placeholder="Minimum 8 characters"
                            />
                            {passwordForm.errors.password && (
                                <p className="text-xs text-red-500 mt-1">{passwordForm.errors.password}</p>
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordForm.data.password_confirmation}
                                onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                className={inputClass}
                                placeholder="Repeat new password"
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={passwordForm.processing}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors disabled:opacity-50"
                            >
                                {passwordForm.processing
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                                    : <><Lock className="w-4 h-4" /> Update Password</>
                                }
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </Layout>
    );
};

export default Profile;
