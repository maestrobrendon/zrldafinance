import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { sharedExpenses } from "@/lib/data";

export default function SharedExpenses() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared Expenses</CardTitle>
        <CardDescription>
          Your portion of expenses from social circles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Circle</TableHead>
              <TableHead className="text-right">Your Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sharedExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  <div className="font-medium">{expense.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {expense.date}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{expense.circle}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(expense.yourShare)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
