"use client";

import { motion } from "framer-motion";
import {
    User,
    Bell,
    Shield,
    Palette,
    CreditCard,
    Key,
    Users,
    Mail,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account and preferences
                </p>
            </motion.div>

            {/* Settings Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 md:grid-cols-5 gap-1">
                        <TabsTrigger value="profile" className="gap-2">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Profile</span>
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2">
                            <Bell className="h-4 w-4" />
                            <span className="hidden sm:inline">Notifications</span>
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2">
                            <Shield className="h-4 w-4" />
                            <span className="hidden sm:inline">Security</span>
                        </TabsTrigger>
                        <TabsTrigger value="billing" className="gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span className="hidden sm:inline">Billing</span>
                        </TabsTrigger>
                        <TabsTrigger value="team" className="gap-2">
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">Team</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>
                                    Update your personal information and profile picture
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <Avatar className="h-20 w-20 border-2 border-border">
                                        <AvatarImage src="/avatar.png" />
                                        <AvatarFallback className="text-lg font-semibold">JD</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-2">
                                        <Button variant="outline" size="sm">
                                            Change Photo
                                        </Button>
                                        <p className="text-xs text-muted-foreground">
                                            JPG, PNG or GIF. Max 2MB.
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">First Name</label>
                                        <Input defaultValue="John" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Last Name</label>
                                        <Input defaultValue="Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email</label>
                                        <Input defaultValue="john@example.com" type="email" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Role</label>
                                        <Input defaultValue="Investor" disabled />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button>Save Changes</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>
                                    Choose what notifications you want to receive
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {[
                                    {
                                        title: "Evaluation Complete",
                                        description: "Get notified when an evaluation finishes",
                                        enabled: true,
                                    },
                                    {
                                        title: "Report Ready",
                                        description: "Receive alerts when reports are generated",
                                        enabled: true,
                                    },
                                    {
                                        title: "Weekly Summary",
                                        description: "A weekly digest of your portfolio performance",
                                        enabled: false,
                                    },
                                    {
                                        title: "Market Updates",
                                        description: "Important market trends and news",
                                        enabled: true,
                                    },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{item.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant={item.enabled ? "default" : "outline"}
                                            size="sm"
                                        >
                                            {item.enabled ? "Enabled" : "Disabled"}
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                                <CardDescription>
                                    Manage your password and security options
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30">
                                    <div className="flex items-center gap-4">
                                        <Key className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Password</p>
                                            <p className="text-sm text-muted-foreground">
                                                Last changed 30 days ago
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Change Password
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30">
                                    <div className="flex items-center gap-4">
                                        <Shield className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Two-Factor Authentication</p>
                                            <p className="text-sm text-muted-foreground">
                                                Add an extra layer of security
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">Disabled</Badge>
                                </div>

                                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30">
                                    <div className="flex items-center gap-4">
                                        <Key className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">API Keys</p>
                                            <p className="text-sm text-muted-foreground">
                                                Manage your API access keys
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Manage Keys
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Billing Tab */}
                    <TabsContent value="billing" className="space-y-6">
                        <Card className="glass-card gradient-border">
                            <CardContent className="py-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Badge className="mb-2">Pro Plan</Badge>
                                        <h3 className="text-xl font-semibold">$49/month</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Unlimited evaluations, advanced reports, API access
                                        </p>
                                    </div>
                                    <Button variant="outline">Manage Subscription</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Payment Method</CardTitle>
                                <CardDescription>
                                    Manage your payment methods
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30">
                                    <div className="flex items-center gap-4">
                                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">•••• •••• •••• 4242</p>
                                            <p className="text-sm text-muted-foreground">
                                                Expires 12/2027
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Update
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Team Tab */}
                    <TabsContent value="team" className="space-y-6">
                        <Card className="glass-card">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Team Members</CardTitle>
                                        <CardDescription>
                                            Manage your team and their permissions
                                        </CardDescription>
                                    </div>
                                    <Button>Invite Member</Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { name: "John Doe", email: "john@example.com", role: "Owner", initials: "JD" },
                                    { name: "Jane Smith", email: "jane@example.com", role: "Admin", initials: "JS" },
                                    { name: "Bob Wilson", email: "bob@example.com", role: "Member", initials: "BW" },
                                ].map((member, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10 border border-border">
                                                <AvatarFallback className="text-sm font-medium">
                                                    {member.initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{member.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {member.email}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary">{member.role}</Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </div>
    );
}
