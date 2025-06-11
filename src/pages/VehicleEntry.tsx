import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Phone, Check, X, Users, FileText, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LicensePlateScanner from "@/components/LicensePlateScanner";
import AuthoritySelector from "@/components/AuthoritySelector";
import { authorityData } from "@/data/authorityData";
import { saveVehicleEntry, updateVehicleExit } from "@/utils/vehicleStorage";

const VehicleEntry = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [names, setNames] = useState([""]);
  const [purpose, setPurpose] = useState("");
  const [selectedAuthority, setSelectedAuthority] = useState(null);
  const [isApproved, setIsApproved] = useState(false);

  const handleLicensePlateScanned = (plateNumber) => {
    setVehicleNumber(plateNumber);
    setStep(2);
    toast({
      title: "License plate scanned successfully",
      description: `Vehicle number: ${plateNumber}`,
    });
  };

  const handleNumberOfPeopleChange = (num) => {
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

  const handlePurposeSubmit = () => {
    if (!purpose.trim()) {
      toast({
        title: "Purpose required",
        description: "Please enter the purpose of visit",
        variant: "destructive",
      });
      return;
    }

    const filledNames = names.filter(name => name.trim());
    if (filledNames.length === 0) {
      toast({
        title: "Names required",
        description: "Please enter at least one name",
        variant: "destructive",
      });
      return;
    }

    setStep(3);
  };

  const handleCallAuthority = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleApproval = (approved, authority = null) => {
    setIsApproved(approved);
    if (approved) {
      const entryData = {
        vehicleNumber,
        names: names.filter((name) => name.trim()),
        numberOfPeople,
        purpose,
        approvedBy: authority?.name || selectedAuthority?.map((auth) => auth.name).join(", "),
        entryTime: new Date().toISOString(),
        status: "inside",
      };

      saveVehicleEntry(entryData);

      toast({
        title: "Entry Approved",
        description: `Vehicle ${vehicleNumber} has been granted entry`,
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      toast({
        title: "Entry Denied",
        description: `Vehicle ${vehicleNumber} entry has been denied`,
        variant: "destructive",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  };

  const getStepTitle = () => {
    switch(step) {
      case 1: return "Scan License Plate";
      case 2: return "Entry Details";
      case 3: return "Authority Approval";
      default: return "Vehicle Entry";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Entry</h1>
            <p className="text-sm text-gray-600">Step {step} of 3</p>
          </div>
          <div className="w-16"></div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center space-x-2">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex-1 flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNum <= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepNum}
              </div>
              {stepNum < 3 && (
                <div 
                  className={`flex-1 h-1 mx-2 ${
                    stepNum < step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: License Plate Scanner */}
        {step === 1 && (
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Camera className="w-6 h-6 text-blue-600" />
                <span>{getStepTitle()}</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Position your camera over the license plate for automatic scanning
              </p>
            </CardHeader>
            <CardContent>
              <LicensePlateScanner onPlateScanned={handleLicensePlateScanned} />
            </CardContent>
          </Card>
        )}

        {/* Step 2: Entry Details */}
        {step === 2 && (
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <span>{getStepTitle()}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vehicle Number */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Vehicle Number</Label>
                <div className="flex space-x-2">
                  <Input 
                    value={vehicleNumber} 
                    readOnly 
                    className="bg-gray-50 text-lg font-mono"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setStep(1)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Number of People */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Number of People</Label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNumberOfPeopleChange(numberOfPeople - 1)}
                    disabled={numberOfPeople <= 1}
                  >
                    -
                  </Button>
                  <div className="flex items-center space-x-2 flex-1">
                    <Users className="w-5 h-5 text-gray-500" />
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={numberOfPeople}
                      onChange={(e) => handleNumberOfPeopleChange(parseInt(e.target.value) || 1)}
                      className="text-center text-lg"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNumberOfPeopleChange(numberOfPeople + 1)}
                    disabled={numberOfPeople >= 10}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Names */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Names</Label>
                {names.map((name, index) => (
                  <Input
                    key={index}
                    placeholder={`Person ${index + 1} name *`}
                    value={name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    className="text-base"
                  />
                ))}
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Purpose of Visit *</Label>
                <Input
                  placeholder="Enter purpose of visit"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="text-base"
                />
              </div>

              <Button 
                onClick={handlePurposeSubmit} 
                className="w-full py-6 text-lg"
                size="lg"
              >
                Find Authority →
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Authority Approval */}
        {step === 3 && (
          <AuthoritySelector
            purpose={purpose}
            onAuthoritySelect={setSelectedAuthority}
            onCallAuthority={handleCallAuthority}
            onApproval={handleApproval}
          />
        )}

        {/* Success/Failure State */}
        {(isApproved !== null) && (
          <Card className={`border-2 shadow-lg ${isApproved ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <CardContent className="text-center py-8">
              {isApproved ? (
                <Check className="w-20 h-20 mx-auto text-green-600 mb-4" />
              ) : (
                <X className="w-20 h-20 mx-auto text-red-600 mb-4" />
              )}
              <h3 className={`text-2xl font-bold mb-2 ${isApproved ? 'text-green-800' : 'text-red-800'}`}>
                {isApproved ? 'Entry Approved' : 'Entry Denied'}
              </h3>
              <p className={`text-lg ${isApproved ? 'text-green-700' : 'text-red-700'}`}>
                {isApproved 
                  ? `Vehicle ${vehicleNumber} has been granted entry`
                  : `Vehicle ${vehicleNumber} entry has been denied`
                }
              </p>
              <div className="mt-4 text-sm text-gray-600">
                Redirecting to home...
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VehicleEntry;
