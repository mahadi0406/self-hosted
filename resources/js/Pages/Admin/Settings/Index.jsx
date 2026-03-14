import React, { useState } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head } from '@inertiajs/react';
import { toast } from 'sonner';
import axios from 'axios';
import {
    Settings, Globe, Sparkles, Smartphone,
    Send, Zap, Save, Eye, EyeOff, Upload, X,
    LogIn, Plus, Trash2, GripVertical,
} from "lucide-react";

const inputCls = "w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 transition-colors";

const tabs = [
    { key: 'general',    label: 'General',    icon: Globe },
    { key: 'login_page', label: 'Login Page', icon: LogIn },
    { key: 'ai',         label: 'AI',         icon: Sparkles },
    { key: 'whatsapp',   label: 'WhatsApp',   icon: Smartphone },
    { key: 'telegram',   label: 'Telegram',   icon: Send },
    { key: 'campaign',   label: 'Campaign',   icon: Zap },
];

const availableIcons = [
    'MessageSquare', 'Zap', 'Shield', 'BarChart3',
    'Send', 'Users', 'Clock', 'Globe', 'Star', 'Heart',
    'Smartphone', 'Mail', 'Bell', 'Lock', 'Rocket'
];

const FieldWrapper = ({ setting, children }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
        <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{setting.label}</p>
            {setting.description && (
                <p className="text-xs text-zinc-400 mt-0.5">{setting.description}</p>
            )}
        </div>
        <div className="md:col-span-2">{children}</div>
    </div>
);

const TextField = ({ setting, value, onChange }) => (
    <FieldWrapper setting={setting}>
        <input
            type="text"
            value={value ?? ''}
            onChange={e => onChange(setting.key, e.target.value)}
            className={inputCls}
        />
    </FieldWrapper>
);

const TextareaField = ({ setting, value, onChange, rows = 3 }) => (
    <FieldWrapper setting={setting}>
        <textarea
            value={value ?? ''}
            onChange={e => onChange(setting.key, e.target.value)}
            rows={rows}
            className={`${inputCls} resize-y`}
        />
    </FieldWrapper>
);

const SectionHeader = ({ title, description }) => (
    <div className="pt-5 pb-3 -mx-5 px-5 border-t border-zinc-100 dark:border-zinc-800">
        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">{title}</p>
        {description && <p className="text-xs text-zinc-400 mt-0.5">{description}</p>}
    </div>
);

const NumberField = ({ setting, value, onChange }) => (
    <FieldWrapper setting={setting}>
        <input
            type="number"
            value={value ?? ''}
            onChange={e => onChange(setting.key, e.target.value)}
            className={inputCls}
        />
    </FieldWrapper>
);

const PasswordField = ({ setting, value, onChange }) => {
    const [show, setShow] = useState(false);
    return (
        <FieldWrapper setting={setting}>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    value={value ?? ''}
                    onChange={e => onChange(setting.key, e.target.value)}
                    placeholder="Enter value..."
                    className={`${inputCls} pr-10`}
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </FieldWrapper>
    );
};

const BooleanField = ({ setting, value, onChange }) => (
    <FieldWrapper setting={setting}>
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={value === '1' || value === true || value === 1}
                onChange={e => onChange(setting.key, e.target.checked ? '1' : '0')}
            />
            <div className="w-10 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-zinc-300 dark:peer-focus:ring-zinc-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100 transition-colors" />
        </label>
    </FieldWrapper>
);

