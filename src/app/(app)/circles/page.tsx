import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CirclesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Social Circles</h1>
        <p className="text-muted-foreground">
          Collaborate on financial goals with friends and family.
        </p>
      </div>
       <Card>
        <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">The Social Circles feature for group savings and expense splitting is under construction. We're excited to bring you a new way to manage finances together. Check back soon!</p>
        </CardContent>
      </Card>
    </div>
  );
}
