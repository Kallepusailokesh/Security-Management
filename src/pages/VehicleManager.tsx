import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, History, Users, FileText, Phone, Check, X, LogOut, Search, Download, Trash2, Edit, Camera, Scan } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LicensePlateScanner from "@/components/LicensePlateScanner";
import { authorityData } from "@/data/authorityData";
import { saveVehicleEntry, updateVehicleExit, getVehicleLog, clearVehicleHistory, exportToExcel } from "@/utils/vehicleStorage";
import { Modal, ModalBody, ModalHeader } from "../components/ui/modal";

const VehicleManager = () => {
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState("entry");

  // Entry state
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [names, setNames] = useState([""]);
  const [purpose, setPurpose] = useState("");
  const [selectedAuthority, setSelectedAuthority] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvingAuthority, setApprovingAuthority] = useState(null);

  // History state
  const [vehicleLog, setVehicleLog] = useState([]);
  const [filteredLog, setFilteredLog] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all");

  // Get unique purposes from authority data plus "other"
  const availablePurposes = [...new Set(authorityData.flatMap(auth => auth.purposes)), "other"];

  // Head of organization for "other" purposes
  const headOfOrganization = {
    id: 999,
    name: "Dr. Anita Rao",
    designation: "Director General",
    department: "Administration",
    phone: "+91-9876543299",
    email: "director@university.edu",
    purposes: ["other"]
  };
  useEffect(() => {
    loadVehicleLog();
  }, []);
  useEffect(() => {
    filterLog();
  }, [vehicleLog, searchTerm, historyFilter]);
  const loadVehicleLog = () => {
    const log = getVehicleLog();
    setVehicleLog(log.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()));
  };
  const filterLog = () => {
    let filtered = vehicleLog;
    if (historyFilter === "active") {
      filtered = filtered.filter(entry => entry.status === 'inside');
    } else if (historyFilter === "exited") {
      filtered = filtered.filter(entry => entry.status === 'exited');
    }
    if (searchTerm) {
      filtered = filtered.filter(entry => entry.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) || entry.names.some(name => name.toLowerCase().includes(searchTerm.toLowerCase())) || entry.purpose.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredLog(filtered);
  };
  const resetEntryForm = () => {
    setVehicleNumber("");
    setNumberOfPeople(1);
    setNames([""]);
    setPurpose("");
    setSelectedAuthority(null);
    setShowScanner(false);
  };
  const handleLicensePlateScanned = plateNumber => {
    setVehicleNumber(plateNumber);
    setShowScanner(false);
    toast({
      title: "License plate scanned successfully",
      description: `Vehicle number: ${plateNumber}`
    });
  };
  const handleNumberOfPeopleChange = num => {
    const newNum = Math.max(1, Math.min(10, num));
    setNumberOfPeople(newNum);
    const newNames = Array(newNum).fill("").map((_, i) => names[i] || "");
    setNames(newNames);
  };
  const handleNameChange = (index, name) => {
    const newNames = [...names];
    newNames[index] = name;
    setNames(newNames);
  };
  const handlePurposeChange = (selectedPurpose) => {
    setPurpose(selectedPurpose);

    // Find all authorities related to the selected purpose
    let authorities;
    if (selectedPurpose === "other") {
      authorities = [headOfOrganization];
    } else {
      authorities = authorityData.filter(auth =>
        auth.purposes.some(p => p.toLowerCase().includes(selectedPurpose.toLowerCase()))
      );
    }

    // Set all matching authorities
    setSelectedAuthority(authorities);
  };
  const handleCallAuthority = phoneNumber => {
    window.location.href = `tel:${phoneNumber}`;
  };
  const handleEntrySubmit = () => {
    if (!vehicleNumber.trim()) {
      toast({
        title: "Vehicle number required",
        description: "Please enter or scan the vehicle number",
        variant: "destructive",
      });
      return;
    }
    if (!purpose) {
      toast({
        title: "Purpose required",
        description: "Please select the purpose of visit",
        variant: "destructive",
      });
      return;
    }
    const filledNames = names.filter((name) => name.trim());
    if (filledNames.length === 0) {
      toast({
        title: "Names required",
        description: "Please enter at least one name",
        variant: "destructive",
      });
      return;
    }

    if (selectedAuthority.length > 1) {
      setShowApprovalModal(true); // Show modal for authority selection
      return;
    }

    const entryData = {
      vehicleNumber,
      names: filledNames,
      numberOfPeople,
      purpose,
      approvedBy: selectedAuthority[0]?.name || "System",
      entryTime: new Date().toISOString(),
      status: "inside",
    };
    saveVehicleEntry(entryData);
    loadVehicleLog();
    toast({
      title: "Entry Approved",
      description: `Vehicle ${vehicleNumber} has been granted entry`,
    });
    resetEntryForm();
    setActiveTab("inside");
  };
  const handleEntryReject = () => {
    if (!vehicleNumber.trim()) {
      toast({
        title: "Vehicle number required",
        description: "Please enter the vehicle number to reject",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Entry Rejected",
      description: `Entry denied for vehicle ${vehicleNumber}`,
      variant: "destructive"
    });
    resetEntryForm();
  };
  const handleVehicleExit = (vehicleId, vehicleNumber) => {
    updateVehicleExit(vehicleId);
    loadVehicleLog();
    toast({
      title: "Vehicle Exit Recorded",
      description: `Exit recorded for vehicle ${vehicleNumber}`
    });
  };
  const handleExport = async () => {
    try {
      await exportToExcel();
      toast({
        title: "Export Successful",
        description: "Vehicle history exported to Excel file"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export vehicle history",
        variant: "destructive"
      });
    }
  };
  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all vehicle history? This action cannot be undone.")) {
      clearVehicleHistory();
      setVehicleLog([]);
      toast({
        title: "History Cleared",
        description: "All vehicle history has been cleared"
      });
    }
  };
  const formatDateTime = dateString => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  const getStatusColor = status => {
    return status === 'inside' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };
  const activeVehicles = vehicleLog.filter(v => v.status === 'inside');
  const finalizeEntry = (authorityName) => {
    const entryData = {
      vehicleNumber,
      names: names.filter((name) => name.trim()),
      numberOfPeople,
      purpose,
      approvedBy: authorityName || "System",
      entryTime: new Date().toISOString(),
      status: "inside",
    };
    saveVehicleEntry(entryData);
    loadVehicleLog();
    toast({
      title: "Entry Approved",
      description: `Vehicle ${vehicleNumber} has been granted entry`,
    });
    resetEntryForm();
    setActiveTab("inside");
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Security Management App</h1>
          <p className="text-gray-600">Complete vehicle entry and security management system</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="entry" className="flex items-center space-x-2">
              <Car className="w-4 h-4" />
              <span>Entry</span>
            </TabsTrigger>
            <TabsTrigger value="inside" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Inside ({activeVehicles.length})</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>

          {/* Vehicle Entry Tab */}
          <TabsContent value="entry" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Car className="w-6 h-6 text-blue-600" />
                  <span>New Vehicle Entry</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Scanner Modal */}
                {showScanner && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Scan License Plate</h3>
                          <Button variant="outline" size="sm" onClick={() => setShowScanner(false)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <LicensePlateScanner onPlateScanned={handleLicensePlateScanned} />
                      </div>
                    </div>
                  </div>}

                {/* Vehicle Number */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Vehicle Number</Label>
                  <div className="flex space-x-2">
                    <Input value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value.toUpperCase())} className="text-lg font-mono" placeholder="Enter vehicle number" />
                    <Button variant="outline" size="sm" onClick={() => setShowScanner(true)} className="px-3">
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Number of People */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Number of People</Label>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" size="sm" onClick={() => handleNumberOfPeopleChange(numberOfPeople - 1)} disabled={numberOfPeople <= 1}>
                      -
                    </Button>
                    <div className="flex items-center space-x-2 flex-1">
                      <Users className="w-5 h-5 text-gray-500" />
                      <Input type="number" min="1" max="10" value={numberOfPeople} onChange={e => handleNumberOfPeopleChange(parseInt(e.target.value) || 1)} className="text-center text-lg" />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleNumberOfPeopleChange(numberOfPeople + 1)} disabled={numberOfPeople >= 10}>
                      +
                    </Button>
                  </div>
                </div>

                {/* Names */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Names</Label>
                  {names.map((name, index) => <Input key={index} placeholder={`Person ${index + 1} name *`} value={name} onChange={e => handleNameChange(index, e.target.value)} className="text-base" />)}
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Purpose of Visit *</Label>
                  <Select value={purpose} onValueChange={handlePurposeChange}>
                    <SelectTrigger className="text-base">
                      <SelectValue placeholder="Select purpose of visit" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePurposes.map(purposeOption => <SelectItem key={purposeOption as string} value={purposeOption as string}>
                          {(purposeOption as string).charAt(0).toUpperCase() + (purposeOption as string).slice(1)}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Authority Details */}
                {selectedAuthority && selectedAuthority.length > 0 && (
                  <div className="space-y-4">
                    {selectedAuthority.map((authority, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900">{authority.name}</h4>
                              <Button variant="outline" size="sm" onClick={() => handleCallAuthority(authority.phone)}>
                                <Phone className="w-4 h-4 mr-1" />
                                Call
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600">{authority.designation}</p>
                            <p className="text-sm text-gray-600">{authority.department}</p>
                            <p className="text-sm text-gray-600">{authority.phone}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={handleEntryReject} variant="destructive" className="flex-1 text-base h-12">
                    <X className="w-4 h-4 mr-2" />
                    Reject Entry
                  </Button>
                  <Button onClick={handleEntrySubmit} size="lg" className="flex-1 bg-green-600 hover:bg-green-700 text-base h-12">
                    <Check className="w-4 h-4 mr-2" />
                    Grant Entry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicles Inside Tab */}
          <TabsContent value="inside" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-6 h-6 text-green-600" />
                  <span>Vehicles Currently Inside ({activeVehicles.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeVehicles.length === 0 ? <div className="text-center py-8">
                    <Car className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Vehicles Inside</h3>
                    <p className="text-gray-500">All vehicles have exited or no entries recorded.</p>
                  </div> : <div className="space-y-4">
                    {activeVehicles.map(entry => <Card key={entry.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {entry.vehicleNumber}
                                </h4>
                                <Badge className="bg-green-100 text-green-800">
                                  Inside
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                <div>
                                  <strong>Names:</strong> {entry.names.join(', ')}
                                </div>
                                <div>
                                  <strong>People:</strong> {entry.numberOfPeople}
                                </div>
                                <div>
                                  <strong>Purpose:</strong> {entry.purpose}
                                </div>
                                <div>
                                  <strong>Approved by:</strong> {entry.approvedBy}
                                </div>
                                <div className="sm:col-span-2">
                                  <strong>Entry Time:</strong> {formatDateTime(entry.entryTime)}
                                </div>
                              </div>
                            </div>
                            
                            <Button onClick={() => handleVehicleExit(entry.id, entry.vehicleNumber)} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <LogOut className="w-4 h-4 mr-2" />
                              Mark Exit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>)}
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicle History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <History className="w-6 h-6 text-purple-600" />
                    <span>Vehicle History</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button onClick={handleExport} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button onClick={handleClearHistory} variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex space-x-2">
                    <Button variant={historyFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setHistoryFilter("all")}>
                      All ({vehicleLog.length})
                    </Button>
                    <Button variant={historyFilter === "active" ? "default" : "outline"} size="sm" onClick={() => setHistoryFilter("active")}>
                      Inside ({vehicleLog.filter(v => v.status === 'inside').length})
                    </Button>
                    <Button variant={historyFilter === "exited" ? "default" : "outline"} size="sm" onClick={() => setHistoryFilter("exited")}>
                      Exited ({vehicleLog.filter(v => v.status === 'exited').length})
                    </Button>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input placeholder="Search vehicles..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredLog.length === 0 ? <div className="text-center py-8">
                    <Car className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Vehicles Found</h3>
                    <p className="text-gray-500">No vehicle entries match your current filter.</p>
                  </div> : <div className="space-y-4">
                    {filteredLog.map(entry => <Card key={entry.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {entry.vehicleNumber}
                                </h4>
                                <Badge className={getStatusColor(entry.status)}>
                                  {entry.status === 'inside' ? 'Inside' : 'Exited'}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                <div>
                                  <strong>Names:</strong> {entry.names.join(', ')}
                                </div>
                                <div>
                                  <strong>People:</strong> {entry.numberOfPeople}
                                </div>
                                <div>
                                  <strong>Purpose:</strong> {entry.purpose}
                                </div>
                                <div>
                                  <strong>Approved by:</strong> {entry.approvedBy}
                                </div>
                                <div>
                                  <strong>Entry:</strong> {formatDateTime(entry.entryTime)}
                                </div>
                                <div>
                                  <strong>Exit:</strong> {entry.exitTime ? formatDateTime(entry.exitTime) : 'Still inside'}
                                </div>
                              </div>
                            </div>
                            
                            {entry.status === 'inside' && <Button onClick={() => handleVehicleExit(entry.id, entry.vehicleNumber)} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <LogOut className="w-4 h-4 mr-2" />
                                Mark Exit
                              </Button>}
                          </div>
                        </CardContent>
                      </Card>)}
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Approval Modal */}
        {showApprovalModal && (
          <Modal onClose={() => setShowApprovalModal(false)}>
            <ModalHeader>Select Approving Authority</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {selectedAuthority.map((authority, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>{authority.name} ({authority.designation})</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setApprovingAuthority(authority.name);
                        setShowApprovalModal(false);
                        finalizeEntry(authority.name);
                      }}
                    >
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            </ModalBody>
          </Modal>
        )}
      </div>
    </div>;
};
export default VehicleManager;
