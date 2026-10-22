import { Button } from "@capstone-src/ui/components/button";
import { Input } from "@capstone-src/ui/components/input";
import { Label } from "@capstone-src/ui/components/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@capstone-src/ui/components/card";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { ArrowRight, Lock, Mail } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import Loader from "./loader";

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const navigate = useNavigate({ from: "/" });
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        { email: value.email, password: value.password },
        {
          onSuccess: () => {
            navigate({ to: "/dashboard" });
            toast.success("Sesión iniciada correctamente", { description: "Bienvenido de vuelta al sistema." });
          },
          onError: (error) => {
            toast.error("Error al iniciar sesión", { description: error.error.message || "Credenciales inválidas" });
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Correo electrónico inválido"),
        password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
      }),
    },
  });

  if (isPending) return <Loader />;

  return (
    <Card className="w-full bg-card border-border shadow-xl overflow-hidden rounded-3xl relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-amber-700" />
      <CardHeader className="space-y-3 pb-6 pt-8">
        <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
          Iniciar Sesión
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Ingresa tus credenciales para acceder a la plataforma del encargado de cumplimiento.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-5"
        >
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2 relative group">
                <Label htmlFor={field.name} className="text-sm font-medium text-foreground group-focus-within:text-primary transition-colors">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="encargado@empresa.com"
                    className="pl-9 bg-background border-input focus-visible:ring-primary/50 transition-all rounded-xl"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-sm font-medium text-destructive mt-1.5 animate-in slide-in-from-top-1">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <div className="space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <Label htmlFor={field.name} className="text-sm font-medium text-foreground group-focus-within:text-primary transition-colors">
                    Contraseña
                  </Label>
                  {/* Trabajos futuros: <a href="#" className="text-xs text-primary hover:underline transition-all">¿Olvidaste tu contraseña?</a> */}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 bg-background border-input focus-visible:ring-primary/50 transition-all rounded-xl"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-sm font-medium text-destructive mt-1.5 animate-in slide-in-from-top-1">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
            {({ canSubmit, isSubmitting }) => (
              <Button 
                type="submit" 
                className="w-full mt-2 bg-foreground text-background hover:bg-foreground/90 transition-all h-11 relative overflow-hidden group rounded-xl" 
                disabled={!canSubmit || isSubmitting}
              >
                <span className="relative z-10 flex items-center justify-center gap-2 font-semibold">
                  {isSubmitting ? "Autenticando..." : "Ingresar"}
                  {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
      
      <CardFooter className="pt-2 pb-8 justify-center border-t border-white/5 mt-4">
        <p className="text-sm text-muted-foreground mt-4">
          ¿No tienes una cuenta?{" "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors focus:outline-none focus-visible:underline"
          >
            Regístrate aquí
          </button>
        </p>
      </CardFooter>
    </Card>
  );
}
