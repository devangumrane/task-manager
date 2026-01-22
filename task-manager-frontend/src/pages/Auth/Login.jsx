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

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values) => {
    login.mutate(values, {
      onSuccess: () => {
        // Redirect AFTER Zustand token update
        navigate("/", { replace: true });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
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

            {/* SUBMIT */}
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm">
          <span className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-primary underline">
              Register
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
