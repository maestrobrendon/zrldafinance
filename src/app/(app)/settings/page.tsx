import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { user } from "@/lib/data";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and security settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={user.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user.email} />
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Enhance your account security.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="create-pin">Create PIN</Label>
                <p className="text-sm text-muted-foreground">
                  Use a 4-digit PIN for quick access.
                </p>
              </div>
              <Button variant="outline">Set up PIN</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="biometrics">Enable Biometrics</Label>
                <p className="text-sm text-muted-foreground">
                  Use Face ID or fingerprint for login.
                </p>
              </div>
              <Switch id="biometrics" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security.
                </p>
              </div>
               <Button variant="outline">Enable</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
