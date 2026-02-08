import { Card, CardContent } from '@/components/ui/card';
import { Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function StatsCards({ stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Validated</p>
                            <p className="text-2xl font-bold">{stats?.total || 0}</p>
                        </div>
                        <Mail className="h-8 w-8 text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Valid Emails</p>
                            <p className="text-2xl font-bold text-emerald-600">{stats?.valid || 0}</p>
                            <p className="text-xs text-muted-foreground">{stats?.valid_percentage || 0}%</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-emerald-500" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Invalid Emails</p>
                            <p className="text-2xl font-bold text-red-600">{stats?.invalid || 0}</p>
                            <p className="text-xs text-muted-foreground">{stats?.invalid_percentage || 0}%</p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Risky Emails</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats?.risky || 0}</p>
                            <p className="text-xs text-muted-foreground">{stats?.risky_percentage || 0}%</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-yellow-500" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
