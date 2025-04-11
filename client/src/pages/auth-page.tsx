import { useState } from "react";
import { Link, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Lock, Mail, Image, Eye, EyeOff } from "lucide-react";
import { PlantIcon, DropIcon, SunIcon, LeafIcon } from "@/utils/icons";

// Add client-side validation to the schemas
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = insertUserSchema
  .extend({
    password: z.string().min(6, "Password must be at least 6 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    profilePicture: z.any().optional(),
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [_, navigate] = useLocation();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      email: "",
      profilePicture: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        // Update the form value
        registerForm.setValue("profilePicture", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    // Include the profile image in the form data
    const formData = {
      ...data,
      profilePicture: profileImage
    };
    
    registerMutation.mutate(formData, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="flex-1 p-8 flex justify-center items-center">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <PlantIcon className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">PlantCare</h1>
            <p className="text-muted-foreground">Care for your plants, simply and smartly</p>
          </div>

          <Tabs value={tab} onValueChange={(value) => setTab(value as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login to your account</CardTitle>
                  <CardDescription>Enter your credentials to access your plants</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input className="pl-10" placeholder="username" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  className="pl-10 pr-10" 
                                  type={showLoginPassword ? "text" : "password"} 
                                  placeholder="••••••" 
                                  {...field} 
                                />
                                <button 
                                  type="button"
                                  className="absolute right-3 top-2.5 text-muted-foreground"
                                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                                >
                                  {showLoginPassword ? (
                                    <Eye className="h-5 w-5" />
                                  ) : (
                                    <EyeOff className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Sign In
                      </Button>
                      {loginMutation.error && (
                        <p className="text-destructive text-sm mt-2">{loginMutation.error.message}</p>
                      )}
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button 
                      className="text-primary underline" 
                      onClick={() => setTab("register")}
                    >
                      Register
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>Start caring for your plants today</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input className="pl-10" placeholder="name@example.com" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input className="pl-10" placeholder="username" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  className="pl-10 pr-10" 
                                  type={showRegisterPassword ? "text" : "password"} 
                                  placeholder="••••••" 
                                  {...field} 
                                />
                                <button 
                                  type="button"
                                  className="absolute right-3 top-2.5 text-muted-foreground"
                                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                >
                                  {showRegisterPassword ? (
                                    <Eye className="h-5 w-5" />
                                  ) : (
                                    <EyeOff className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="profilePicture"
                        render={({ field: { value, onChange, ...field } }) => (
                          <FormItem>
                            <FormLabel>Profile Picture</FormLabel>
                            <div className="flex flex-col gap-4">
                              {profileImage && (
                                <div className="flex justify-center">
                                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary">
                                    <img 
                                      src={profileImage} 
                                      alt="Profile Preview" 
                                      className="w-full h-full object-cover" 
                                    />
                                  </div>
                                </div>
                              )}
                              <FormControl>
                                <div className="relative">
                                  <Image className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  <Input 
                                    type="file"
                                    accept="image/*"
                                    className="pl-10 pt-2 cursor-pointer file:mr-4 file:py-2 file:px-4
                                     file:rounded-md file:border-0
                                     file:text-sm file:font-semibold
                                     file:bg-primary file:text-white
                                     hover:file:bg-primary/90"
                                    onChange={handleFileChange}
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                            </div>
                            <FormDescription className="text-xs">
                              Choose a profile picture from your device (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                        {registerMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Create Account
                      </Button>
                      {registerMutation.error && (
                        <p className="text-destructive text-sm mt-2">{registerMutation.error.message}</p>
                      )}
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button 
                      className="text-primary underline" 
                      onClick={() => setTab("login")}
                    >
                      Login
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 bg-gradient-to-br from-primary/80 to-primary p-8 text-white hidden md:flex md:flex-col md:justify-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-4xl font-bold mb-6">Your Plant Care Assistant</h2>
          <p className="text-xl mb-8">Track, schedule, and monitor your plants for the perfect growing environment.</p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="rounded-full bg-white/20 p-3 mr-4">
                <DropIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Smart Watering</h3>
                <p className="text-white/80">Personalized schedules based on each plant's needs</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="rounded-full bg-white/20 p-3 mr-4">
                <SunIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Light Analysis</h3>
                <p className="text-white/80">Optimize light conditions for your plants</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="rounded-full bg-white/20 p-3 mr-4">
                <LeafIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Plant Scanner</h3>
                <p className="text-white/80">Identify issues and get care advice for your plants</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}