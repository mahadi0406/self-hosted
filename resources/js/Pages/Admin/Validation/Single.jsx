import React, {useState, useEffect} from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import {Head, router, usePage} from '@inertiajs/react';
import {Button} from '@/Components/UI/button';
import {Input} from '@/Components/UI/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/Components/UI/card';
import {Badge} from '@/Components/UI/badge';
import {
    CheckCircle2,
    XCircle,
    Lightbulb,
} from 'lucide-react';
import {toast} from 'sonner';
import {Alert, AlertDescription, AlertTitle} from "@/Components/UI/alert.jsx";

const CheckItem = ({label, passed, loading = false}) => {
    return (
        <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30">
            <span className="text-sm font-medium">{label}</span>
            <div>
                {loading ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
                ) : passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" strokeWidth={2}/>
                ) : (
                    <XCircle className="w-5 h-5 text-red-500" strokeWidth={2}/>
                )}
            </div>
        </div>
    );
};

const Single = () => {
    const {flash} = usePage().props;
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setResult(flash.success);
            toast.success('Email validated successfully!');
        }
    }, [flash]);

    const handleValidate = () => {
        if (!email || !email.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setResult(null);

        router.post('/admin/validate/single',
            {email},
            {
                preserveScroll: true,
                onFinish: () => {
                    setLoading(false);
                },
                onError: (errors) => {
                    toast.error(errors.email || 'Validation failed');
                }
            }
        );
    };

    const handleReset = () => {
        setEmail('');
        setResult(null);
    };

    const getStatusBadge = (status) => {
        const variants = {
            valid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
            invalid: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
            risky: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
        };

        return (
            <Badge className={variants[status] || variants.invalid}>
                {status.toUpperCase()}
            </Badge>
        );
    };

    return (
        <Layout pageTitle="Single Validation" pageSection="Email Validation">
            <Head title="Single Validation"/>

            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Input Section */}
                <Card>
                    <CardHeader className="space-y-1 px-4 sm:px-6">
                        <CardTitle className="text-lg sm:text-xl">Validate Email Address</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            Enter an email address to perform comprehensive validation checks
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="example@domain.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                                    disabled={loading}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={handleValidate}
                                    disabled={loading || !email}
                                    className="w-full sm:w-auto whitespace-nowrap"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"/>
                                            Validating
                                        </>
                                    ) : (
                                        'Validate'
                                    )}
                                </Button>
                            </div>

                            {result && (
                                <Button variant="outline" onClick={handleReset} size="sm" className="w-full sm:w-auto">
                                    Validate Another
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Results Section */}
                {result && (
                    <>
                        {/* Overview Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <Card>
                                <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                                    <div className="text-xl sm:text-2xl font-bold">{result.score}/100</div>
                                    <p className="text-xs text-muted-foreground">Score</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                                    <div className="text-xl sm:text-2xl font-bold">
                                        {result.valid ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500"/> : <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500"/>}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Status</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                                    <div className="text-xs sm:text-sm font-medium truncate">{result.email.split('@')[1]}</div>
                                    <p className="text-xs text-muted-foreground">Domain</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                                    <div className="text-xl sm:text-2xl font-bold">
                                        {Object.values(result.checks).filter(v => v === true).length}/{Object.keys(result.checks).length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Checks Passed</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Suggestion Alert */}
                        {result.suggestion && result.suggestion !== result.email && (
                            <Alert className="px-4 sm:px-6">
                                <Lightbulb className="h-4 w-4"/>
                                <AlertTitle className="text-sm sm:text-base">Did you mean?</AlertTitle>
                                <AlertDescription className="text-xs sm:text-sm">
                                    We detected a possible typo: <span className="font-semibold break-all">{result.suggestion}</span>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Validation Checks */}
                        <Card>
                            <CardHeader className="px-4 sm:px-6">
                                <CardTitle className="text-base sm:text-lg">Validation Checks</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6">
                                <div className="space-y-2">
                                    <CheckItem label="Email Format" passed={result.checks.format}/>
                                    <CheckItem label="DNS Records" passed={result.checks.dns}/>
                                    <CheckItem label="MX Records" passed={result.checks.mx_records}/>
                                    <CheckItem label="Not Disposable" passed={result.checks.disposable}/>
                                    <CheckItem label="Not Role-Based" passed={result.checks.role_based}/>
                                    <CheckItem label="Bot Pattern Check" passed={result.checks.bot_pattern}/>
                                    {result.checks.typo !== undefined && (
                                        <CheckItem label="Typo Detection" passed={!result.checks.typo}/>
                                    )}
                                    {result.checks.free_provider !== undefined && (
                                        <CheckItem
                                            label={result.checks.free_provider ? "Free Provider" : "Business Email"}
                                            passed={!result.checks.free_provider}
                                        />
                                    )}
                                    {result.checks.catch_all !== undefined && (
                                        <CheckItem label="Not Catch-All" passed={!result.checks.catch_all}/>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Email Details */}
                        <Card>
                            <CardHeader className="px-4 sm:px-6">
                                <CardTitle className="text-base sm:text-lg">Details</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                                        <span className="text-xs sm:text-sm text-muted-foreground">Email</span>
                                        <span className="font-mono text-xs sm:text-sm break-all">{result.email}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                                        <span className="text-xs sm:text-sm text-muted-foreground">Status</span>
                                        {getStatusBadge(result.status || (result.valid ? 'valid' : 'invalid'))}
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <span className="text-xs sm:text-sm text-muted-foreground">Quality Score</span>
                                        <div className="flex items-center gap-3 w-full sm:flex-1 sm:max-w-xs">
                                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${
                                                        result.score >= 80 ? 'bg-emerald-500' :
                                                            result.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                                    }`}
                                                    style={{width: `${result.score}%`}}
                                                />
                                            </div>
                                            <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">{result.score}%</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                                        <span className="text-xs sm:text-sm text-muted-foreground">Domain</span>
                                        <span className="font-mono text-xs sm:text-sm break-all">{result.email.split('@')[1]}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Domain Reputation */}
                        {result.checks.domain_reputation !== undefined && (
                            <Card>
                                <CardHeader className="px-4 sm:px-6">
                                    <CardTitle className="text-base sm:text-lg">Domain Reputation</CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 sm:px-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs sm:text-sm text-muted-foreground">Reputation Score</span>
                                        <span className="text-base sm:text-lg font-semibold">{result.checks.domain_reputation}/100</span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${
                                                result.checks.domain_reputation >= 70 ? 'bg-emerald-500' :
                                                    result.checks.domain_reputation >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                            }`}
                                            style={{width: `${result.checks.domain_reputation}%`}}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
};

export default Single;
