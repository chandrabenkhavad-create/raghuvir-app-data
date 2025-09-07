
"use client";

import { usePrintSettings, type PrintSettings } from "@/hooks/usePrintSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Brush, QrCode, Pilcrow, Milestone, Building2, MapPin, Phone, Image as ImageIcon, Box, Truck, User, IndianRupee, FileText, Ticket, Gauge, Minimize2, PackageSearch, Fuel } from "lucide-react";
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
        <Card className="max-h-[70vh] overflow-y-auto">
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
                     <div className="space-y-2">
                        <Label htmlFor="company-logo-url" className="flex items-center gap-2 text-muted-foreground"><ImageIcon className="h-4 w-4" />Logo URL</Label>
                         <Input
                            id="company-logo-url"
                            placeholder="https://example.com/logo.png"
                            value={settings.companyLogoUrl}
                            onChange={(e) => handleSettingChange('companyLogoUrl', e.target.value)}
                        />
                    </div>
                </Card>

                <Separator />

                <Card className="bg-muted/30 p-4 space-y-2">
                     <h3 className="font-semibold mb-2">General Layout</h3>
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
                     <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <Minimize2 className="h-5 w-5 text-muted-foreground" />
                            <Label htmlFor="compact-layout">Compact Layout</Label>
                        </div>
                        <Switch
                            id="compact-layout"
                            checked={settings.useCompactLayout}
                            onCheckedChange={(checked) => handleSettingChange('useCompactLayout', checked)}
                        />
                    </div>
                </Card>
                
                <Separator />
                
                <div className="grid md:grid-cols-2 gap-4">
                     <Card className="bg-muted/30 p-4 space-y-2">
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><PackageSearch /> Sale Print Fields</h3>
                         <div className="flex items-center justify-between p-2 border rounded-lg">
                            <Label htmlFor="show-sale-transporter" className="flex items-center gap-2"><Truck className="h-4 w-4" />Transporter</Label>
                            <Switch id="show-sale-transporter" checked={settings.showSaleTransporter} onCheckedChange={(c) => handleSettingChange('showSaleTransporter', c)} />
                        </div>
                         <div className="flex items-center justify-between p-2 border rounded-lg">
                            <Label htmlFor="show-sale-driver" className="flex items-center gap-2"><User className="h-4 w-4" />Driver</Label>
                            <Switch id="show-sale-driver" checked={settings.showSaleDriver} onCheckedChange={(c) => handleSettingChange('showSaleDriver', c)} />
                        </div>
                         <div className="flex items-center justify-between p-2 border rounded-lg">
                            <Label htmlFor="show-sale-rent" className="flex items-center gap-2"><IndianRupee className="h-4 w-4" />Rent</Label>
                            <Switch id="show-sale-rent" checked={settings.showSaleRent} onCheckedChange={(c) => handleSettingChange('showSaleRent', c)} />
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded-lg">
                            <Label htmlFor="show-sale-royalty" className="flex items-center gap-2"><Ticket className="h-4 w-4" />Royalty</Label>
                            <Switch id="show-sale-royalty" checked={settings.showSaleRoyalty} onCheckedChange={(c) => handleSettingChange('showSaleRoyalty', c)} />
                        </div>
                         <div className="flex items-center justify-between p-2 border rounded-lg">
                            <Label htmlFor="show-sale-remarks" className="flex items-center gap-2"><FileText className="h-4 w-4" />Remarks</Label>
                            <Switch id="show-sale-remarks" checked={settings.showSaleRemarks} onCheckedChange={(c) => handleSettingChange('showSaleRemarks', c)} />
                        </div>
                     </Card>
                      <Card className="bg-muted/30 p-4 space-y-2">
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Fuel /> Diesel Print Fields</h3>
                         <div className="flex items-center justify-between p-2 border rounded-lg">
                            <Label htmlFor="show-diesel-driver" className="flex items-center gap-2"><User className="h-4 w-4" />Driver Name</Label>
                            <Switch id="show-diesel-driver" checked={settings.showDieselDriver} onCheckedChange={(c) => handleSettingChange('showDieselDriver', c)} />
                        </div>
                         <div className="flex items-center justify-between p-2 border rounded-lg">
                            <Label htmlFor="show-diesel-odo" className="flex items-center gap-2"><Gauge className="h-4 w-4" />ODO Reading</Label>
                            <Switch id="show-diesel-odo" checked={settings.showDieselOdo} onCheckedChange={(c) => handleSettingChange('showDieselOdo', c)} />
                        </div>
                      </Card>
                </div>


            </CardContent>
        </Card>
    );
}
