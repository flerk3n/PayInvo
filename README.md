# PayInvo MVP - Effortless Crypto Payments

PayInvo enables effortless crypto payments by accepting any token on any chain and delivering the exact desired token to recipients on Mantle Network.

## 🚀 Features

### Core Value Proposition
- **For Payers**: Pay with any token from any chain you have
- **For Recipients**: Receive exactly what you want on Mantle
- **For Both**: No manual bridging, swapping, or chain management

### MVP Features
1. **Invoice Creation**: Simple form to create payment requests
2. **Payment Interface**: Chain-agnostic payment page with wallet connection
3. **Cross-Chain Processing**: Automatic swap and bridge execution via LiFi SDK
4. **Status & Confirmation**: Real-time payment tracking and success confirmation

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Wallet Connection**: RainbowKit + Wagmi
- **Cross-Chain**: LiFi SDK
- **State Management**: Local Storage (MVP)
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- A WalletConnect Project ID (optional but recommended)

## 🔧 Setup Instructions

1. **Clone and Install**
   ```bash
   cd payinvo-mvp
   npm install
   ```

2. **Configure WalletConnect (Optional)**
   - Sign up at [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy your Project ID
   - Replace `YOUR_PROJECT_ID` in `src/config/wagmi.ts`

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   - Navigate to `http://localhost:3000`
   - The app will redirect to `/create` for invoice creation

## 🎯 User Flows

### Creating an Invoice
1. Visit the app (auto-redirects to `/create`)
2. Fill in recipient address, amount, target token, and description
3. Click "Generate Invoice" to create a shareable link
4. Share the invoice link with the payer

### Making a Payment
1. Open the invoice link
2. Connect your wallet using RainbowKit
3. Select source chain and token to pay with
4. Enter the amount you want to pay
5. Click "Find Payment Route" to get optimal cross-chain path
6. Review the route details and confirm payment
7. Approve and send the transaction
8. Wait for cross-chain processing to complete
9. View success confirmation with transaction details

## 🔗 Supported Networks

### Source Chains (where you can pay from)
- Ethereum Mainnet
- Polygon
- Arbitrum
- Mantle Network

### Target Chain (where recipients receive)
- Mantle Network only

### Supported Tokens
- **Source**: ETH, USDC, MATIC (varies by chain)
- **Target**: USDC, MNT, WETH (on Mantle)

## 🏗️ Project Structure

```
payinvo-mvp/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── create/            # Invoice creation page
│   │   ├── invoice/[id]/      # Dynamic payment page
│   │   ├── success/           # Payment success page
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Home page (redirects to create)
│   ├── components/            # React components
│   │   ├── WalletConnector.tsx
│   │   ├── PaymentStatus.tsx
│   │   └── Providers.tsx
│   ├── config/                # Configuration files
│   │   ├── wagmi.ts          # Wallet and chain config
│   │   └── constants.ts      # Supported chains/tokens
│   ├── lib/                   # Utility libraries
│   │   ├── lifi.ts           # LiFi SDK integration
│   │   └── storage.ts        # Local storage utilities
│   └── types/                 # TypeScript interfaces
│       └── index.ts
└── package.json
```

## 💾 Data Storage

For the MVP, all data is stored in browser localStorage:
- **Invoices**: Stored by invoice ID
- **Payments**: Stored by invoice ID
- **Persistence**: Data persists across browser sessions

### Storage Keys
- `payinvo_invoices`: All invoice data
- `payinvo_payments`: All payment records

## 🔧 Configuration

### Supported Chain Configuration
Edit `src/config/constants.ts` to modify supported chains and tokens:

```typescript
export const SUPPORTED_CHAINS = [
  // Add or modify supported source chains
]

export const TARGET_TOKENS = [
  // Modify target tokens on Mantle
]
```

### Wallet Configuration
Edit `src/config/wagmi.ts` to configure wallet connections:

```typescript
export const config = getDefaultConfig({
  appName: 'PayInvo',
  projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect project ID
  chains: [mainnet, polygon, arbitrum, mantle],
  ssr: true,
})
```

## 🚦 API Integration

### LiFi SDK
The app integrates with LiFi SDK for cross-chain routing:
- Route calculation
- Transaction building
- Status tracking
- Bridge selection

### Key Functions
- `getRoutes()`: Find optimal cross-chain paths
- `getStepTransaction()`: Prepare transaction data
- `getTransactionStatus()`: Track payment progress

## 🎨 UI/UX Features

- **Mobile Responsive**: Works on all device sizes
- **Real-time Updates**: Live payment status tracking
- **Modern Design**: Clean, professional interface
- **Loading States**: Smooth animations and feedback
- **Error Handling**: Clear error messages and recovery options

## 🧪 Testing the App

### Test Flow
1. **Create Invoice**: Use any valid Ethereum address
2. **Share Link**: Copy the generated invoice URL
3. **Connect Wallet**: Use MetaMask or supported wallet
4. **Mock Payment**: The UI will show routing and processing
5. **View Results**: Check success page and transaction details

### Demo Mode
Since this is an MVP, some features are simulated:
- Payment status progression (automatic demo progression)
- Transaction validation (basic checks only)
- Cross-chain routing (uses real LiFi SDK)

## 🔒 Security Considerations

### Current MVP Limitations
- Local storage only (data not encrypted)
- Basic input validation
- No authentication system
- Client-side route calculation

### Production Recommendations
- Implement backend API for invoice storage
- Add user authentication
- Enhanced security validation
- Rate limiting and abuse prevention

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Environment Variables
For production, set these environment variables:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Your WalletConnect project ID

## 🛣️ Roadmap

### Phase 1 (Current MVP)
- ✅ Basic invoice creation
- ✅ Cross-chain payment interface
- ✅ LiFi SDK integration
- ✅ Payment status tracking

### Phase 2 (Next Steps)
- Backend API integration
- User accounts and authentication
- Payment history dashboard
- Advanced routing options
- Fee calculation and display

### Phase 3 (Future)
- Multi-recipient invoices
- Subscription payments
- API for developers
- Mobile app
- Advanced analytics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **LiFi Protocol**: For cross-chain infrastructure
- **RainbowKit**: For wallet connection
- **Mantle Network**: For the target blockchain
- **Tailwind CSS**: For styling utilities

## 📞 Support

For questions or support, please open an issue in the GitHub repository.

---

**PayInvo** - Making crypto payments effortless across all chains! 🚀
