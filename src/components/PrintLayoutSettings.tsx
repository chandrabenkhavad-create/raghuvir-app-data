
"use client";

import { usePrintSettings, type PrintSettings } from "@/hooks/usePrintSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Brush, QrCode, Pilcrow, Milestone, Eye, Sheet, Heading2, Weight, Car, Ticket, FileText, Gauge, User, Minimize2, Fuel, PackageSearch, RotateCw } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { PrintRecord } from "./PrintRecord";
import { PrintDieselRecord } from "./PrintDieselRecord";
import sampleSalesData from '../../data/sales.json';
import sampleDieselData from '../../data/diesel.json';
import type { SaleEntry, DieselEntry } from "@/types";

export function PrintLayoutSettings() {
    const { settings, updateSettings, resetSettings, isLoaded } = usePrintSettings();
    
    // Use the first entry from the JSON files as sample data for the preview
    const sampleSale: SaleEntry = sampleSalesData[0] as SaleEntry;
    const sampleDiesel: DieselEntry = sampleDieselData[0] as DieselEntry;


    if (!isLoaded) {
        return <p>Loading settings...</p>;
    }

    const handleSettingChange = (key: keyof PrintSettings, value: any) => {
        updateSettings({ [key]: value });
    };


    return (
        <AlertDialog>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Print Layout Settings</CardTitle>
                            <CardDescription>Customize the layout for all printed records. These settings are saved to your user account.</CardDescription>
                        </div>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline">
                                <RotateCw className="mr-2 h-4 w-4" /> Reset to Default
                            </Button>
                        </AlertDialogTrigger>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 max-h-[65vh] overflow-y-auto p-4">

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
                                <Sheet className="h-5 w-5 text-muted-foreground" />
                                <Label htmlFor="page-size">Page Size</Label>
                            </div>
                            <Select
                                value={settings.pageSize}
                                onValueChange={(value: PrintSettings['pageSize']) => handleSettingChange('pageSize', value)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select page size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DL">DL (210mm x 99mm)</SelectItem>
                                    <SelectItem value="A4_portrait">A4 Portrait</SelectItem>
                                    <SelectItem value="A4_landscape">A4 Landscape</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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
                                    <SelectItem value="text-xs">Extra Small</SelectItem>
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
                                <Label htmlFor="show-sale-vehicle" className="flex items-center gap-2"><Car className="h-4 w-4" />Vehicle Number</Label>
                                <Switch id="show-sale-vehicle" checked={settings.showSaleVehicleNumber} onCheckedChange={(c) => handleSettingChange('showSaleVehicleNumber', c)} />
                            </div>
                            <div className="flex items-center justify-between p-2 border rounded-lg">
                                <Label htmlFor="show-sale-weights" className="flex items-center gap-2"><Weight className="h-4 w-4" />Weight Details (Gross/Tare)</Label>
                                <Switch id="show-sale-weights" checked={settings.showSaleWeightDetails} onCheckedChange={(c) => handleSettingChange('showSaleWeightDetails', c)} />
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

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Eye /> Live Preview</CardTitle>
                    <CardDescription>See how your changes look in real-time. The previews below will update automatically as you change settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        <div>
                             <h3 className="font-semibold mb-4 text-center">Sale Record Preview</h3>
                             <div className="scale-[0.6] mx-auto">
                                <PrintRecord data={sampleSale} />
                             </div>
                        </div>
                         <div>
                             <h3 className="font-semibold mb-4 text-center">Diesel Record Preview</h3>
                              <div className="scale-[0.6] mx-auto">
                                <PrintDieselRecord data={sampleDiesel} />
                             </div>
                        </div>
                    </div>
                </CardContent>
             </Card>
        </div>


         <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Reset all print settings?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. All your custom print layout settings
                will be reset to their default values and saved to your account.
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
