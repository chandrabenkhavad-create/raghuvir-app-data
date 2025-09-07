
"use client";

import { usePrintSettings, type PrintSettings } from "@/hooks/usePrintSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Brush, QrCode, Pilcrow, Milestone, Building2, MapPin, Phone } from "lucide-react";
import { Separator } from "./ui/separator";

export function PrintLayoutSettings() {
    const { settings, updateSettings, isLoaded } = usePrintSettings();

    if (!isLoaded) {
        return <p>Loading settings...</p>;
    }

    const handleSettingChange = (key: keyof PrintSettings, value: any) => {
        updateSettings({ [key]: value });
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle>Print Layout Settings</CardTitle>
                <CardDescription>Customize the layout for all printed records.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
                <Card className="bg-muted/30 p-4 space-y-4">
                    <h3 className="font-semibold mb-2">Company Details</h3>
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
                </Card>

                <Separator />

                <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                        <Brush className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="font-size">Font Size</Label>
                    </div>
                    <Select
                        value={settings.fontSize}
                        onValueChange={(value: PrintSettings['fontSize']) => handleSettingChange('fontSize', value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select font size" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="text-sm">Small</SelectItem>
                            <SelectItem value="text-base">Medium</SelectItem>
                            <SelectItem value="text-lg">Large</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                     <div className="flex items-center gap-3">
                        <QrCode className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="show-qr-code">Show QR Code</Label>
                    </div>
                    <Switch
                        id="show-qr-code"
                        checked={settings.showQRCode}
                        onCheckedChange={(checked) => handleSettingChange('showQRCode', checked)}
                    />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                     <div className="flex items-center gap-3">
                        <Pilcrow className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="show-header">Show Company Header</Label>
                    </div>
                    <Switch
                        id="show-header"
                        checked={settings.showCompanyHeader}
                        onCheckedChange={(checked) => handleSettingChange('showCompanyHeader', checked)}
                    />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                        <Milestone className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="show-footer">Show Footer</Label>
                    </div>
                    <Switch
                        id="show-footer"
                        checked={settings.showFooter}
                        onCheckedChange={(checked) => handleSettingChange('showFooter', checked)}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
