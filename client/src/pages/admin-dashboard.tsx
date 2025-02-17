import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import {
  Card,
  CardContent,
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
import { Users, Package, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

type DashboardStats = {
  totalUsers: number;
  totalProducts: number;
  users: {
    id: number;
    username: string;
    businessName: string;
    phone: string;
    product_count: number;
  }[];
};

export default function AdminDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Debug logs para acompanhar o estado da autenticação
  useEffect(() => {
    console.log("AdminDashboard - Auth state:", {
      user,
      authLoading,
      isAdmin: user?.username === "admin@admin.com"
    });
  }, [user, authLoading]);

  // Aguarda o carregamento da autenticação
  if (authLoading) {
    console.log("AdminDashboard - Loading auth state");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Redireciona se não estiver autenticado
  if (!user) {
    console.log("AdminDashboard - No user, redirecting to auth");
    return <Redirect to="/auth" />;
  }

  // Verifica se é admin
  if (user.username !== "admin@admin.com") {
    console.log("AdminDashboard - Not admin user:", user.username);
    toast({
      title: "Acesso negado",
      description: "Você não tem permissão para acessar esta página.",
      variant: "destructive",
    });
    return <Redirect to="/" />;
  }

  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
    retry: false,
    refetchOnWindowFocus: false,
    onError: (error: any) => {
      console.error("AdminDashboard - Query error:", error);
      toast({
        title: "Erro",
        description: error?.message || "Erro ao carregar dados do painel admin",
        variant: "destructive",
      });
      if (error?.status === 401 || error?.status === 403) {
        logout();
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Erro ao carregar dados
        </h1>
        <p className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : "Tente fazer login novamente"}
        </p>
        <Button onClick={logout}>Fazer login novamente</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Painel de controle</h1>
        <Button variant="outline" onClick={logout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card className="bg-purple-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Clientes</CardTitle>
            <Users className="h-6 w-6 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold">{data.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Produtos</CardTitle>
            <Package className="h-6 w-6 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold">{data.totalProducts}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clientes:</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>email</TableHead>
                <TableHead>id</TableHead>
                <TableHead className="text-right">Qtd produtos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.businessName}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="text-right">{user.product_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}