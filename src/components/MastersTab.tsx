
"use client";

import { Briefcase, Building, Fuel, Package, Truck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MasterDataManagement } from './MasterDataManagement';

export function MastersTab() {
  return (
    <Tabs defaultValue="customers" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="customers"><Briefcase className="mr-2 h-4 w-4" />Customers</TabsTrigger>
        <TabsTrigger value="materials"><Package className="mr-2 h-4 w-4" />Materials</TabsTrigger>
        <TabsTrigger value="transporters"><Truck className="mr-2 h-4 w-4" />Transporters</TabsTrigger>
        <TabsTrigger value="pumps"><Fuel className="mr-2 h-4 w-4" />Pumps</TabsTrigger>
        <TabsTrigger value="purchase_parties"><Building className="mr-2 h-4 w-4" />Purchase Parties</TabsTrigger>
      </TabsList>
      <TabsContent value="customers">
        <MasterDataManagement
          dataType="customers"
          title="Customer"
          description="Manage the list of your customers."
          icon={<Briefcase />}
        />
      </TabsContent>
      <TabsContent value="materials">
        <MasterDataManagement
          dataType="materials"
          title="Material"
          description="Manage the list of materials you deal with."
          icon={<Package />}
        />
      </TabsContent>
      <TabsContent value="transporters">
        <MasterDataManagement
          dataType="transporters"
          title="Transporter"
          description="Manage the list of your transporters."
          icon={<Truck />}
        />
      </TabsContent>
       <TabsContent value="pumps">
        <MasterDataManagement
          dataType="pumps"
          title="Pump"
          description="Manage the list of diesel pumps you use."
          icon={<Fuel />}
        />
      </TabsContent>
       <TabsContent value="purchase_parties">
        <MasterDataManagement
          dataType="purchase_parties"
          title="Purchase Party"
          description="Manage the list of parties you purchase from."
          icon={<Building />}
        />
      </TabsContent>
    </Tabs>
  );
}
