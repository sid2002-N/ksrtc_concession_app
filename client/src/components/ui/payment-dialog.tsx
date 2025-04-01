
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { QRCodeSVG } from "qrcode.react";

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  amount: number;
}

export function PaymentDialog({ open, onClose, amount }: PaymentDialogProps) {
  const upiUrl = `upi://pay?pa=ksrtc@sbi&pn=KSRTC%20Concession&am=${amount}&cu=INR&tn=Concession%20Pass%20Payment`;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay ₹{amount}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6">
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <QRCodeSVG value={upiUrl} size={200} />
          </div>
          <p className="text-sm text-gray-500 text-center mb-4">
            Scan this QR code with any UPI app to make payment
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
