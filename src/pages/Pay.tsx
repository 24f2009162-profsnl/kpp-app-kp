import React, { useState } from 'react';
import { 
  QrCode, 
  Bike, 
  Coffee, 
  Battery, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  X,
  Users,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../services/store';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const SERVICES = [
  { id: 'canteen', name: 'Canteen Order', icon: <Coffee size={24} />, color: 'bg-orange-50 text-orange-600', desc: 'Pre-book meals at Himalaya', cost: 12.50 },
  { id: 'bike', name: 'Bicycle Sharing', icon: <Bike size={24} />, color: 'bg-blue-50 text-blue-600', desc: 'Unlock campus cycles', cost: 2.00 },
  { id: 'power', name: 'Power Bank', icon: <Battery size={24} />, color: 'bg-green-50 text-green-600', desc: 'Rent power banks', cost: 5.00 },
  { id: 'books', name: 'Book Sharing', icon: <BookOpen size={24} />, color: 'bg-purple-50 text-purple-600', desc: 'Borrow notes and books', cost: 1.00 },
];

export default function Pay() {
  const { state, addTransaction, updateBalance } = useStore();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [splitData, setSplitData] = useState({ amount: '', friends: '2' });

  React.useEffect(() => {
    if (showScanModal && isScanning) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render((decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          if (data.type === 'split_payment') {
            setSelectedService({
              id: 'qr-scan',
              name: `Pay ${data.recipient}`,
              icon: <Users size={24} />,
              color: 'bg-indigo-50 text-indigo-600',
              desc: data.note || 'QR Payment',
              cost: parseFloat(data.amount)
            });
            setIsScanning(false);
            setShowScanModal(false);
            scanner.clear();
          }
        } catch (e) {
          console.error("Invalid QR code", e);
        }
      }, (error) => {
        // console.warn(error);
      });

      return () => {
        scanner.clear().catch(error => console.error("Failed to clear scanner", error));
      };
    }
  }, [showScanModal, isScanning]);

  const handlePay = () => {
    if (selectedService) {
      setIsProcessing(true);
      setTimeout(() => {
        const pocketId = selectedService.id === 'canteen' ? 'food' : 'fun';
        updateBalance(-selectedService.cost, 0, 0, pocketId);
        addTransaction({ 
          type: 'send', 
          target: selectedService.name, 
          amount: `-${selectedService.cost.toFixed(2)} XLM`, 
          pocket: pocketId === 'food' ? 'Food' : 'Fun' 
        });
        setIsProcessing(false);
        setIsSuccess(true);
        setTimeout(() => { setIsSuccess(false); setSelectedService(null); }, 2000);
      }, 1500);
    }
  };

  const handleScan = () => {
    setIsScanning(true);
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Pay & Use</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Seamless micro-payments for campus services.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowScanModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all"
          >
            <QrCode size={20} /> Scan QR
          </button>
          <button 
            onClick={() => setShowSplitModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-900 px-6 py-4 text-sm font-black text-indigo-600 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
          >
            <Users size={20} /> Split Bill
          </button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {SERVICES.map((service) => (
          <motion.button key={service.id} whileHover={{ x: 4 }} onClick={() => setSelectedService(service)} className="flex items-center gap-5 rounded-[2rem] bg-white dark:bg-slate-900 p-5 text-left shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-xl group">
            <div className={`rounded-2xl p-5 transition-transform group-hover:scale-110 ${service.color}`}>{service.icon}</div>
            <div className="flex-1">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">{service.name}</h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{service.desc}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-slate-900 dark:text-white">{service.cost.toFixed(2)} XLM</p>
              <ArrowRight size={20} className="text-slate-200 group-hover:text-indigo-500 transition-colors ml-auto mt-1" />
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Confirm Payment</h2>
                <button onClick={() => setSelectedService(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              {isSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="mx-auto h-24 w-24 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-inner"><CheckCircle2 size={56} /></div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Payment Successful!</h3>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className={`rounded-2xl p-4 ${selectedService.color}`}>{selectedService.icon}</div>
                    <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Service</p><p className="text-xl font-black text-slate-900 dark:text-white">{selectedService.name}</p></div>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Amount to Pay</span>
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{selectedService.cost.toFixed(2)} XLM</span>
                  </div>
                  <button onClick={handlePay} disabled={isProcessing || parseFloat(state.xlm) < selectedService.cost} className="w-full rounded-2xl bg-indigo-600 py-5 font-black text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-30 active:scale-95">
                    {isProcessing ? <RefreshCw size={24} className="animate-spin" /> : 'Confirm & Pay'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSplitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  {showQR && (
                    <button onClick={() => setShowQR(false)} className="text-slate-400 hover:text-slate-600">
                      <ArrowLeft size={24} />
                    </button>
                  )}
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Split Bill</h2>
                </div>
                <button onClick={() => { setShowSplitModal(false); setShowQR(false); }} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>

              {showQR ? (
                <div className="space-y-8 text-center">
                  <div className="p-8 bg-white rounded-3xl inline-block shadow-inner mx-auto">
                    <QRCodeSVG 
                      value={JSON.stringify({
                        type: 'split_payment',
                        amount: (parseFloat(splitData.amount) / parseInt(splitData.friends)).toFixed(2),
                        recipient: state.kppId,
                        note: 'Split bill payment'
                      })}
                      size={200}
                      level="H"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-black text-slate-900 dark:text-white">
                      {(parseFloat(splitData.amount) / parseInt(splitData.friends)).toFixed(2)} XLM
                    </p>
                    <p className="text-sm font-bold text-slate-500">Scan this to pay your share to {state.studentId}</p>
                  </div>
                  <button 
                    onClick={() => { setShowSplitModal(false); setShowQR(false); }}
                    className="w-full rounded-2xl bg-indigo-600 py-5 font-black text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Amount (XLM)</label>
                    <input type="number" value={splitData.amount} onChange={e => setSplitData(d => ({ ...d, amount: e.target.value }))} placeholder="0.00" className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 text-2xl font-black outline-none border border-slate-100 dark:border-slate-700 dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Split Between</label>
                    <input 
                      type="number" 
                      min="1"
                      value={splitData.friends} 
                      onChange={e => setSplitData(d => ({ ...d, friends: Math.max(1, parseInt(e.target.value) || 1).toString() }))} 
                      className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 text-xl font-black outline-none border border-slate-100 dark:border-slate-700 dark:text-white" 
                    />
                  </div>
                  {splitData.amount && parseInt(splitData.friends) > 0 && (
                    <div className="p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-900/30 text-center">
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Each Person Pays</p>
                      <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{(parseFloat(splitData.amount) / parseInt(splitData.friends)).toFixed(2)} XLM</p>
                    </div>
                  )}
                  <button 
                    onClick={() => setShowQR(true)} 
                    disabled={!splitData.amount || parseFloat(splitData.amount) <= 0}
                    className="w-full rounded-2xl bg-indigo-600 py-5 font-black text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    Generate Split QR
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showScanModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-2xl overflow-hidden relative">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Scan QR Code</h2>
                <button onClick={() => setShowScanModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              
              <div className="aspect-square w-full rounded-3xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center relative overflow-hidden border-4 border-dashed border-slate-200 dark:border-slate-700">
                {isScanning ? (
                  <div id="reader" className="w-full h-full" />
                ) : (
                  <>
                    <QrCode size={120} className="text-slate-300 dark:text-slate-600" />
                    <button 
                      onClick={handleScan}
                      className="mt-8 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all"
                    >
                      Start Camera
                    </button>
                    <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Align QR code within the frame</p>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