const FileField = ({ setting, value, onChange, onFileChange }) => {
    const previewUrl = value && !value.startsWith('blob:')
        ? `/assets/files/${value}`
        : value || null;

    return (
        <FieldWrapper setting={setting}>
            <div className="space-y-2">
                {previewUrl && (
                    <div className="flex items-center gap-2">
                        <img src={previewUrl} alt={setting.label} className="h-10 w-auto rounded border border-zinc-200 dark:border-zinc-700 object-contain bg-zinc-50 dark:bg-zinc-800" />
                        <button
                            type="button"
                            onClick={() => onChange(setting.key, '')}
                            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    <Upload className="w-4 h-4" />
                    {value ? 'Change file' : 'Upload file'}
                    <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={e => onFileChange(setting.key, e.target.files[0])}
                    />
                </label>
            </div>
        </FieldWrapper>
    );
};

const JsonFeaturesField = ({ setting, value, onChange }) => {
    // Parse JSON value
    let features = [];
    try {
        features = typeof value === 'string' ? JSON.parse(value) : (value || []);
    } catch {
        features = [];
    }

    const updateFeatures = (newFeatures) => {
        onChange(setting.key, JSON.stringify(newFeatures));
    };

    const addFeature = () => {
        updateFeatures([...features, { icon: 'Zap', label: '', desc: '' }]);
    };

    const removeFeature = (index) => {
        updateFeatures(features.filter((_, i) => i !== index));
    };

    const updateFeature = (index, field, val) => {
        const updated = [...features];
        updated[index] = { ...updated[index], [field]: val };
        updateFeatures(updated);
    };

    return (
        <FieldWrapper setting={setting}>
            <div className="space-y-3">
                {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                        <div className="text-zinc-400 mt-2">
                            <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <select
                                value={feature.icon}
                                onChange={e => updateFeature(index, 'icon', e.target.value)}
                                className={`${inputCls} text-xs`}
                            >
                                {availableIcons.map(icon => (
                                    <option key={icon} value={icon}>{icon}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={feature.label}
                                onChange={e => updateFeature(index, 'label', e.target.value)}
                                placeholder="Label"
                                className={`${inputCls} text-xs`}
                            />
                            <input
                                type="text"
                                value={feature.desc}
                                onChange={e => updateFeature(index, 'desc', e.target.value)}
                                placeholder="Description"
                                className={`${inputCls} text-xs`}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors mt-1"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addFeature}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-600 text-sm text-zinc-500 hover:border-zinc-400 hover:text-zinc-600 dark:hover:border-zinc-500 dark:hover:text-zinc-400 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Feature
                </button>
            </div>
        </FieldWrapper>
    );
};

const renderField = (setting, values, onChange, onFileChange) => {
    const value = values[setting.key] ?? setting.value;
    switch (setting.type) {
        case 'boolean':  return <BooleanField  key={setting.key} setting={setting} value={value} onChange={onChange} />;
        case 'password': return <PasswordField key={setting.key} setting={setting} value={value} onChange={onChange} />;
        case 'number':   return <NumberField   key={setting.key} setting={setting} value={value} onChange={onChange} />;
        case 'file':     return <FileField     key={setting.key} setting={setting} value={value} onChange={onChange} onFileChange={onFileChange} />;
        case 'textarea': return <TextareaField key={setting.key} setting={setting} value={value} onChange={onChange} rows={setting.key === 'ai_auto_reply_context' ? 5 : 3} />;
        case 'json':     return <JsonFeaturesField key={setting.key} setting={setting} value={value} onChange={onChange} />;
        default:         return <TextField     key={setting.key} setting={setting} value={value} onChange={onChange} />;
    }
};


const SECTION_BREAKS = {
    ai: {
        ai_auto_reply_enabled: {
            title: 'AI Auto-Reply',
            description: 'Automatically respond to inbound messages using AI',
        },
    },
    whatsapp: {
        whatsapp_verify_token: {
            title: 'Webhook',
            description: 'Configure your WhatsApp webhook verification',
        },
    },
    telegram: {
        telegram_webhook_mode: {
            title: 'Webhook',
            description: 'Configure how Telegram delivers incoming messages',
        },
    },
    login_page: {
        login_features: {
            title: 'Feature Cards',
            description: 'Highlight cards shown on the login page',
        },
        login_demo_enabled: {
            title: 'Demo Credentials',
            description: 'Show a demo login box for easy onboarding',
        },
    },
};

const TabPanel = ({ group, groupSettings }) => {
    const [values, setValues]   = useState({});
    const [files, setFiles]     = useState({});
    const [saving, setSaving]   = useState(false);

    const onChange = (key, val) => setValues(v => ({ ...v, [key]: val }));

    const onFileChange = (key, file) => {
        if (!file) return;
        setFiles(f => ({ ...f, [key]: file }));
        const url = URL.createObjectURL(file);
        setValues(v => ({ ...v, [key]: url }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData();

        Object.entries(groupSettings).forEach(([key, setting]) => {
            const val = values.hasOwnProperty(key) ? values[key] : setting.value;

            if (setting.type === 'file') {
                if (files[key]) {
                    formData.append(key, files[key]);
                } else if (values[key] === '') {
                    formData.append(key, '__REMOVE__');
                }
            } else if (setting.type === 'boolean') {
                const boolVal = val === '1' || val === true || val === 1 ? '1' : '0';
                formData.append(key, boolVal);
            } else if (setting.type === 'json') {
                const jsonVal = typeof val === 'string' ? val : JSON.stringify(val || []);
                formData.append(key, jsonVal);
            } else {
                formData.append(key, val ?? '');
            }
        });

        formData.append('_method', 'PUT');

        try {
            const response = await axios.post(`/admin/settings/${group}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Settings saved successfully!');
            setFiles({});
        } catch (err) {
            console.error('Full error:', err);
            console.error('Response:', err.response);
            toast.error(err.response?.data?.message || err.message || 'Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const settingsArray = Object.values(groupSettings);
    const tabLabel = tabs.find(t => t.key === group)?.label || group;

    return (
        <form onSubmit={handleSave}>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                        {tabLabel} Settings
                    </h2>
                </div>
                <div className="px-5">
                    {settingsArray.map(setting => (
                        <React.Fragment key={setting.key}>
                            {SECTION_BREAKS[group]?.[setting.key] && (
                                <SectionHeader {...SECTION_BREAKS[group][setting.key]} />
                            )}
                            {renderField(setting, values, onChange, onFileChange)}
                        </React.Fragment>
                    ))}
                </div>
                <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-50 text-white dark:text-zinc-900 text-sm font-medium transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </form>
    );
};


const Index = ({ settings }) => {
    const [activeTab, setActiveTab] = useState('general');
    const availableTabs = tabs.filter(tab => settings[tab.key]);

    return (
        <Layout pageTitle="Settings" pageSection="Settings">
            <Head title="Settings" />

            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Settings</h1>
                        <p className="text-xs text-zinc-400">Manage your platform configuration</p>
                    </div>
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1">
                    {availableTabs.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                activeTab === key
                                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {availableTabs.map(({ key }) =>
                    activeTab === key && settings[key] ? (
                        <TabPanel
                            key={key}
                            group={key}
                            groupSettings={settings[key]}
                        />
                    ) : null
                )}

            </div>
        </Layout>
    );
};

export default Index;
