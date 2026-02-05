import React, {useState} from 'react';
import Layout from "@/layouts/admin/layout";
import {Head, useForm} from '@inertiajs/react';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/Components/UI/card';
import {Button} from '@/Components/UI/button';
import {Input} from '@/Components/UI/input';
import {Label} from '@/Components/UI/label';

const Profile = ({auth}) => {
    const {data, setData, put, processing, errors} = useForm({
        name: auth.user.name || '',
        email: auth.user.email || '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <Layout pageTitle="Profile" pageSection="Settings">
            <Head title="Profile"/>

            <div className="max-w-2xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                    <p className="text-muted-foreground mt-1">Update your profile information</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your name and email address</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1"
                                />
                                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1"
                                />
                                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <Label htmlFor="password">New Password (optional)</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="mt-1"
                                    placeholder="Leave blank to keep current password"
                                />
                                {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <Button type="submit" disabled={processing} className="w-full">
                                {processing ? 'Updating...' : 'Update Profile'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default Profile;
