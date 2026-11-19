import Razorpay from 'razorpay';
import Vars from '@/config/var.js';

const razorpay = new Razorpay({
  key_id: Vars.razorpay.keyId,
  key_secret: Vars.razorpay.keySecret,
});

export default razorpay;
