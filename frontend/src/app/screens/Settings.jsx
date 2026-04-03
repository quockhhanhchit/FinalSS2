import { User, Bell, Lock, Wallet, Target } from "lucide-react";
import { Button } from "../components/ui/button";

export function Settings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Profile Information</h3>
            <p className="text-sm text-muted-foreground">Update your personal details</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Full Name</label>
            <input
              type="text"
              defaultValue="Nguyen Van A"
              className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Email</label>
            <input
              type="email"
              defaultValue="nguyenvana@example.com"
              className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Age</label>
              <input
                type="number"
                defaultValue="28"
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Gender</label>
              <select className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </div>

      {/* Goals Settings */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Goals & Targets</h3>
            <p className="text-sm text-muted-foreground">Adjust your weight and fitness goals</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Current Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                defaultValue="69.5"
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Goal Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                defaultValue="65.0"
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Goal Type</label>
            <select className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Lose Weight</option>
              <option>Gain Weight</option>
              <option>Maintain Weight</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline">Cancel</Button>
          <Button>Update Goals</Button>
        </div>
      </div>

      {/* Budget Settings */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Budget Settings</h3>
            <p className="text-sm text-muted-foreground">Manage your monthly budget</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Monthly Budget (VND)</label>
            <input
              type="number"
              step="100000"
              defaultValue="5000000"
              className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Food Budget (%)</label>
              <input
                type="number"
                defaultValue="70"
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Gym/Equipment (%)</label>
              <input
                type="number"
                defaultValue="30"
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline">Cancel</Button>
          <Button>Update Budget</Button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Notifications</h3>
            <p className="text-sm text-muted-foreground">Configure your notification preferences</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Daily Reminders</div>
              <div className="text-sm text-muted-foreground">Get notified about your daily tasks</div>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Weight Tracking</div>
              <div className="text-sm text-muted-foreground">Reminders to log your weight</div>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Budget Alerts</div>
              <div className="text-sm text-muted-foreground">Notifications when approaching budget limit</div>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Security</h3>
            <p className="text-sm text-muted-foreground">Manage your account security</p>
          </div>
        </div>
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
