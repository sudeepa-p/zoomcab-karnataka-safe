import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Smartphone, CreditCard, Banknote, Copy, QrCode } from "lucide-react";
import { toast } from "sonner";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (transactionId: string, status: "success" | "pending") => void;
  paymentMethod: string;
  amount: number;
  passengerName: string;
}

// Generate mock transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN${timestamp}${random}`;
};

export const PaymentModal = ({
  isOpen,
  onClose,
  onPaymentComplete,
  paymentMethod,
  amount,
  passengerName
}: PaymentModalProps) => {
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  
  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  // UPI state
  const [upiConfirmed, setUpiConfirmed] = useState(false);

  const mockUpiId = "zoomgo@ybl";

  const resetState = () => {
    setProcessing(false);
    setPaymentSuccess(false);
    setTransactionId("");
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setCardName("");
    setCardErrors({});
    setUpiConfirmed(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Validate card number (Luhn algorithm simplified)
  const validateCardNumber = (num: string): boolean => {
    const cleaned = num.replace(/\s/g, "");
    return /^\d{16}$/.test(cleaned);
  };

  // Validate expiry date
  const validateExpiryDate = (date: string): boolean => {
    if (!/^\d{2}\/\d{2}$/.test(date)) return false;
    const [month, year] = date.split("/").map(Number);
    if (month < 1 || month > 12) return false;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) return false;
    return true;
  };

  // Validate CVV
  const validateCvv = (cvvNum: string): boolean => {
    return /^\d{3,4}$/.test(cvvNum);
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "").substring(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "").substring(0, 4);
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
    }
    return cleaned;
  };

  // Handle Cash Payment - Immediate confirmation with pending status
  const handleCashPayment = () => {
    setProcessing(true);
    const txnId = generateTransactionId();
    setTransactionId(txnId);
    
    // Simulate brief processing
    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);
      toast.success("Booking confirmed! Pay cash to driver after ride.");
      
      setTimeout(() => {
        onPaymentComplete(txnId, "pending");
        handleClose();
      }, 1500);
    }, 1000);
  };

  // Handle UPI Payment - Show QR/UPI ID, wait for confirmation
  const handleUpiPayment = () => {
    if (!upiConfirmed) {
      toast.error("Please confirm that you have made the payment");
      return;
    }

    setProcessing(true);
    const txnId = generateTransactionId();
    setTransactionId(txnId);

    // Simulate payment verification
    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);
      toast.success("UPI payment verified successfully!");
      
      setTimeout(() => {
        onPaymentComplete(txnId, "success");
        handleClose();
      }, 1500);
    }, 2000);
  };

  // Handle Card Payment - Validate and process
  const handleCardPayment = () => {
    const errors: Record<string, string> = {};

    if (!validateCardNumber(cardNumber)) {
      errors.cardNumber = "Please enter a valid 16-digit card number";
    }
    if (!validateExpiryDate(expiryDate)) {
      errors.expiryDate = "Please enter a valid expiry date (MM/YY)";
    }
    if (!validateCvv(cvv)) {
      errors.cvv = "Please enter a valid CVV (3-4 digits)";
    }
    if (!cardName.trim()) {
      errors.cardName = "Please enter the cardholder name";
    }

    setCardErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setProcessing(true);
    const txnId = generateTransactionId();
    setTransactionId(txnId);

    // Simulate payment gateway communication
    setTimeout(() => {
      // Simulate bank verification
      setTimeout(() => {
        setProcessing(false);
        setPaymentSuccess(true);
        toast.success("Card payment successful!");
        
        setTimeout(() => {
          onPaymentComplete(txnId, "success");
          handleClose();
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(mockUpiId);
    toast.success("UPI ID copied to clipboard!");
  };

  const getPaymentIcon = () => {
    switch (paymentMethod) {
      case "cash":
        return <Banknote className="h-6 w-6 text-green-600" />;
      case "phone_pay":
      case "google_pay":
      case "upi":
        return <Smartphone className="h-6 w-6 text-purple-600" />;
      case "debit_card":
        return <CreditCard className="h-6 w-6 text-blue-600" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getPaymentTitle = () => {
    switch (paymentMethod) {
      case "cash":
        return "Cash on Ride";
      case "phone_pay":
        return "PhonePe Payment";
      case "google_pay":
        return "Google Pay Payment";
      case "upi":
        return "UPI Payment";
      case "debit_card":
        return "Debit Card Payment";
      default:
        return "Payment";
    }
  };

  // Success Screen
  if (paymentSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600">
              {paymentMethod === "cash" ? "Booking Confirmed!" : "Payment Successful!"}
            </h2>
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                {paymentMethod === "cash" 
                  ? "Pay ₹" + Math.round(amount) + " to driver after ride completion"
                  : "Your payment of ₹" + Math.round(amount) + " has been processed"
                }
              </p>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Transaction ID</p>
                <p className="font-mono font-semibold">{transactionId}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getPaymentIcon()}
            {getPaymentTitle()}
          </DialogTitle>
          <DialogDescription>
            Complete your payment of ₹{Math.round(amount)} for {passengerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amount Display */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Amount to Pay</span>
              <span className="text-2xl font-bold text-primary">₹{Math.round(amount)}</span>
            </div>
          </Card>

          {/* Cash Payment */}
          {paymentMethod === "cash" && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">Cash Payment Instructions</h3>
                <ul className="text-sm text-green-600 dark:text-green-300 space-y-1">
                  <li>• Your booking will be confirmed immediately</li>
                  <li>• Payment status will be marked as "Pending"</li>
                  <li>• Pay ₹{Math.round(amount)} directly to the driver</li>
                  <li>• Payment will be marked "Paid" after ride completion</li>
                </ul>
              </div>
              <Badge variant="outline" className="w-full justify-center py-2">
                No online transaction required
              </Badge>
              <Button 
                onClick={handleCashPayment} 
                className="w-full" 
                size="lg"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming Booking...
                  </>
                ) : (
                  "Confirm Cash Payment"
                )}
              </Button>
            </div>
          )}

          {/* UPI Payment (PhonePe, Google Pay, UPI) */}
          {(paymentMethod === "phone_pay" || paymentMethod === "google_pay" || paymentMethod === "upi") && (
            <div className="space-y-4">
              <div className="text-center space-y-4">
                {/* Mock QR Code */}
                <div className="mx-auto w-48 h-48 bg-white border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="h-24 w-24 mx-auto text-muted-foreground" />
                    <p className="text-xs text-muted-foreground mt-2">Scan QR to Pay</p>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">OR</div>

                {/* UPI ID */}
                <div className="flex items-center justify-center gap-2 bg-muted p-3 rounded-lg">
                  <span className="font-mono font-semibold">{mockUpiId}</span>
                  <Button variant="ghost" size="icon" onClick={copyUpiId}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Pay ₹{Math.round(amount)} to the above UPI ID using{" "}
                  {paymentMethod === "phone_pay" ? "PhonePe" : paymentMethod === "google_pay" ? "Google Pay" : "any UPI app"}
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <input
                  type="checkbox"
                  id="upiConfirm"
                  checked={upiConfirmed}
                  onChange={(e) => setUpiConfirmed(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="upiConfirm" className="text-sm text-yellow-700 dark:text-yellow-300 cursor-pointer">
                  I have made the payment of ₹{Math.round(amount)}
                </label>
              </div>

              <Button 
                onClick={handleUpiPayment} 
                className="w-full" 
                size="lg"
                disabled={processing || !upiConfirmed}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying Payment...
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                * This is a simulated payment for academic purposes
              </p>
            </div>
          )}

          {/* Debit Card Payment */}
          {paymentMethod === "debit_card" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className={cardErrors.cardNumber ? "border-destructive" : ""}
                  />
                  {cardErrors.cardNumber && (
                    <p className="text-xs text-destructive mt-1">{cardErrors.cardNumber}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="JOHN DOE"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    className={cardErrors.cardName ? "border-destructive" : ""}
                  />
                  {cardErrors.cardName && (
                    <p className="text-xs text-destructive mt-1">{cardErrors.cardName}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      maxLength={5}
                      className={cardErrors.expiryDate ? "border-destructive" : ""}
                    />
                    {cardErrors.expiryDate && (
                      <p className="text-xs text-destructive mt-1">{cardErrors.expiryDate}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      type="password"
                      placeholder="***"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").substring(0, 4))}
                      maxLength={4}
                      className={cardErrors.cvv ? "border-destructive" : ""}
                    />
                    {cardErrors.cvv && (
                      <p className="text-xs text-destructive mt-1">{cardErrors.cvv}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  🔒 Your card details are secure. This is a simulated payment gateway for academic demonstration.
                </p>
              </div>

              <Button 
                onClick={handleCardPayment} 
                className="w-full" 
                size="lg"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  `Pay ₹${Math.round(amount)}`
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                * No real transaction will be made. This is for demonstration only.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
