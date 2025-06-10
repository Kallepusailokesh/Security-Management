
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, Scan, RotateCcw, Edit3, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Tesseract from 'tesseract.js';

const LicensePlateScanner = ({ onPlateScanned }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannedText, setScannedText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 }
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please try uploading an image instead.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        setCapturedImage(URL.createObjectURL(blob));
        processImage(blob);
        stopCamera();
      }, 'image/jpeg', 0.9);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCapturedImage(URL.createObjectURL(file));
      processImage(file);
    }
  };

  const preprocessImage = (canvas, ctx) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert to grayscale and increase contrast
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      // Increase contrast
      const contrast = gray > 128 ? 255 : 0;
      data[i] = contrast;     // Red
      data[i + 1] = contrast; // Green
      data[i + 2] = contrast; // Blue
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };

  const processImage = async (imageBlob) => {
    setIsScanning(true);
    try {
      // Create a canvas for preprocessing
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Preprocess the image
        const processedCanvas = preprocessImage(canvas, ctx);
        
        // Convert to blob for Tesseract
        processedCanvas.toBlob(async (processedBlob) => {
          const { data: { text } } = await Tesseract.recognize(
            processedBlob,
            'eng',
            {
              logger: m => console.log(m)
            }
          );

          console.log('Raw OCR text:', text);
          const processedPlate = extractLicensePlate(text);
          
          if (processedPlate) {
            setScannedText(processedPlate);
            setEditText(processedPlate);
            toast({
              title: "License Plate Detected",
              description: `Detected: ${processedPlate}`,
            });
          } else {
            setScannedText("");
            setEditText("");
            toast({
              title: "No License Plate Found",
              description: "Please try again with a clearer image or edit manually.",
              variant: "destructive",
            });
          }
          setIsScanning(false);
        }, 'image/jpeg', 0.9);
      };
      img.src = URL.createObjectURL(imageBlob);
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: "Scanning Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const extractLicensePlate = (text) => {
    // Enhanced Indian license plate pattern matching
    const platePatterns = [
      /[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}/g, // Standard format
      /[A-Z]{2}\s*[0-9]{1,2}\s*[A-Z]{1,3}\s*[0-9]{1,4}/g, // With spaces
      /[A-Z]{2}-[0-9]{1,2}-[A-Z]{1,3}-[0-9]{1,4}/g, // With dashes
    ];
    
    for (const pattern of platePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        return matches[0].replace(/[\s-]/g, '');
      }
    }
    
    // Enhanced fallback processing
    const cleanText = text.replace(/[^A-Z0-9]/g, '');
    if (cleanText.length >= 6 && cleanText.length <= 12) {
      return cleanText.substring(0, 10);
    }
    
    return null;
  };

  const handleEditConfirm = () => {
    if (editText.trim()) {
      setScannedText(editText.trim().toUpperCase());
      setIsEditing(false);
      onPlateScanned(editText.trim().toUpperCase());
    }
  };

  const handleEditCancel = () => {
    setEditText(scannedText);
    setIsEditing(false);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setScannedText("");
    setEditText("");
    setIsEditing(false);
    startCamera();
  };

  const resetScanner = () => {
    setCapturedImage(null);
    setScannedText("");
    setEditText("");
    setIsEditing(false);
    stopCamera();
  };

  const handleUseScanned = () => {
    if (scannedText) {
      onPlateScanned(scannedText);
    }
  };

  return (
    <div className="space-y-4">
      {!capturedImage ? (
        <div className="space-y-4">
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-lg">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Camera overlay guide */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-white/70 rounded-lg w-4/5 h-1/2 flex items-center justify-center">
                <div className="text-white text-center space-y-2">
                  <div className="text-sm font-medium">Position license plate here</div>
                  <div className="text-xs opacity-75">Ensure good lighting</div>
                </div>
              </div>
            </div>

            {/* Camera controls overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex justify-center space-x-4">
                {!isCameraActive ? (
                  <Button 
                    onClick={startCamera} 
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <Button 
                    onClick={capturePhoto} 
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  >
                    <Scan className="w-5 h-5 mr-2" />
                    Capture
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">Or upload an image</p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 text-base"
                size="lg"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload License Plate Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img 
              src={capturedImage} 
              alt="Captured license plate" 
              className="w-full rounded-xl shadow-lg" 
            />
            {isScanning && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 text-center shadow-xl">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-lg font-medium text-gray-900">Scanning license plate...</p>
                  <p className="text-sm text-gray-600 mt-1">Please wait...</p>
                </div>
              </div>
            )}
          </div>

          {/* Scanned result */}
          {scannedText && !isScanning && (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Detected License Plate:</label>
                {!isEditing ? (
                  <div className="flex space-x-2">
                    <Input 
                      value={scannedText} 
                      readOnly 
                      className="bg-gray-50 text-lg font-mono"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setIsEditing(true);
                        setEditText(scannedText);
                      }}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Input 
                      value={editText}
                      onChange={(e) => setEditText(e.target.value.toUpperCase())}
                      className="text-lg font-mono"
                      placeholder="Enter license plate number"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleEditConfirm}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleEditCancel}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              {!isEditing && (
                <Button 
                  onClick={handleUseScanned} 
                  className="w-full py-3"
                  size="lg"
                >
                  Use This Number
                </Button>
              )}
            </div>
          )}
          
          <div className="flex space-x-3">
            <Button 
              onClick={retakePhoto} 
              variant="outline" 
              className="flex-1 py-3"
              disabled={isScanning}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Photo
            </Button>
            <Button 
              onClick={resetScanner} 
              variant="secondary" 
              className="flex-1 py-3"
              disabled={isScanning}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload New
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicensePlateScanner;
