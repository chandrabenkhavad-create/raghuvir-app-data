
"use client";

import { usePrintSettings, type PrintSettings } from "@/hooks/usePrintSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Building2, MapPin, Phone, Image as ImageIcon, Mail, Globe, Landmark, Edit } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

export function CompanyDetailsSettings() {
    const { settings, updateSettings, isLoaded } = usePrintSettings();

    if (!isLoaded) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Company Details</CardTitle>
                    <CardDescription>Manage your company's information for printouts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        );
    }

    const handleSettingChange = (key: keyof PrintSettings, value: any) => {
        updateSettings({ [key]: value });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Company Details</CardTitle>
                <CardDescription>Manage your company's information for printouts. This will appear on all printed records and is saved to your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="company-name" className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-4 w-4" />Company Name</Label>
                        <Input
                            id="company-name"
                            value={settings.companyName}
                            onChange={(e) => handleSettingChange('companyName', e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="company-address" className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />Address</Label>
                        <Input
                            id="company-address"
                            value={settings.companyAddress}
                            onChange={(e) => handleSettingChange('companyAddress', e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="company-contact" className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />Contact</Label>
                        <Input
                            id="company-contact"
                            value={settings.companyContact}
                            onChange={(e) => handleSettingChange('companyContact', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="company-gst" className="flex items-center gap-2 text-muted-foreground"><Landmark className="h-4 w-4" />GST Number</Label>
                        <Input
                            id="company-gst"
                            value={settings.companyGst}
                            onChange={(e) => handleSettingChange('companyGst', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="company-email" className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />Email</Label>
                        <Input
                            id="company-email"
                            type="email"
                            value={settings.companyEmail}
                            onChange={(e) => handleSettingChange('companyEmail', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="company-website" className="flex items-center gap-2 text-muted-foreground"><Globe className="h-4 w-4" />Website</Label>
                        <Input
                            id="company-website"
                            type="url"
                            value={settings.companyWebsite}
                            onChange={(e) => handleSettingChange('companyWebsite', e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="company-logo-url" className="flex items-center gap-2 text-muted-foreground"><ImageIcon className="h-4 w-4" />Logo URL</Label>
                         <Input
                            id="company-logo-url"
                            placeholder="https://example.com/logo.png"
                            value={settings.companyLogoUrl}
                            onChange={(e) => handleSettingChange('companyLogoUrl', e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="authorized-signatory" className="flex items-center gap-2 text-muted-foreground"><Edit className="h-4 w-4" />Authorized Signatory Text</Label>
                         <Input
                            id="authorized-signatory"
                            placeholder="e.g., For Raghuvir Infrastructure"
                            value={settings.authorizedSignatory}
                            onChange={(e) => handleSettingChange('authorizedSignatory', e.target.value)}
                        />
                    </div>
                 </div>
            </CardContent>
        </Card>
    );
}
