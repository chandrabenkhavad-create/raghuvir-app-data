
"use client";

import { useAppSettings, type AppSettings } from "@/hooks/useAppSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { ShieldCheck, LayoutDashboard, FileSpreadsheet, Settings, Edit } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

export function UserPermissionsSettings() {
    const { settings, updateSettings, isLoaded } = useAppSettings();

    if (!isLoaded) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>User Permissions</CardTitle>
                    <CardDescription>Control which tabs are visible to normal users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        );
    }

    const handleSettingChange = (key: keyof AppSettings, value: any) => {
        updateSettings({ [key]: value });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck /> User Permissions</CardTitle>
                <CardDescription>Control what users with the 'user' role can see and do. Admins always have full access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                            <Label htmlFor="show-dashboard">User can see Dashboard</Label>
                        </div>
                        <Switch
                            id="show-dashboard"
                            checked={settings.userCanViewDashboard}
                            onCheckedChange={(checked) => handleSettingChange('userCanViewDashboard', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                            <Label htmlFor="show-reports">User can see Reports</Label>
                        </div>
                        <Switch
                            id="show-reports"
                            checked={settings.userCanViewReports}
                            onCheckedChange={(checked) => handleSettingChange('userCanViewReports', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <Settings className="h-5 w-5 text-muted-foreground" />
                            <Label htmlFor="show-settings">User can see Settings</Label>
                        </div>
                        <Switch
                            id="show-settings"
                            checked={settings.userCanViewSettings}
                            onCheckedChange={(checked) => handleSettingChange('userCanViewSettings', checked)}
                        />
                    </div>
                     <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <Edit className="h-5 w-5 text-muted-foreground" />
                            <Label htmlFor="can-edit">User can edit entries</Label>
                        </div>
                        <Switch
                            id="can-edit"
                            checked={settings.userCanEditEntries}
                            onCheckedChange={(checked) => handleSettingChange('userCanEditEntries', checked)}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
