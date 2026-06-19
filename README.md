# fintrack
# Finance Tracker

A personal finance management application designed to help users track their income, manage daily expenses, and stay within strict budget limits. This tool is built to provide transparency and control over your financial health, especially for those navigating periods without a fixed income.

## Key Features

*   **Daily Budgeting:** Automatically calculates a recommended daily spending limit based on your total capital and time remaining until your next financial milestone.
*   **Transaction Tracking:** Easily log income and expenses with categories and descriptions.
*   **Budget Alerts:** Get real-time feedback when your spending exceeds your calculated daily allowance.
*   **Secure Data:** Built with a robust database architecture ensuring user data privacy and separation.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL)
*   **Deployment:** [Vercel](https://vercel.com/)

## Getting Started

1.  **Clone the repository:**
```bash
    git clone [https://github.com/yourusername/finance-tracker.git](https://github.com/yourusername/finance-tracker.git)
    ```
2.  **Install dependencies:**
```bash
    npm install
    ```
3.  **Setup Environment Variables:**
    Create a `.env.local` file and add your Supabase credentials:
```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
4.  **Run the development server:**
```bash
    npm run dev
    ```

## Contributing
Feel free to open issues or submit pull requests if you have suggestions for improvement.

---
*Built by Oumaima Abbassi*
