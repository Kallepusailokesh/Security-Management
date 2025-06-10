import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Trash2, LogOut, Search, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getVehicleLog, 
  clearVehicleHistory, 
  exportToExcel, 
  updateVehicleExit,
  getActiveVehicles 
} from "@/utils/vehicleStorage";

const VehicleHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vehicleLog, setVehicleLog] = useState([]);
  const [filteredLog, setFilteredLog] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadVehicleLog();
  }, []);

  useEffect(() => {
    filterLog();
  }, [vehicleLog, searchTerm, activeTab]);

  const loadVehicleLog = () => {
    const log = getVehicleLog();
    setVehicleLog(log.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()));
  };

  const filterLog = () => {
    let filtered = vehicleLog;

    if (activeTab === "active") {
      filtered = filtered.filter(entry => entry.status === 'inside');
    } else if (activeTab === "exited") {
      filtered = filtered.filter(entry => entry.status === 'exited');
    }

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.names.some(name => name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        entry.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLog(filtered);
  };

  const handleExport = async () => {
    try {
      await exportToExcel();
      toast({
        title: "Export Successful",
        description: "Vehicle history exported to Excel file",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export vehicle history",
        variant: "destructive",
      });
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all vehicle history? This action cannot be undone.")) {
      clearVehicleHistory();
      setVehicleLog([]);
      toast({
        title: "History Cleared",
        description: "All vehicle history has been cleared",
      });
    }
  };

  const handleVehicleExit = (vehicleId, vehicleNumber) => {
    updateVehicleExit(vehicleId);
    loadVehicleLog();
    toast({
      title: "Vehicle Exit Recorded",
      description: `Exit recorded for vehicle ${vehicleNumber}`,
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    return status === 'inside' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Vehicle History</h1>
          </div>
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

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex space-x-2">
                <Button
                  variant={activeTab === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("all")}
                >
                  All ({vehicleLog.length})
                </Button>
                <Button
                  variant={activeTab === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("active")}
                >
                  Inside ({vehicleLog.filter(v => v.status === 'inside').length})
                </Button>
                <Button
                  variant={activeTab === "exited" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("exited")}
                >
                  Exited ({vehicleLog.filter(v => v.status === 'exited').length})
                </Button>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredLog.length === 0 ? (
              <div className="text-center py-8">
                <Car className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Vehicles Found</h3>
                <p className="text-gray-500">No vehicle entries match your current filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLog.map((entry) => (
                  <Card key={entry.id} className="border-l-4 border-l-blue-500">
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
                        
                        {entry.status === 'inside' && (
                          <Button
                            onClick={() => handleVehicleExit(entry.id, entry.vehicleNumber)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Mark Exit
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehicleHistory;
