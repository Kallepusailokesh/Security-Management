
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Car, History, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2 pt-8">
          <Shield className="w-16 h-16 mx-auto text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Entry App</h1>
          <p className="text-gray-600">Secure gate management system</p>
        </div>

        <div className="space-y-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/vehicle-entry")}>
            <CardHeader className="text-center">
              <Car className="w-12 h-12 mx-auto text-green-600" />
              <CardTitle className="text-xl">New Vehicle Entry</CardTitle>
              <CardDescription>Scan license plate and process entry</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                Start Entry Process
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/vehicle-history")}>
            <CardHeader className="text-center">
              <History className="w-12 h-12 mx-auto text-purple-600" />
              <CardTitle className="text-xl">Vehicle History</CardTitle>
              <CardDescription>View and manage entry records</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" size="lg">
                View History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
