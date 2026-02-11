"use client";

import { motion } from "framer-motion";
import { FileText, Save, Upload, Users, Rocket, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function EditStartupPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Startup Profile</h1>
                    <p className="text-muted-foreground">
                        Manage your startup's information and pitch materials
                    </p>
                </div>
                <div className="ml-auto">
                    <Button className="glow-sm">
                        <Save className="h-4 w-4 mr-2" /> Save Changes
                    </Button>
                </div>
            </div>

            {/* Main Form */}
            <div className="grid gap-8">
                {/* Pitch Deck Section */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Pitch Deck
                        </CardTitle>
                        <CardDescription>
                            Upload your latest pitch deck for AI evaluation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-colors cursor-pointer group">
                            <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors mb-4">
                                <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <p className="font-medium">Drag and drop your PDF here</p>
                            <p className="text-sm text-muted-foreground mt-1">or click to browse files (Max 20MB)</p>
                            <Button variant="secondary" className="mt-4">
                                Select File
                            </Button>
                        </div>
                        <div className="mt-4 flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                            <FileText className="h-4 w-4 text-primary" />
                            <div className="flex-1 text-sm">
                                <p className="font-medium">Pitch_Deck_v3.pdf</p>
                                <p className="text-muted-foreground">Uploaded 2 days ago • 4.2 MB</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                Remove
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Basic Info */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Rocket className="h-5 w-5 text-primary" />
                            Startup Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Startup Name</Label>
                                <Input id="name" defaultValue="TechFlow AI" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input id="website" defaultValue="https://techflow.ai" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">One-Line Pitch</Label>
                            <Input id="description" defaultValue="Generative AI workflow automation for enterprise" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="about">About</Label>
                            <Textarea
                                id="about"
                                rows={4}
                                defaultValue="TechFlow AI automates complex enterprise workflows using agents..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Team */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Team
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            Team management features coming soon.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
