import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, HandCoins, Wallet, Scale, CheckCircle, Info, Landmark } from "lucide-react";
import { Link } from "react-router-dom";
import { useBusiness } from "@/state/businessStore";
import { formatNaira } from "@/lib/utils";
import { calculateDailySummary, calculateCurrentCashBalance } from "@/lib/calculations";
import { Separator } from "@/components/ui/separator";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import DebtReminders from "@/components/dashboard/DebtReminders";
import WeekOverWeekSalesCard from "@/components/dashboard/WeekOverWeekSalesCard";
import TotalOutstandingDebtsCard from "@/components/dashboard/TotalOutstandingDebtsCard";
import MonthlyOverviewCard from "@/components/dashboard/MonthlyOverviewCard";
import TopSellingItemsCard from "@/components/dashboard/TopSellingItemsCard"; // Import new component
import { cn } from "@/lib/utils";

const Index = () => {
  const { state } = useBusiness();
  const today = new Date();
  const { totalSales, totalExpenses, profitLoss } = calculateDailySummary(state.sales, state.expenses, today);
  const currentCashBalance = calculateCurrentCashBalance(state.sales, state.expenses);

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <HandCoins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNaira(totalSales)}</div>
              <p className="text-xs text-muted-foreground">Total sales for today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Expenses</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNaira(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">Total expenses for today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Profit/Loss</CardTitle>
              {profitLoss >= 0 ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-red-500">✕</span>
              )}
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", profitLoss >= 0 ? "text-green-600" : "text-red-600")}>
                {formatNaira(profitLoss)}
              </div>
              <p className="text-xs text-muted-foreground">Sales minus expenses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Cash Balance</CardTitle>
              <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", currentCashBalance >= 0 ? "text-green-600" : "text-red-600")}>
                {formatNaira(currentCashBalance)}
              </div>
              <p className="text-xs text-muted-foreground">Cash-in minus total expenses</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/sales">
              <Button className="w-full h-20 text-lg flex flex-col items-center justify-center">
                <PlusCircle className="h-6 w-6 mb-2" /> Add Sale
              </Button>
            </Link>
            <Link to="/expenses">
              <Button className="w-full h-20 text-lg flex flex-col items-center justify-center">
                <PlusCircle className="h-6 w-6 mb-2" /> Add Expense
              </Button>
            </Link>
            <Link to="/debts">
              <Button className="w-full h-20 text-lg flex flex-col items-center justify-center">
                <PlusCircle className="h-6 w-6 mb-2" /> Record Debt
              </Button>
            </Link>
          </div>
        </div>

        {/* New Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyOverviewCard />
          <WeekOverWeekSalesCard />
          <RecentTransactions />
          <DebtReminders />
          <TotalOutstandingDebtsCard />
          <TopSellingItemsCard /> {/* Add the new card here */}
        </div>
      </div>
    </div>
  );
};

export default Index;