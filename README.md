# THORBond

A web interface for THORChain node operators to publish bonding opportunities and for users to request whitelisting.

## Overview

This platform facilitates the bonding process in the THORChain ecosystem by connecting node operators with potential bonders. Node operators can create listings with their bonding requirements, and users can request to be whitelisted for bonding.

### Key Features

- **For Node Operators:**
  - Create and manage bonding listings
  - Set minimum bond amounts, fee percentages, and bonding capacity
  - Review and approve/reject whitelist requests
  - Dashboard with key metrics and request management

- **For Users:**
  - Browse available node operators
  - Filter and sort operators by various criteria
  - Submit whitelist requests with contact information
  - Track request status

## Technology Stack

- **Frontend:** React with TypeScript
- **Styling:** Tailwind CSS
- **Form Handling:** React Hook Form with Zod validation
- **Icons:** Lucide React
- **Build Tool:** Vite

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/thorchain-node-operator-bonding.git
   cd thorchain-node-operator-bonding
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/         # UI components
│   ├── dashboard/      # Dashboard components
│   ├── layout/         # Layout components
│   ├── node-operators/ # Node operator components
│   ├── requests/       # Request components
│   └── ui/             # Reusable UI components
├── lib/                # Utility functions and mock data
├── pages/              # Page components
├── types/              # TypeScript type definitions
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Usage

### For Node Operators

1. Connect your wallet
2. Navigate to the Operator Dashboard
3. Create a new listing with your bonding requirements
4. Review and manage whitelist requests

### For Users

1. Connect your wallet
2. Browse available node operators on the Node Operators page
3. Filter and sort to find suitable operators
4. Submit a whitelist request
5. Track your request status on the My Requests page

## Future Enhancements

- Integration with THORChain wallet providers
- Real-time notifications for request status changes
- Enhanced analytics for node operators
- Multi-language support
- Mobile application

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- THORChain community
- React and Tailwind CSS teams
- All contributors to this project
