import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";

// ---------------------------
// Validation Schema
// ---------------------------
const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ---------------------------
// Component
// ---------------------------
export default function Register() {
  const { register: registerMutation } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = (values) => {
    if (!registerMutation) {
      console.error("❌ registerMutation is undefined — check useAuth export.");
      return;
    }

    registerMutation.mutate(values, {
      onSuccess: () => navigate("/login"),
      onError: (err) => console.error("REGISTER ERROR >>>", err),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-semibold">
            Create an Account
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            {/* NAME */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm">
          <span className="text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary underline">
              Login
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
