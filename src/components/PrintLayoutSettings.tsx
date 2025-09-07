"use client";

import { usePrintSettings, type PrintSettings } from "@/hooks/usePrintSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Brush, QrCode, Pilcrow, Milestone } from "lucide-react";

export function PrintLayoutSettings() {
    const { settings, updateSettings, isLoaded } = usePrintSettings();

    if (!isLoaded) {
        return <p>Loading settings...</p>;
    }

    return (
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Print Layout Settings</CardTitle>
                <CardDescription>Customize the layout for all printed records.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                        <Brush className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="font-size">Font Size</Label>
                    </div>
                    <Select
                        value={settings.fontSize}
                        onValueChange={(value: PrintSettings['fontSize']) => updateSettings({ fontSize: value })}
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
                        onCheckedChange={(checked) => updateSettings({ showQRCode: checked })}
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
                        onCheckedChange={(checked) => updateSettings({ showCompanyHeader: checked })}
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
                        onCheckedChange={(checked) => updateSettings({ showFooter: checked })}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
