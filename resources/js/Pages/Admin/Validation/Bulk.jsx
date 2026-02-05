import { useState } from 'react';
import { Head } from '@inertiajs/react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, FileText, Download, FileDown } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function Bulk({ lists }) {
    const [file, setFile] = useState(null);
    const [listName, setListName] = useState('');
    const [tags, setTags] = useState('');
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const downloadDemoFile = (format) => {
        const emails = [
            'john.doe@example.com',
            'jane.smith@company.com',
            'info@business.org',
            'contact@website.net',
            'admin@domain.com'
        ];

        let content, filename, mimeType;

        if (format === 'csv') {
            content = 'Email Address\n' + emails.join('\n');
            filename = 'demo-email-list.csv';
            mimeType = 'text/csv';
        } else {
            content = emails.join('\n');
            filename = 'demo-email-list.txt';
            mimeType = 'text/plain';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !listName) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('list_name', listName);
        formData.append('tags', tags);

        try {
            const response = await axios.post(route('admin.validate.bulk.process'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setFile(null);
                setListName('');
                setTags('');
                router.reload();
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload file. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
            processing: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
            failed: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
        };
        return <Badge className={variants[status]}>{status.toUpperCase()}</Badge>;
    };

    return (
        <Layout pageTitle="Bulk Validation" pageSection="Email Validation">
            <Head title="Bulk Validation"/>

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Demo Files Alert */}
                <Alert>
                    <FileDown className="h-4 w-4"/>
                    <AlertTitle>Need a sample file?</AlertTitle>
                    <AlertDescription>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm">Download demo files:</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadDemoFile('csv')}
                            >
                                <FileText className="w-3 h-3 mr-1"/>
                                CSV
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadDemoFile('txt')}
                            >
                                <FileText className="w-3 h-3 mr-1"/>
                                TXT
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>

                {/* Upload Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Email List</CardTitle>
                        <CardDescription>
                            Upload a CSV or TXT file containing email addresses to validate
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* File Upload */}
                            <div className="space-y-2">
                                <Label>Email List File</Label>
                                <div
                                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                        dragActive
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    {file ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <FileText className="w-5 h-5 text-primary"/>
                                            <span className="font-medium">{file.name}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setFile(null)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground"/>
                                            <p className="text-sm font-medium mb-1">
                                                Drop your file here or click to browse
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                CSV or TXT files up to 10MB
                                            </p>
                                            <Input
                                                type="file"
                                                accept=".csv,.txt"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="file-upload"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="mt-3"
                                                onClick={() => document.getElementById('file-upload').click()}
                                            >
                                                Choose File
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* List Name */}
                            <div className="space-y-2">
                                <Label htmlFor="list_name">List Name</Label>
                                <Input
                                    id="list_name"
                                    type="text"
                                    placeholder="My Email List"
                                    value={listName}
                                    onChange={(e) => setListName(e.target.value)}
                                    disabled={uploading}
                                />
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags (Optional)</Label>
                                <Input
                                    id="tags"
                                    type="text"
                                    placeholder="marketing, customers, newsletter"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    disabled={uploading}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={!file || !listName || uploading}
                                className="w-full"
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"/>
                                        Processing
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2"/>
                                        Start Validation
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Lists */}
                {lists && lists.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Validation Lists</CardTitle>
                            <CardDescription>
                                View and manage your uploaded email lists
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {lists.map((list) => (
                                    <div key={list.id} className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold">{list.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(list.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {getStatusBadge(list.status)}
                                        </div>

                                        {list.status === 'processing' ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Processing...</span>
                                                    <span className="font-medium">
                                                        {list.valid_emails + list.invalid_emails}/{list.total_emails}
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={((list.valid_emails + list.invalid_emails) / list.total_emails) * 100}
                                                />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-3 gap-4 text-center">
                                                <div>
                                                    <div className="text-2xl font-bold">{list.total_emails}</div>
                                                    <div className="text-xs text-muted-foreground">Total</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-emerald-600">{list.valid_emails}</div>
                                                    <div className="text-xs text-muted-foreground">Valid</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-red-600">{list.invalid_emails}</div>
                                                    <div className="text-xs text-muted-foreground">Invalid</div>
                                                </div>
                                            </div>
                                        )}

                                        {list.tags && (
                                            <div className="flex gap-2 mt-3">
                                                {list.tags.split(',').map((tag, idx) => (
                                                    <Badge key={idx} variant="secondary">
                                                        {tag.trim()}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        {list.status === 'completed' && (
                                            <Button variant="outline" size="sm" className="w-full mt-3">
                                                <Download className="w-4 h-4 mr-2"/>
                                                Download Results
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}
