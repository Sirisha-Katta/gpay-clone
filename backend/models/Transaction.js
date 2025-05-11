// ...existing code...

const transactionSchema = new mongoose.Schema({
  sender_id: { type: String, required: true },
  receiver_id: { type: String, required: true },
  amount: { type: Number, required: true },
  label: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }, // Add timestamp field
});

// ...existing code...
