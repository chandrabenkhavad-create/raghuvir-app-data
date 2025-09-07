
"use client";

import { usePrintSettings, type PrintSettings } from "@/hooks/usePrintSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Brush, QrCode, Pilcrow, Milestone, Building2, MapPin, Phone, Image as ImageIcon, Box, Truck, User, IndianRupee, FileText, Ticket, Gauge, Minimize2, PackageSearch, Fuel, Mail, Globe, Landmark, RotateCw, Edit, Heading2, Weight, Car } from "lucide-react";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function PrintLayoutSettings() {
    const { settings, updateSettings, resetSettings, isLoaded } = usePrintSettings();

    if (!isLoaded) {
        return <p>Loading settings...</p>;
    }

    const handleSettingChange = (key: keyof PrintSettings, value: any) => {
        updateSettings({ [key]: value });
    };


    return (
        <AlertDialog>
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Print Layout Settings</CardTitle>
                        <CardDescription>Customize the layout for all printed records.</CardDescription>
                    </div>
                     <AlertDialogTrigger asChild>
                        <Button variant="outline">
                            <RotateCw className="mr-2 h-4 w-4" /> Reset to Default
                        </Button>
                    </AlertDialogTrigger>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[65vh] overflow-y-auto p-4">
                
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="text-xl">Company Details</CardTitle>
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

                <Card className="bg-muted/30 p-4 space-y-4">
                    <h3 className="font-semibold mb-2">Document Titles</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sale-doc-title" className="flex items-center gap-2 text-muted-foreground"><Heading2 className="h-4 w-4" />Sale Record Title</Label>
                            <Input
                                id="sale-doc-title"
                                value={settings.saleDocumentTitle}
                                onChange={(e) => handleSettingChange('saleDocumentTitle', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="diesel-doc-title" className="flex items-center gap-2 text-muted-foreground"><Heading2 className="h-4 w-4" />Diesel Record Title</Label>
                            <Input
                                id="diesel-doc-title"
                                value={settings.dieselDocumentTitle}
                                onChange={(e) => handleSettingChange('dieselDocumentTitle', e.target.value)}
                            />
                        </div>
                    </div>
                 </Card>

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
                
                <div className="grid md:grid-cols-2 gap-4">
                     <Card className="bg-muted/30 p-4 space-y-2">
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><PackageSearch /> Sale Print Fields</h3>
                          <div className="flex items-center justify-between p-2 border rounded-lg">
                            <Label htmlFor="show-sale-purchase" className="flex items-center gap-2"><Building2 className="h-4 w-4" />Purchase Party</Label>
                            <Switch id="show-sale-purchase" checked={settings.showSalePurchase} onCheckedChange={(c) => handleSettingChange('showSalePurchase', c)} />
                        </div>
                         <div className="flex items-center justify-between p-2 border rounded-lg">
                            <Label htmlFor="show-sale-transporter" className="flex items-center gap-2"><Truck className="h-4 w-4" />Transporter</Label>
                            <Switch id="show-sale-transporter" checked={settings.showSaleTransporter} onCheckedChange={(c) => handleSettingChange('showSaleTransporter', c)} />
                        </div>
                         <div className="flex items-center justify-between p-2 border rounded-lg">
                            <Label htmlFor="show-sale-driver" className="flex items-center gap-2"><User className="h-4 w-4" />Driver</Label>
                            <Switch id="show-sale-driver" checked={settings.showSaleDriver} onCheckedChange={(c) => handleSettingChange('showSaleDriver', c)} />
                        </div>
                         <div className="flex items-center justify-between p-2 border rounded-lg">
                            <Label htmlFor="show-sale-vehicle" className="flex items-center gap-2"><Car className="h-4 w-4" />Vehicle Number</Label>
                            <Switch id="show-sale-vehicle" checked={settings.showSaleVehicleNumber} onCheckedChange={(c) => handleSettingChange('showSaleVehicleNumber', c)} />
                        </div>
                         <div className="flex items-center justify-between p-2 border rounded-lg">
                            <Label htmlFor="show-sale-weights" className="flex items-center gap-2"><Weight className="h-4 w-4" />Weight Details (Gross/Tare)</Label>
                            <Switch id="show-sale-weights" checked={settings.showSaleWeightDetails} onCheckedChange={(c) => handleSettingChange('showSaleWeightDetails', c)} />
                        </div>
                         <div className="flex items-center justify-between p-2 border rounded-lg">
                            <Label htmlFor="show-sale-rent" className="flex items-center gap-2"><IndianRupee className="h-4 w-4" />Rent</Label>
                            <Switch id="show-sale-rent" checked={settings.showSaleRent} onCheckedChange={(c) => handleSettingChange('showSaleRent', c)} />
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded-lg">
                            <Label htmlFor="show-sale-royalty" className="flex items-center gap-2"><Ticket className="h-4 w-4" />Royalty Details</Label>
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
         <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Reset all print settings?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. All your custom print layout settings
                will be reset to their default values.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetSettings}>Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    );
}
