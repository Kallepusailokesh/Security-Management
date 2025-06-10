
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Check, X, User } from "lucide-react";
import { authorityData } from "@/data/authorityData";

const AuthoritySelector = ({ purpose, onAuthoritySelect, onCallAuthority, onApproval }) => {
  const [relevantAuthorities, setRelevantAuthorities] = useState([]);
  const [selectedAuthority, setSelectedAuthority] = useState(null);

  useEffect(() => {
    // Find authorities based on purpose
    const authorities = authorityData.filter(authority =>
      authority.purposes.some(p => 
        p.toLowerCase().includes(purpose.toLowerCase()) ||
        purpose.toLowerCase().includes(p.toLowerCase())
      )
    );
    setRelevantAuthorities(authorities);
    
    if (authorities.length === 1) {
      setSelectedAuthority(authorities[0]);
      onAuthoritySelect(authorities[0]);
    }
  }, [purpose, onAuthoritySelect]);

  const handleAuthoritySelect = (authority) => {
    setSelectedAuthority(authority);
    onAuthoritySelect(authority);
  };

  if (relevantAuthorities.length === 0) {
    return (
      <Card className="border-yellow-500 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">No Authority Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700 mb-4">
            No relevant authority found for purpose: "{purpose}"
          </p>
          <div className="flex space-x-2">
            <Button onClick={() => onApproval(false)} variant="destructive" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Deny Entry
            </Button>
            <Button onClick={() => onApproval(true)} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Manual Approval
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Relevant Authorities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {relevantAuthorities.map((authority) => (
            <Card
              key={authority.id}
              className={`cursor-pointer transition-colors ${
                selectedAuthority?.id === authority.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleAuthoritySelect(authority)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4" />
                      <h4 className="font-semibold">{authority.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{authority.designation}</p>
                    <p className="text-sm text-gray-600 mb-2">{authority.department}</p>
                    <p className="text-sm font-medium mb-2">📞 {authority.phone}</p>
                    <p className="text-sm text-gray-600 mb-2">📧 {authority.email}</p>
                    <div className="flex flex-wrap gap-1">
                      {authority.purposes.map((purpose, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {purpose}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {selectedAuthority && (
        <Card className="border-blue-500 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Contact Authority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <h4 className="font-semibold text-blue-800">{selectedAuthority.name}</h4>
              <p className="text-blue-600">{selectedAuthority.designation}</p>
            </div>
            
            <Button
              onClick={() => onCallAuthority(selectedAuthority.phone)}
              className="w-full"
              variant="outline"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call {selectedAuthority.name}
            </Button>

            <div className="flex space-x-2">
              <Button 
                onClick={() => onApproval(false, selectedAuthority)} 
                variant="destructive" 
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Deny Entry
              </Button>
              <Button 
                onClick={() => onApproval(true, selectedAuthority)} 
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                Approve Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuthoritySelector;
